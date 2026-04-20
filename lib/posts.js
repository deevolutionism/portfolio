import fs from 'fs';
import path from 'path';
import {unified} from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import { rehype } from 'rehype';
import matter from 'gray-matter';
import { globSync } from 'glob'
import rehypeHighlight from 'rehype-highlight'
import { resolveContentAssetReferencesInHtml, resolveContentAssetUrl } from './asset-urls.mjs'

const postsDirectory = path.join(process.cwd(), 'posts');
export const POSTS_PER_PAGE = 5;

function getPostFileNames() {
  return globSync('*.md', { cwd: postsDirectory }).sort();
}

function readPostFile(fileName) {
  const fullPath = path.join(postsDirectory, fileName);
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  return matter(fileContents);
}

function normalizeDraft(draft) {
  if (typeof draft === 'boolean') {
    return draft;
  }

  if (typeof draft === 'number') {
    return draft === 1;
  }

  if (typeof draft === 'string') {
    return ['1', 'true', 'yes'].includes(draft.trim().toLowerCase());
  }

  return false;
}

function withoutDraft(metadata) {
  const postMetadata = { ...metadata };
  delete postMetadata.draft;

  return postMetadata;
}

function normalizeTags(tags) {
  if (Array.isArray(tags)) {
    return tags.map((tag) => String(tag).trim()).filter(Boolean);
  }

  if (typeof tags === 'string') {
    return tags.split(',').map((tag) => tag.trim()).filter(Boolean);
  }

  return [];
}

function normalizeString(value) {
  if (typeof value === 'string') {
    return value.trim();
  }

  if (value == null) {
    return '';
  }

  return String(value).trim();
}

function remarkContentAssetUrls() {
  return function transformContentAssetUrls(tree) {
    function visit(node) {
      if (!node || typeof node !== 'object') {
        return
      }

      if (
        ['definition', 'image', 'link'].includes(node.type) &&
        typeof node.url === 'string'
      ) {
        node.url = resolveContentAssetUrl(node.url)
      }

      if (node.type === 'html' && typeof node.value === 'string') {
        node.value = resolveContentAssetReferencesInHtml(node.value)
      }

      if (Array.isArray(node.children)) {
        node.children.forEach(visit)
      }
    }

    visit(tree)
  }
}

export function getSortedPostsData() {
  const fileNames = getPostFileNames();
  const allPostsData = fileNames.flatMap((fileName) => {
    // Remove ".md" from file name to get id
    const id = fileName.replace(/\.md$/, '');

    // Use gray-matter to parse the post metadata section
    const matterResult = readPostFile(fileName);

    if (normalizeDraft(matterResult.data.draft)) {
      return [];
    }

    const metadata = withoutDraft(matterResult.data);
    const tags = normalizeTags(matterResult.data.tags);

    // Combine the data with the id
    return [{
      id,
      ...metadata,
      date: normalizeString(matterResult.data.date),
      image: resolveContentAssetUrl(normalizeString(matterResult.data.image)),
      tags,
      title: normalizeString(matterResult.data.title) || id,
    }];
  });
  // Sort posts by date
  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    }

    if (a.date > b.date) {
      return -1;
    }

    return a.id.localeCompare(b.id);
  });
}

export function getPaginatedPostsData(page = 1, pageSize = POSTS_PER_PAGE) {
  const allPostsData = getSortedPostsData();
  const totalPosts = allPostsData.length;
  const totalPages = Math.max(1, Math.ceil(totalPosts / pageSize));
  const currentPage = Math.min(Math.max(Number(page) || 1, 1), totalPages);
  const startIndex = (currentPage - 1) * pageSize;

  return {
    posts: allPostsData.slice(startIndex, startIndex + pageSize),
    pagination: {
      currentPage,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
      nextPage: currentPage < totalPages ? currentPage + 1 : null,
      pageSize,
      previousPage: currentPage > 1 ? currentPage - 1 : null,
      totalPages,
      totalPosts,
    },
  };
}

export function getPaginatedPostPaths() {
  const { pagination } = getPaginatedPostsData();

  return Array.from({ length: Math.max(pagination.totalPages - 1, 0) }, (_, index) => ({
    params: {
      page: String(index + 2),
    },
  }));
}

export function getAllPostIds() {
  const fileNames = getPostFileNames();

  // Returns an array that looks like this:
  // [
  //   {
  //     params: {
  //       id: 'bitcoin-progress'
  //     }
  //   },
  //   {
  //     params: {
  //       id: 'fake-love'
  //     }
  //   }
  // ]
  return fileNames.flatMap((fileName) => {
    const matterResult = readPostFile(fileName);

    if (normalizeDraft(matterResult.data.draft)) {
      return [];
    }

    return {
      params: {
        id: fileName.replace(/\.md$/, ''),
      },
    };
  });
}

export async function getPostData(id) {
  // Use gray-matter to parse the post metadata section
  const matterResult = readPostFile(`${id}.md`);

  // Use remark to convert markdown into HTML string
  const processedContent = await unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkContentAssetUrls)
  .use(remarkRehype, {allowDangerousHtml: true})
  .use(rehypeStringify, {allowDangerousHtml: true})
  .process(matterResult.content)

  const styledContent = await rehype()
    .data('settings', {fragment: true})
    .use(rehypeHighlight)
    .process(processedContent)

  const contentHtml = String(styledContent)
  const metadata = withoutDraft(matterResult.data);
  // Combine the data with the id and contentHtml
  return {
    id,
    contentHtml,
    ...metadata,
    date: normalizeString(matterResult.data.date),
    image: resolveContentAssetUrl(normalizeString(matterResult.data.image)),
    tags: normalizeTags(matterResult.data.tags),
    title: normalizeString(matterResult.data.title) || id,
  };
}
