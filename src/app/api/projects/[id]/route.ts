import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    const project = await db.project.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!project) return NextResponse.json({ error: 'Not found.' }, { status: 404 });

    return NextResponse.json({ project });
  } catch (error) {
    console.error('[project GET]', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    const existing = await db.project.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!existing) return NextResponse.json({ error: 'Not found.' }, { status: 404 });

    const { title, tags } = await req.json();
    const updated = await db.project.update({
      where: { id },
      data: { ...(title && { title }), ...(tags !== undefined && { tags }) },
    });

    return NextResponse.json({ project: updated });
  } catch (error) {
    console.error('[project PATCH]', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    const existing = await db.project.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!existing) return NextResponse.json({ error: 'Not found.' }, { status: 404 });

    await db.project.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[project DELETE]', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
