import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// GET /api/templates/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const template = await db.template.findFirst({
      where: {
        id,
        OR: [{ isSystem: true }, { userId: session.user.id }],
      },
    });

    if (!template) return NextResponse.json({ error: 'Template not found.' }, { status: 404 });
    return NextResponse.json({ template });
  } catch (err) {
    console.error('[GET /api/templates/[id]]', err);
    return NextResponse.json({ error: 'Failed to load template.' }, { status: 500 });
  }
}

// PATCH /api/templates/[id] — update user's own template
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const template = await db.template.findFirst({
      where: { id, userId: session.user.id, isSystem: false },
    });
    if (!template) return NextResponse.json({ error: 'Template not found.' }, { status: 404 });

    const body = await req.json();
    const updated = await db.template.update({
      where: { id },
      data: {
        title: body.title ?? template.title,
        description: body.description ?? template.description,
        tags: body.tags ?? template.tags,
      },
    });

    return NextResponse.json({ template: updated });
  } catch (err) {
    console.error('[PATCH /api/templates/[id]]', err);
    return NextResponse.json({ error: 'Failed to update template.' }, { status: 500 });
  }
}

// DELETE /api/templates/[id] — delete user's own template
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const template = await db.template.findFirst({
      where: { id, userId: session.user.id, isSystem: false },
    });
    if (!template) return NextResponse.json({ error: 'Template not found.' }, { status: 404 });

    await db.template.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[DELETE /api/templates/[id]]', err);
    return NextResponse.json({ error: 'Failed to delete template.' }, { status: 500 });
  }
}
