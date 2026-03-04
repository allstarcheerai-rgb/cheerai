import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function PATCH(
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

    const updated = await db.project.update({
      where: { id },
      data: { pinned: !project.pinned },
    });

    return NextResponse.json({ project: updated });
  } catch (err) {
    console.error('[PATCH /api/projects/[id]/pin]', err);
    return NextResponse.json({ error: 'Failed to toggle pin.' }, { status: 500 });
  }
}
