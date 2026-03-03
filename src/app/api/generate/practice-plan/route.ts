import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, isPro } from '@/lib/auth';
import { generateText, SYSTEM_PROMPTS } from '@/lib/ai';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }
    if (!isPro(session.user.subscription)) {
      return NextResponse.json({ error: 'Pro subscription required.' }, { status: 402 });
    }

    const { duration, skillLevel, teamSize, focusAreas, upcomingComp, notes } = await req.json();

    if (!duration || !skillLevel || !focusAreas?.length) {
      return NextResponse.json({ error: 'Duration, skill level, and focus areas are required.' }, { status: 400 });
    }

    const prompt = `
Create a detailed ${duration}-minute all-star cheer practice plan with the following parameters:

- **Skill Level:** ${skillLevel}
- **Team Size:** ${teamSize} athletes
- **Focus Areas:** ${focusAreas.join(', ')}
${upcomingComp ? `- **Upcoming Competition:** ${upcomingComp}` : ''}
${notes ? `- **Coach Notes:** ${notes}` : ''}

Structure the plan with these sections:

### PRACTICE OVERVIEW
- Goals for today's practice
- Equipment needed
- Formation setup notes

### WARM-UP (first 10-12% of practice)
List specific warm-up activities with time for each.

### SKILL BLOCKS
For each focus area, create a dedicated skill block with:
- Time allocation
- Specific drills and skills to work
- Coaching cues
- Safety reminders

### FULL ROUTINE RUN-THROUGHS
How many, with notes on what to watch for.

### COOL-DOWN & DEBRIEF (last 5 minutes)
Cool-down routine + team meeting notes.

### COACH CHECKLIST
5 key things to observe and track today.

Use a clear time breakdown format like: **[0:00 - 0:12]** for each block.
`;

    const plan = await generateText(prompt, SYSTEM_PROMPTS.practicePlanner, { maxTokens: 2500 });

    return NextResponse.json({ plan });
  } catch (error) {
    console.error('[generate/practice-plan]', error);
    const msg = error instanceof Error ? error.message : 'AI generation failed.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
