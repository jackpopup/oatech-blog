import { NextRequest, NextResponse } from 'next/server';
import {
  getAdminSession,
  listGenerationLogs,
  createGenerationLog,
} from '@/lib/admin';
import type { GenerationLog } from '@/lib/admin';

async function authenticate(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const accessToken = authHeader?.replace('Bearer ', '') ?? '';
  return getAdminSession(accessToken);
}

export async function GET(req: NextRequest) {
  try {
    const user = await authenticate(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') as GenerationLog['status'] | null;
    const page = parseInt(searchParams.get('page') ?? '1', 10);
    const limit = parseInt(searchParams.get('limit') ?? '20', 10);

    const res = await listGenerationLogs({
      status: status ?? undefined,
      page,
      limit,
    });
    return NextResponse.json(res);
  } catch (err) {
    console.error('[admin/logs GET]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await authenticate(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = (await req.json()) as {
      keyword?: string;
      postSlug?: string;
      status?: GenerationLog['status'];
      model?: string;
      tokensUsed?: number;
      errorMessage?: string;
    };

    if (!body.keyword || !body.status || !body.model) {
      return NextResponse.json(
        { error: 'keyword, status, model are required' },
        { status: 400 },
      );
    }

    const log = await createGenerationLog({
      keyword: body.keyword,
      postSlug: body.postSlug,
      status: body.status,
      model: body.model,
      tokensUsed: body.tokensUsed,
      errorMessage: body.errorMessage,
    });

    return NextResponse.json(log, { status: 201 });
  } catch (err) {
    console.error('[admin/logs POST]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
