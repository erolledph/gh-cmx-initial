import Link from 'next/link';
import { getAllPosts } from '@/lib/github';

export default async function Home() {
  const posts = await getAllPosts();

  return (
    <main>
      <h1>Blog Posts</h1>
      <Link href="/auth">Admin Login</Link>
      <hr />
      {posts.length === 0 ? (
        <p>No posts found</p>
      ) : (
        <ul>
          {posts.map((post) => (
            <li key={post.slug}>
              <Link href={`/${post.slug}`}>
                <h2>{post.title}</h2>
              </Link>
              <p>{post.description}</p>
              <small>By {post.author} on {String(post.publishDate)}</small>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
