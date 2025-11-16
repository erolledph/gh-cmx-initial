// app/[slug]/page.tsx
import { getPostBySlug, getAllPosts } from '@/lib/github';
import type { Metadata } from 'next';
import Link from 'next/link';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://jumble.sbs';

interface PostParams {
  slug: string;
}

interface PageProps {
  params: Promise<PostParams>;
}

export async function generateStaticParams(): Promise<PostParams[]> {
  const posts = await getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const post = await getPostBySlug(slug);

    if (!post) {
      return { title: 'Post Not Found' };
    }

    return {
      title: post.title,
      description: post.description || post.content.substring(0, 160),
      authors: post.author ? [{ name: post.author }] : undefined,
      keywords: post.keywords,
      openGraph: {
        title: post.title,
        description: post.description || post.content.substring(0, 160),
        url: post.canonicalUrl || `${siteUrl}/${slug}`,
        type: 'article',
        publishedTime: post.publishDate,
        modifiedTime: post.publishDate,
        authors: post.author ? [post.author] : undefined,
        images: post.ogImage
          ? [{ url: post.ogImage, width: 1200, height: 630, alt: post.title }]
          : [{ url: `${siteUrl}/og-image.svg`, width: 1200, height: 630, alt: post.title }],
      },
      twitter: {
        card: 'summary_large_image',
        title: post.title,
        description: post.description || post.content.substring(0, 160),
        images: post.ogImage ? [post.ogImage] : [`${siteUrl}/og-image.svg`],
      },
      alternates: {
        canonical: post.canonicalUrl || `${siteUrl}/${slug}`,
      },
    };
  } catch (error) {
    return { title: 'Blog Post' };
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return (
      <main className="min-h-screen px-4 py-12">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold">Post not found</h1>
            <Link href="/" className="text-blue-500 hover:underline">
              Return to home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description || post.content.substring(0, 160),
    url: post.canonicalUrl || `${siteUrl}/${slug}`,
    datePublished: post.publishDate,
    dateModified: post.publishDate,
    author: {
      '@type': 'Person',
      name: post.author || 'Admin',
      url: `${siteUrl}/about`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Blog',
      url: siteUrl,
    },
    image: {
      '@type': 'ImageObject',
      url: post.ogImage || `${siteUrl}/og-image.svg`,
      width: 1200,
      height: 630,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': post.canonicalUrl || `${siteUrl}/${slug}`,
    },
    keywords: post.keywords,
    articleBody: post.content,
    wordCount: post.content.split(/\s+/).length,
    inLanguage: 'en-US',
  };

  return (
    <>
      <main className="min-h-screen px-4 py-12">
        <article className="mx-auto max-w-3xl">
          <Link href="/" className="text-blue-500 hover:underline mb-4 inline-block">
            ← Back to posts
          </Link>

          <header className="mb-8">
            <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
            {post.description && (
              <p className="text-xl text-gray-600 mb-4">{post.description}</p>
            )}
            <div className="text-sm text-gray-500">
              {post.author && <span>By {post.author}</span>}
              {post.author && post.publishDate && <span> • </span>}
              {post.publishDate && <time dateTime={post.publishDate}>{post.publishDate}</time>}
            </div>
          </header>

          <div className="prose prose-lg max-w-none">
            {post.content.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </article>
      </main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </>
  );
}
