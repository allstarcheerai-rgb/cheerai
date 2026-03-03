import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateText, SYSTEM_PROMPTS } from '@/lib/ai';
import { db } from '@/lib/db';
import { canGenerate, FREE_GENERATION_LIMIT } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { subscription: true, generationsThisMonth: true, generationsResetAt: true },
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
      return NextResponse.json({ error: reason }, { status: 402 });
    }

    const body = await req.json();
    const { gymName, teamLevel, eventName, eventDate, eventLocation, brandVibe, primaryColor, accentColor, customNotes } = body;

    if (!gymName || !eventName) {
      return NextResponse.json({ error: 'Gym name and event name are required.' }, { status: 400 });
    }

    const prompt = `
Create a complete marketing pack for the following cheer gym:

**Gym Name:** ${gymName}
**Team Level:** ${teamLevel}
**Event:** ${eventName}
**Date:** ${eventDate || 'TBD'}
**Location:** ${eventLocation || 'TBD'}
**Brand Vibe:** ${brandVibe}
**Primary Color:** ${primaryColor}
**Accent Color:** ${accentColor}
${customNotes ? `**Coach Notes:** ${customNotes}` : ''}

Please generate ALL of the following sections in your response:

## CAPTIONS
Write 5 social media captions (Instagram/Facebook) for this event. Vary the tone: hype, emotional, informational, countdown, and day-of. Each caption should be 2-4 sentences + relevant hashtags. Separate each caption with ---

## CONTENT CALENDAR
Create a 2-week content calendar (14 days) leading up to the event. For each day, write:
- **Day X (Date context):** [Content type] — [Brief description of what to post]
Format as a clean list.

## PARENT EMAIL
Write a complete parent communication email about this event. Include:
- Subject line
- Greeting
- Event details
- What to bring/wear
- Schedule/arrival info
- Hype/motivation paragraph
- Sign-off

## DESIGN BRIEF
Write a design brief they can paste into Canva, Adobe Express, or an AI image generator. Include:
- Visual concept
- Color palette with hex codes: Primary ${primaryColor}, Accent ${accentColor}
- Typography suggestions
- Layout ideas for flyer, IG post, and IG story
- Specific visual elements to include
`;

    const raw = await generateText(prompt, SYSTEM_PROMPTS.marketing, { maxTokens: 3000 });

    // Parse sections
    const sections = raw.split(/^## /m).filter(Boolean);
    const getSection = (name: string) =>
      sections.find((s) => s.toLowerCase().startsWith(name.toLowerCase()))?.replace(/^[A-Z ]+\n/, '').trim() ?? '';

    const captionsRaw = getSection('CAPTIONS');
    const captions = captionsRaw.split('---').map((c) => c.trim()).filter(Boolean);
    const contentCalendar = getSection('CONTENT CALENDAR');
    const parentEmail = getSection('PARENT EMAIL');
    const designBrief = getSection('DESIGN BRIEF');

    // Increment generation count for free users
    if (user.subscription === 'free') {
      await db.user.update({
        where: { id: session.user.id },
        data: { generationsThisMonth: { increment: 1 } },
      });
    }

    return NextResponse.json({ captions, contentCalendar, parentEmail, designBrief });
  } catch (error) {
    console.error('[generate/marketing]', error);
    const msg = error instanceof Error ? error.message : 'AI generation failed.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
