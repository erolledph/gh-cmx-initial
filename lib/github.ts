// lib/github.ts
const OWNER = process.env.GITHUB_OWNER || '';
const REPO = process.env.GITHUB_REPO || '';
const TOKEN = process.env.GITHUB_TOKEN || '';

const BASE_URL = `https://api.github.com/repos/${OWNER}/${REPO}`;

interface PostFile {
  name: string;
  path: string;
  download_url: string;
}

interface Post {
  slug: string;
  title: string;
  description?: string;
  author?: string;
  publishDate?: string;
  keywords?: string[];
  ogImage?: string;
  canonicalUrl?: string;
  content: string;
}

async function fetchWithAuth(url: string) {
  const res = await fetch(url, {
    headers: {
      Authorization: `token ${TOKEN}`,
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'nextjs-blog',
    },
    // Cache for 1 minute during build
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`GitHub API error ${res.status}: ${text.substring(0, 200)}`);
  }

  return res.json();
}

export async function getAllPosts(): Promise<Post[]> {
  if (!OWNER || !REPO || !TOKEN) {
    console.warn('GitHub environment variables not set');
    return [];
  }

  try {
    const files: PostFile[] = await fetchWithAuth(`${BASE_URL}/contents/app/posts`);

    const posts = await Promise.all(
      files
        .filter((f) => f.name.endsWith('.md'))
        .map(async (file) => {
          const post = await getPostBySlug(file.name.replace('.md', ''));
          return post;
        })
    );

    return posts.filter((p): p is Post => !!p);
  } catch (error) {
    console.error('Failed to fetch posts:', error);
    return [];
  }
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  if (!OWNER || !REPO || !TOKEN) {
    return null;
  }

  try {
    const file: PostFile = await fetchWithAuth(`${BASE_URL}/contents/app/posts/${slug}.md`);

    const raw = await fetch(file.download_url);
    const content = await raw.text();

    // Simple frontmatter parser
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    let metadata: any = {};
    let body = content;

    if (frontmatterMatch) {
      body = frontmatterMatch[2];
      const lines = frontmatterMatch[1].split('\n');
      lines.forEach((line) => {
        const [key, ...val] = line.split(':');
        if (key && val) {
          metadata[key.trim()] = val.join(':').trim().replace(/^["']|["']$/g, '');
        }
      });
    }

    return {
      slug,
      title: metadata.title || slug.replace(/-/g, ' '),
      description: metadata.description,
      author: metadata.author,
      publishDate: metadata.date,
      keywords: metadata.keywords?.split(',').map((k: string) => k.trim()),
      ogImage: metadata.ogImage,
      canonicalUrl: metadata.canonicalUrl,
      content: body.trim(),
    };
  } catch (error) {
    console.warn(`Failed to load post: ${slug}`, error);
    return null;
  }
}

export async function createPost(postData: {
  slug: string;
  title: string;
  description?: string;
  author?: string;
  publishDate?: string;
  keywords?: string;
  ogImage?: string;
  canonicalUrl?: string;
  content: string;
}): Promise<boolean> {
  if (!OWNER || !REPO || !TOKEN) {
    console.error('GitHub environment variables not set');
    return false;
  }

  try {
    const frontmatter = `---
title: ${postData.title}
description: ${postData.description || ''}
author: ${postData.author || ''}
publishDate: ${postData.publishDate || ''}
keywords: ${postData.keywords || ''}
ogImage: ${postData.ogImage || ''}
canonicalUrl: ${postData.canonicalUrl || ''}
---

${postData.content}`;

    const encoded = Buffer.from(frontmatter).toString('base64');

    const res = await fetch(`${BASE_URL}/contents/app/posts/${postData.slug}.md`, {
      method: 'PUT',
      headers: {
        Authorization: `token ${TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'nextjs-blog',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Create post: ${postData.title}`,
        content: encoded,
      }),
    });

    return res.ok;
  } catch (error) {
    console.error('Failed to create post:', error);
    return false;
  }
}
