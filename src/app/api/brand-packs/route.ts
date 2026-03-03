import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const packs = await db.brandPack.findMany({
      orderBy: [{ featured: 'desc' }, { name: 'asc' }],
    });
    return NextResponse.json({ packs });
  } catch (error) {
    console.error('[brand-packs GET]', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

// Admin only — create a brand pack
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin only.' }, { status: 403 });
    }

    const body = await req.json();
    const { name, vibe, description, colors, tone, emoji, exampleCopy, featured } = body;

    if (!name || !vibe || !colors || !tone) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    const pack = await db.brandPack.create({
      data: {
        name,
        vibe,
        description: description ?? '',
        colors: typeof colors === 'string' ? colors : JSON.stringify(colors),
        tone,
        emoji: emoji ?? '✨',
        exampleCopy: exampleCopy ?? '',
        featured: featured ?? false,
      },
    });

    return NextResponse.json({ pack }, { status: 201 });
  } catch (error) {
    console.error('[brand-packs POST]', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
