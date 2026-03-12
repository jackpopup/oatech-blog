import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession, updateKeyword, deleteKeyword } from '@/lib/admin';
import type { Keyword } from '@/lib/admin';

interface RouteContext {
  params: Promise<{ id: string }>;
}

async function authenticate(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const accessToken = authHeader?.replace('Bearer ', '') ?? '';
  return getAdminSession(accessToken);
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    const user = await authenticate(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = (await req.json()) as Partial<Keyword>;

    const updated = await updateKeyword(id, body);
    return NextResponse.json(updated);
  } catch (err) {
    console.error('[admin/keywords PATCH]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const user = await authenticate(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    await deleteKeyword(id);
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error('[admin/keywords DELETE]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
