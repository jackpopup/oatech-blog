import { NextRequest, NextResponse } from 'next/server';
import { recordView } from '@/lib/analytics';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      postSlug?: string;
      referrer?: string;
      userAgent?: string;
    };

    if (!body.postSlug) {
      return NextResponse.json({ error: 'postSlug is required' }, { status: 400 });
    }

    // 슬러그 유효성 검사
    if (/[^a-zA-Z0-9가-힣\-_]/.test(body.postSlug)) {
      return NextResponse.json({ error: 'Invalid postSlug' }, { status: 400 });
    }

    const userAgent =
      body.userAgent || req.headers.get('user-agent') || '';

    await recordView({
      postSlug: body.postSlug,
      referrer: body.referrer || req.headers.get('referer') || '',
      userAgent,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[analytics/view]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
