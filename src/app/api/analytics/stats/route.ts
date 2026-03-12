import { NextRequest, NextResponse } from 'next/server';
import { getAnalyticsStats } from '@/lib/analytics';
import { getAdminSession } from '@/lib/admin';

export async function GET(req: NextRequest) {
  try {
    // 관리자 인증 확인
    const authHeader = req.headers.get('authorization');
    const accessToken = authHeader?.replace('Bearer ', '') ?? '';
    const user = await getAdminSession(accessToken);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stats = await getAnalyticsStats();
    return NextResponse.json(stats);
  } catch (err) {
    console.error('[analytics/stats]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
