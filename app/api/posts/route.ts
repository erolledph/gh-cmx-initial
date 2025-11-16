import { NextRequest, NextResponse } from 'next/server';
import { createPost } from '@/lib/github';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  const isAdmin = request.cookies.get('admin-auth')?.value === 'true';

  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const postData = await request.json();
  const success = await createPost(postData);

  if (success) {
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
}
