import { NextRequest, NextResponse } from 'next/server';
import { bkendAuth } from '@/lib/bkend';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (authHeader) {
      // 토큰이 있으면 bkend에도 로그아웃 처리
      await bkendAuth.signout().catch(() => {
        // 무시 - 이미 만료된 토큰이어도 클라이언트 정리는 진행
      });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[admin/auth/signout]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
