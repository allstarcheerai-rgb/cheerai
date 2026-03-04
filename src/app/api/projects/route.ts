import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, isPro } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    if (!isPro(session.user.subscription)) {
      return NextResponse.json({ error: 'Pro subscription required.' }, { status: 402 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') ?? '';
    const type = searchParams.get('type') ?? '';

    const projects = await db.project.findMany({
      where: {
        userId: session.user.id,
        ...(type ? { type } : {}),
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: 'insensitive' } },
                { tags: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ projects });
  } catch (error) {
    console.error('[projects GET]', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    if (!isPro(session.user.subscription)) {
      return NextResponse.json({ error: 'Pro subscription required.' }, { status: 402 });
    }

    const body = await req.json();
    const { title, type, content, tags, outputImages } = body;

    if (!title || !type || !content) {
      return NextResponse.json({ error: 'Title, type, and content are required.' }, { status: 400 });
    }

    const project = await db.project.create({
      data: {
        userId: session.user.id,
        title,
        type,
        content,
        tags: tags ?? '',
        outputImages: outputImages ?? null,
      },
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error('[projects POST]', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
