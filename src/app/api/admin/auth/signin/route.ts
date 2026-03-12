import { NextRequest, NextResponse } from 'next/server';
import { bkendAuth } from '@/lib/bkend';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { email?: string; password?: string };

    if (!body.email || !body.password) {
      return NextResponse.json(
        { error: 'email and password are required' },
        { status: 400 },
      );
    }

    const res = await bkendAuth.signin(body.email, body.password);

    return NextResponse.json({
      user: res.user,
      accessToken: res.accessToken,
      refreshToken: res.refreshToken,
    });
  } catch (err) {
    console.error('[admin/auth/signin]', err);
    const status = (err as { status?: number }).status === 401 ? 401 : 500;
    return NextResponse.json(
      { error: status === 401 ? 'Invalid credentials' : 'Internal server error' },
      { status },
    );
  }
}
