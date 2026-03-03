import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, isPro } from '@/lib/auth';
import { generateText, SYSTEM_PROMPTS } from '@/lib/ai';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }
    if (!isPro(session.user.subscription)) {
      return NextResponse.json({ error: 'Pro subscription required.' }, { status: 402 });
    }

    const { rawNotes, music, level } = await req.json();

    if (!rawNotes?.trim()) {
      return NextResponse.json({ error: 'Routine notes are required.' }, { status: 400 });
    }

    const prompt = `
Clean up and format the following raw cheerleading routine notes into a polished, professional routine document.

${music ? `**Music:** ${music}` : ''}
${level ? `**Level:** ${level}` : ''}

**Raw Notes:**
${rawNotes}

Please output a clean routine document with:

1. A header section with routine metadata (music, level, total counts if determinable)
2. Properly numbered 8-count blocks with clear formatting
3. Standard cheer notation (abbreviations like "BHS" for back handspring, "Lib" for liberty, etc.)
4. Skill annotations in [brackets] where relevant
5. Formation labels in (parentheses)
6. Suggested transitions between sections clearly marked with →
7. Any potential timing or flow issues flagged with ⚠️
8. A "Choreography Notes" section at the end with suggestions for improving flow, transitions, or visual impact

Keep the formatting clean and consistent. Use dashes, spacing, and alignment to make it easy to read at a glance during practice.
`;

    const formatted = await generateText(prompt, SYSTEM_PROMPTS.routineNotes, { maxTokens: 2000 });

    return NextResponse.json({ formatted });
  } catch (error) {
    console.error('[generate/routine-notes]', error);
    const msg = error instanceof Error ? error.message : 'AI generation failed.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
