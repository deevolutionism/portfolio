import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import sharp from 'sharp';
import {
  DEFAULT_CONTENT_ASSET_BUCKET,
  DEFAULT_CONTENT_ASSET_DIR,
  getContentAssetBaseUrl,
  resolveContentAssetUrl,
} from '../lib/asset-urls.mjs';

const args = new Set(process.argv.slice(2));
const processOnly = args.has('--process-only');
const assetDir = process.env.ASSET_DIR || DEFAULT_CONTENT_ASSET_DIR;
const processedDir = process.env.ASSET_PROCESSED_DIR || '.content-assets-processed';
const bucket = process.env.ASSET_BUCKET || DEFAULT_CONTENT_ASSET_BUCKET;
const baseUrl = getContentAssetBaseUrl({ bucket });
const cacheControl = process.env.ASSET_CACHE_CONTROL || 'public,max-age=31536000,immutable';
const awsProfile = process.env.AWS_PROFILE ?? 'deploy';
const manifestFileName = '.manifest.json';
const manifestPath = path.join(processedDir, manifestFileName);
const ignoredNames = new Set(['.gitkeep', '.DS_Store', manifestFileName]);
const processableImageExtensions = new Set(['.avif', '.jpeg', '.jpg', '.png', '.tif', '.tiff', '.webp']);

function parsePositiveInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parseOptionalPositiveInteger(value) {
  if (!value) {
    return undefined;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

const processingSettings = {
  maxHeight: parseOptionalPositiveInteger(process.env.ASSET_MAX_HEIGHT),
  maxWidth: parsePositiveInteger(process.env.ASSET_MAX_WIDTH, 612),
  quality: parsePositiveInteger(process.env.ASSET_QUALITY, 82),
  version: 1,
};

function collectFiles(directory, root = directory) {
  if (!fs.existsSync(directory)) {
    return [];
  }

  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);

    if (ignoredNames.has(entry.name)) {
      return [];
    }

    if (entry.isDirectory()) {
      return collectFiles(fullPath, root);
    }

    if (!entry.isFile()) {
      return [];
    }

    return [path.relative(root, fullPath)];
  });
}

function ensureDirectory(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function formatBytes(value) {
  if (value < 1024) {
    return `${value} B`;
  }

  if (value < 1024 * 1024) {
    return `${(value / 1024).toFixed(1)} KiB`;
  }

  return `${(value / 1024 / 1024).toFixed(1)} MiB`;
}

function loadManifest() {
  if (!fs.existsSync(manifestPath)) {
    return { files: {} };
  }

  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    return {
      files: manifest.files || {},
    };
  } catch {
    return { files: {} };
  }
}

function saveManifest(manifest) {
  fs.mkdirSync(processedDir, { recursive: true });
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}

function createCacheKey(sourcePath, relativePath) {
  const hash = crypto.createHash('sha256');
  hash.update(fs.readFileSync(sourcePath));
  hash.update(relativePath);
  hash.update(JSON.stringify(processingSettings));
  return hash.digest('hex');
}

function toPublicUrl(relativePath) {
  return resolveContentAssetUrl(`${assetDir}/${relativePath}`, { assetDir, baseUrl, bucket });
}

function isProcessableImage(relativePath) {
  return processableImageExtensions.has(path.extname(relativePath).toLowerCase());
}

async function processImage(sourcePath, destinationPath, relativePath) {
  const extension = path.extname(relativePath).toLowerCase();
  let pipeline = sharp(sourcePath, { failOn: 'none' })
    .rotate()
    .resize({
      fit: 'inside',
      height: processingSettings.maxHeight,
      width: processingSettings.maxWidth,
      withoutEnlargement: true,
    });

  if (extension === '.jpg' || extension === '.jpeg') {
    pipeline = pipeline.jpeg({ mozjpeg: true, quality: processingSettings.quality });
  } else if (extension === '.png') {
    pipeline = pipeline.png({ adaptiveFiltering: true, compressionLevel: 9 });
  } else if (extension === '.webp') {
    pipeline = pipeline.webp({ quality: processingSettings.quality });
  } else if (extension === '.avif') {
    pipeline = pipeline.avif({ quality: processingSettings.quality });
  } else if (extension === '.tif' || extension === '.tiff') {
    pipeline = pipeline.tiff({ quality: processingSettings.quality });
  }

  const temporaryPath = `${destinationPath}.${process.pid}.tmp`;
  await pipeline.toFile(temporaryPath);
  fs.renameSync(temporaryPath, destinationPath);
}

async function prepareAsset(relativePath, manifest) {
  const sourcePath = path.join(assetDir, relativePath);
  const destinationPath = path.join(processedDir, relativePath);
  const originalSize = fs.statSync(sourcePath).size;
  const cacheKey = createCacheKey(sourcePath, relativePath);
  const cached = manifest.files[relativePath];

  if (cached?.cacheKey === cacheKey && fs.existsSync(destinationPath)) {
    return {
      ...cached,
      relativePath,
      status: 'reused',
    };
  }

  ensureDirectory(destinationPath);

  if (isProcessableImage(relativePath)) {
    await processImage(sourcePath, destinationPath, relativePath);
  } else {
    fs.copyFileSync(sourcePath, destinationPath);
  }

  const processedSize = fs.statSync(destinationPath).size;
  const result = {
    cacheKey,
    originalSize,
    processedSize,
    relativePath,
    status: isProcessableImage(relativePath) ? 'processed' : 'copied',
  };

  manifest.files[relativePath] = {
    cacheKey,
    originalSize,
    processedSize,
  };

  return result;
}

function removeStaleProcessedFiles(files, manifest) {
  const currentFiles = new Set(files);

  Object.keys(manifest.files).forEach((file) => {
    if (!currentFiles.has(file)) {
      delete manifest.files[file];
    }
  });

  collectFiles(processedDir).forEach((file) => {
    if (!currentFiles.has(file)) {
      fs.rmSync(path.join(processedDir, file), { force: true });
    }
  });
}

function printAssetReferences(files) {
  console.log('\nPublic URLs:');
  files.sort().forEach((file) => {
    console.log(toPublicUrl(file));
  });

  console.log('\nMarkdown references:');
  files.sort().forEach((file) => {
    console.log(`${assetDir}/${file.split(path.sep).join('/')}`);
  });
}

const files = collectFiles(assetDir);

if (files.length === 0) {
  console.log(`No assets found in ${assetDir}. Add image files there, then run this command again.`);
  process.exit(0);
}

const manifest = loadManifest();
removeStaleProcessedFiles(files, manifest);

const results = [];

for (const file of files) {
  results.push(await prepareAsset(file, manifest));
}

saveManifest(manifest);

const originalSize = results.reduce((total, result) => total + result.originalSize, 0);
const processedSize = results.reduce((total, result) => total + result.processedSize, 0);
const processedCount = results.filter((result) => result.status === 'processed').length;
const copiedCount = results.filter((result) => result.status === 'copied').length;
const reusedCount = results.filter((result) => result.status === 'reused').length;

console.log(
  `Prepared ${results.length} asset${results.length === 1 ? '' : 's'} in ${processedDir}/ ` +
    `(${formatBytes(originalSize)} -> ${formatBytes(processedSize)}).`
);
console.log(`Processed ${processedCount}, copied ${copiedCount}, reused ${reusedCount}.`);
printAssetReferences(files);

if (processOnly) {
  process.exit(0);
}

const awsArgs = [
  's3',
  'sync',
  `${processedDir}/`,
  `s3://${bucket}/`,
  '--exclude',
  manifestFileName,
  '--exclude',
  '.DS_Store',
  '--cache-control',
  cacheControl,
  '--acl',
  'public-read',
  '--no-progress',
];

console.log(`\nUploading prepared assets to s3://${bucket}/`);

const result = spawnSync('aws', awsArgs, {
  env: {
    ...process.env,
    ...(awsProfile ? { AWS_PROFILE: awsProfile } : {}),
  },
  stdio: 'inherit',
});

if (result.error) {
  console.error(`Failed to run AWS CLI: ${result.error.message}`);
  process.exit(1);
}

if (result.status !== 0) {
  process.exit(result.status || 1);
}
