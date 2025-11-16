'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreatePostPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    author: '',
    publishDate: new Date().toISOString().split('T')[0],
    keywords: '',
    ogImage: '',
    canonicalUrl: '',
  });
  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('Creating post...');

    const slug = generateSlug(formData.title);

    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, slug }),
    });

    if (res.ok) {
      setMessage('Post created successfully!');
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } else {
      setMessage('Error creating post');
    }
  };

  return (
    <div>
      <h1>Create New Blog Post</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Title (required):</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Meta Description (required):</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="SEO meta description (150-160 characters recommended)"
            required
          />
        </div>

        <div>
          <label>Content (required):</label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows={10}
            required
          />
        </div>

        <div>
          <label>Author (required):</label>
          <input
            type="text"
            name="author"
            value={formData.author}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Publish Date (required):</label>
          <input
            type="date"
            name="publishDate"
            value={formData.publishDate}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Keywords (for SEO):</label>
          <input
            type="text"
            name="keywords"
            value={formData.keywords}
            onChange={handleChange}
            placeholder="keyword1, keyword2, keyword3"
          />
        </div>

        <div>
          <label>OG Image URL (for social sharing):</label>
          <input
            type="url"
            name="ogImage"
            value={formData.ogImage}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div>
          <label>Canonical URL (optional):</label>
          <input
            type="url"
            name="canonicalUrl"
            value={formData.canonicalUrl}
            onChange={handleChange}
            placeholder="https://example.com/original-post"
          />
        </div>

        <button type="submit">Create Post</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}
