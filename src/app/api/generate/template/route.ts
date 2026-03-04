import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { generateText } from '@/lib/ai';
import { canGenerate } from '@/lib/utils';

const SYSTEM_PROMPT = `You are CheerAI, an expert all-star cheerleading content specialist.
You create professional, culturally-authentic content for competitive cheer gyms.
You understand cheer culture, competition seasons, athlete development, and parent communication.
Always output well-structured, actionable content using clear markdown formatting.
Be energetic, professional, and on-brand for the cheerleading community.`;

function interpolateTemplate(template: string, values: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => values[key] || `[${key}]`);
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { generationsThisMonth: true, generationsResetAt: true, subscription: true },
    });
    if (!user) return NextResponse.json({ error: 'User not found.' }, { status: 404 });

    // Reset monthly count if needed
    const now = new Date();
    const resetAt = new Date(user.generationsResetAt);
    const needsReset = now.getMonth() !== resetAt.getMonth() || now.getFullYear() !== resetAt.getFullYear();
    if (needsReset) {
      await db.user.update({
        where: { id: session.user.id },
        data: { generationsThisMonth: 0, generationsResetAt: now },
      });
      user.generationsThisMonth = 0;
    }

    const { allowed, reason } = canGenerate(user.subscription, user.generationsThisMonth);
    if (!allowed) {
      return NextResponse.json({ error: reason }, { status: 403 });
    }

    const body = await req.json();
    const { templateId, inputs } = body;

    if (!templateId || !inputs) {
      return NextResponse.json({ error: 'Missing templateId or inputs.' }, { status: 400 });
    }

    // Fetch the template
    const template = await db.template.findFirst({
      where: {
        id: templateId,
        OR: [{ isSystem: true }, { userId: session.user.id }],
      },
    });
    if (!template) return NextResponse.json({ error: 'Template not found.' }, { status: 404 });

    // Interpolate template prompt with user inputs
    const interpolatedPrompt = interpolateTemplate(template.promptTemplate, inputs as Record<string, string>);

    // Generate content
    const result = await generateText(interpolatedPrompt, SYSTEM_PROMPT, {
      temperature: 0.78,
      maxTokens: 3000,
    });

    // Increment generation count for free users
    if (user.subscription === 'free') {
      await db.user.update({
        where: { id: session.user.id },
        data: { generationsThisMonth: { increment: 1 } },
      });
    }

    // Increment template usage count
    await db.template.update({
      where: { id: templateId },
      data: { usageCount: { increment: 1 } },
    });

    return NextResponse.json({ result, templateTitle: template.title });
  } catch (err) {
    console.error('[POST /api/generate/template]', err);
    const message = err instanceof Error ? err.message : 'Generation failed.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
