import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { generateText } from '@/lib/ai';

const PROMPT_SYSTEM = `You are a professional graphic design AI specializing in cheerleading marketing graphics.
Generate detailed, vivid image generation prompts for cheer gym marketing materials.
Focus on: dynamic poses, competition energy, team spirit, professional photography style.
Always include style directives, lighting, composition, and mood descriptors.
Output ONLY the image prompt — no explanation, no markdown, no prefix.`;

// Dimensions by format
const FORMAT_DIMS: Record<string, { width: number; height: number; label: string }> = {
  'ig-post': { width: 1080, height: 1080, label: 'Instagram Post (1:1)' },
  'ig-story': { width: 1080, height: 1920, label: 'Instagram Story (9:16)' },
  'flyer': { width: 1275, height: 1650, label: 'Flyer (8.5x11)' },
  'banner': { width: 1500, height: 500, label: 'Banner (3:1)' },
};

const STYLE_DESCRIPTIONS: Record<string, string> = {
  'sparkly-glam': 'sparkly, glamorous, pink and holographic, glitter bokeh, soft feminine lighting, cheerleader aesthetic',
  'competition-lights': 'dramatic stage lighting, competition arena, professional sports photography, dynamic action, vivid colors',
  'legacy-classic': 'timeless, prestigious, deep jewel tones, gold accents, championship legacy, elegant composition',
  'clean-modern': 'minimalist, clean white space, bold typography, modern design, professional corporate sports',
  'southern-preppy': 'preppy southern charm, bright colors, school spirit, traditional cheerleading, wholesome energy',
};

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { subscription: true },
    });
    if (!user) return NextResponse.json({ error: 'User not found.' }, { status: 404 });

    const isPro = user.subscription === 'pro' || user.subscription === 'annual';
    if (!isPro) {
      return NextResponse.json(
        { error: 'Image generation requires a Pro subscription.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      format = 'ig-post',
      style = 'sparkly-glam',
      gymName = '',
      eventName = '',
      eventDate = '',
      location = '',
      callToAction = '',
      imageCount = 2,
    } = body;

    if (!gymName) return NextResponse.json({ error: 'Gym name is required.' }, { status: 400 });

    const dims = FORMAT_DIMS[format] || FORMAT_DIMS['ig-post'];
    const styleDesc = STYLE_DESCRIPTIONS[style] || STYLE_DESCRIPTIONS['sparkly-glam'];

    // Generate a detailed image prompt using the text AI
    const promptRequest = `Generate a detailed image generation prompt for a cheerleading marketing graphic.

Format: ${dims.label}
Style: ${styleDesc}
Gym Name: ${gymName}
${eventName ? `Event: ${eventName}` : ''}
${eventDate ? `Date: ${eventDate}` : ''}
${location ? `Location: ${location}` : ''}
${callToAction ? `Call to Action: ${callToAction}` : ''}

Create a highly detailed prompt that would produce a stunning, professional marketing graphic.
Include specific details about: composition, colors, lighting, visual elements, typography placement, mood.
Make it specific to all-star cheerleading culture.
Output ONLY the image generation prompt text.`;

    const imagePrompt = await generateText(promptRequest, PROMPT_SYSTEM, {
      temperature: 0.8,
      maxTokens: 500,
    });

    // Generate images using Pollinations.ai (free, no API key needed)
    const encodedPrompt = encodeURIComponent(imagePrompt.trim());
    const { width, height } = dims;

    const imageUrls: string[] = [];
    const seedBase = Date.now();

    for (let i = 0; i < Math.min(imageCount, 4); i++) {
      const seed = seedBase + i * 1000;
      const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true&enhance=true`;
      imageUrls.push(url);
    }

    return NextResponse.json({
      imageUrls,
      imagePrompt,
      format: dims.label,
      style,
      dimensions: { width, height },
    });
  } catch (err) {
    console.error('[POST /api/generate/image]', err);
    const message = err instanceof Error ? err.message : 'Image generation failed.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
