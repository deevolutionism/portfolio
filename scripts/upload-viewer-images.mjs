// Publish larger viewing copies of explicitly selected, already-public images.
import fs from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'
import { spawnSync } from 'node:child_process'
import sharp from 'sharp'
import { DEFAULT_CONTENT_ASSET_BUCKET } from '../lib/asset-urls.mjs'

const files = process.argv.slice(2)
if (!files.length) throw new Error('Pass filenames relative to content-assets/, e.g. screenshot.png')
const sourceRoot = path.resolve('content-assets')
const outputRoot = path.resolve('.content-assets-processed/viewer')
const manifestPath = 'lib/image-viewer-sources.json'
const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'))
await fs.mkdir(outputRoot, { recursive: true })

for (const name of files) {
  const source = path.resolve(sourceRoot, name)
  if (!source.startsWith(sourceRoot + path.sep) || !/\.(png|jpe?g|webp|avif)$/i.test(name)) throw new Error(`Unsupported image path: ${name}`)
  const input = await fs.readFile(source)
  const metadata = await sharp(input).metadata()
  if ((metadata.pages || 1) > 1) throw new Error(`Animated images need a separate viewing copy: ${name}`)
  const hash = crypto.createHash('sha256').update(input).update('viewer-v1-2560-90').digest('hex').slice(0, 16)
  const key = `viewer/${hash}.webp`
  const output = path.join(outputRoot, `${hash}.webp`)
  await sharp(input).rotate().resize({ width: 2560, height: 2560, fit: 'inside', withoutEnlargement: true }).webp({ quality: 90 }).toFile(output)
  const result = spawnSync('aws', ['s3', 'cp', output, `s3://${DEFAULT_CONTENT_ASSET_BUCKET}/${key}`, '--profile', process.env.AWS_PROFILE || 'deploy', '--content-type', 'image/webp', '--cache-control', 'public,max-age=31536000,immutable', '--acl', 'public-read', '--only-show-errors'], { stdio: 'inherit' })
  if (result.error || result.status !== 0) throw new Error(`Upload failed: ${name}`)
  manifest[name.split(path.sep).join('/')] = key
  console.log(`${name}: ${metadata.width}×${metadata.height} source → ${key}`)
}

// Only point the application at files that were successfully published.
const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)))
await fs.writeFile(manifestPath, JSON.stringify(sorted, null, 2) + '\n')
