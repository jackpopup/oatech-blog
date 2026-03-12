import { NextRequest, NextResponse } from 'next/server';
import { getPopularPosts } from '@/lib/analytics';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10', 10), 50);

    const popularPosts = await getPopularPosts(limit);
    return NextResponse.json({ data: popularPosts });
  } catch (err) {
    console.error('[analytics/popular]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
