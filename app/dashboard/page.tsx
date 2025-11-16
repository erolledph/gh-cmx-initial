import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <Link href="/create">Create New Blog Post</Link>
      <hr />
      <Link href="/">View All Posts</Link>
    </div>
  );
}
