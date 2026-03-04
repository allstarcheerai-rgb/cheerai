import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// GET /api/templates?category=&search=&system=
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || '';
    const search = searchParams.get('search') || '';
    const systemOnly = searchParams.get('system') === 'true';

    const templates = await db.template.findMany({
      where: {
        AND: [
          category ? { category } : {},
          search ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
              { tags: { contains: search, mode: 'insensitive' } },
            ],
          } : {},
          systemOnly
            ? { isSystem: true }
            : { OR: [{ isSystem: true }, { userId: session.user.id }] },
        ],
      },
      orderBy: [{ isSystem: 'desc' }, { usageCount: 'desc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        title: true,
        category: true,
        description: true,
        inputSchema: true,
        defaultValues: true,
        tags: true,
        isSystem: true,
        usageCount: true,
        userId: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ templates });
  } catch (err) {
    console.error('[GET /api/templates]', err);
    return NextResponse.json({ error: 'Failed to load templates.' }, { status: 500 });
  }
}

// POST /api/templates — create a custom user template (Pro only)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const isPro = session.user.subscription === 'pro' || session.user.subscription === 'annual';
    if (!isPro) {
      return NextResponse.json({ error: 'Pro subscription required to create custom templates.' }, { status: 403 });
    }

    const body = await req.json();
    const { title, category, description, promptTemplate, inputSchema, defaultValues, tags } = body;

    if (!title || !category || !description || !promptTemplate) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    const template = await db.template.create({
      data: {
        title,
        category,
        description,
        promptTemplate,
        inputSchema: inputSchema ? JSON.stringify(inputSchema) : '[]',
        defaultValues: defaultValues ? JSON.stringify(defaultValues) : '{}',
        tags: tags || '',
        isSystem: false,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ template }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/templates]', err);
    return NextResponse.json({ error: 'Failed to create template.' }, { status: 500 });
  }
}
