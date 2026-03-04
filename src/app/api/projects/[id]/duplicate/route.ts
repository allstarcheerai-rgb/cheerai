import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const project = await db.project.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!project) return NextResponse.json({ error: 'Project not found.' }, { status: 404 });

    const duplicate = await db.project.create({
      data: {
        userId: session.user.id,
        title: `${project.title} (Copy)`,
        type: project.type,
        content: project.content,
        outputImages: project.outputImages,
        tags: project.tags,
        pinned: false,
      },
    });

    return NextResponse.json({ project: duplicate }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/projects/[id]/duplicate]', err);
    return NextResponse.json({ error: 'Failed to duplicate project.' }, { status: 500 });
  }
}
