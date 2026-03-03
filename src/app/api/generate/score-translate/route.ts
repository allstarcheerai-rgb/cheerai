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

    const { scoringSystem, division, weakAreas, customNotes } = await req.json();

    if (!scoringSystem || !division) {
      return NextResponse.json({ error: 'Scoring system and division are required.' }, { status: 400 });
    }

    const prompt = `
Explain the **${scoringSystem}** scoring system for the **${division}** division in plain English that coaches, athletes, and parents can understand and act on.

${weakAreas?.length ? `The team specifically wants to improve in: **${weakAreas.join(', ')}**` : ''}
${customNotes ? `Additional context: ${customNotes}` : ''}

Please cover these sections:

## HOW THE SCORE SHEET WORKS
Explain the major scoring categories, their point values, and how they add up. Keep it simple.

## WHAT JUDGES ARE ACTUALLY LOOKING FOR
For each main category, explain in plain English what earns high scores vs. low scores.

## YOUR IMPROVEMENT CHECKLIST
${weakAreas?.length ? `Focus especially on: ${weakAreas.join(', ')}.` : 'Cover the most impactful areas.'}
Create a specific, actionable checklist of 10-15 things the team can work on at practice.

## COMMON DEDUCTIONS TO AVOID
List the most common deductions in this system with tips to avoid each one.

## QUICK WINS
List 5 things that can immediately improve the team's score with minimal practice time.

## TALKING POINTS FOR PARENTS
Write 3-4 sentences explaining the scoring system in parent-friendly language they can share.
`;

    const explanation = await generateText(prompt, SYSTEM_PROMPTS.scoreTranslator, { maxTokens: 2500 });

    return NextResponse.json({ explanation });
  } catch (error) {
    console.error('[generate/score-translate]', error);
    const msg = error instanceof Error ? error.message : 'AI generation failed.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
