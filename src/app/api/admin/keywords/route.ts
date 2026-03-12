import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession, listKeywords, createKeyword } from '@/lib/admin';

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
    const category = searchParams.get('category') ?? undefined;
    const usedParam = searchParams.get('used');
    const used = usedParam !== null ? usedParam === 'true' : undefined;
    const page = parseInt(searchParams.get('page') ?? '1', 10);
    const limit = parseInt(searchParams.get('limit') ?? '50', 10);

    const res = await listKeywords({ category, used, page, limit });
    return NextResponse.json(res);
  } catch (err) {
    console.error('[admin/keywords GET]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await authenticate(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = (await req.json()) as {
      keyword?: string;
      subKeywords?: string[];
      category?: string;
      priority?: number;
    };

    if (!body.keyword || !body.category) {
      return NextResponse.json(
        { error: 'keyword and category are required' },
        { status: 400 },
      );
    }

    const keyword = await createKeyword({
      keyword: body.keyword,
      subKeywords: body.subKeywords,
      category: body.category,
      priority: body.priority,
    });

    return NextResponse.json(keyword, { status: 201 });
  } catch (err) {
    console.error('[admin/keywords POST]', err);
    const status = (err as { status?: number }).status === 409 ? 409 : 500;
    return NextResponse.json(
      { error: status === 409 ? 'Keyword already exists' : 'Internal server error' },
      { status },
    );
  }
}
