import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession, getDashboardStats } from '@/lib/admin';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const accessToken = authHeader?.replace('Bearer ', '') ?? '';

    const user = await getAdminSession(accessToken);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stats = await getDashboardStats();
    return NextResponse.json(stats);
  } catch (err) {
    console.error('[admin/dashboard]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
