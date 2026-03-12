import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const accessToken = authHeader?.replace('Bearer ', '') ?? '';

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getAdminSession(accessToken);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ user });
  } catch (err) {
    console.error('[admin/auth/me]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
