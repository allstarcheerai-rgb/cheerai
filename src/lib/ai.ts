/**
 * AI abstraction layer.
 * Swap the underlying model/provider by changing env vars only:
 *   AI_API_KEY   – your API key
 *   AI_BASE_URL  – optional base URL (defaults to OpenAI)
 *   AI_MODEL     – optional model name (defaults to gpt-4o-mini)
 */

import OpenAI from 'openai';

let _client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!_client) {
    if (!process.env.AI_API_KEY) {
      throw new Error('AI_API_KEY is not set. Add it to your .env file.');
    }
    _client = new OpenAI({
      apiKey: process.env.AI_API_KEY,
      baseURL: process.env.AI_BASE_URL ?? 'https://api.openai.com/v1',
    });
  }
  return _client;
}

interface GenerateOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export async function generateText(
  userPrompt: string,
  systemPrompt: string,
  options: GenerateOptions = {}
): Promise<string> {
  const client = getClient();
  const response = await client.chat.completions.create({
    model: options.model ?? process.env.AI_MODEL ?? 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: options.temperature ?? 0.75,
    max_tokens: options.maxTokens ?? 2048,
  });

  const text = response.choices[0]?.message?.content;
  if (!text) throw new Error('AI returned an empty response.');
  return text;
}

// ── Cheer-specific system prompts ─────────────────────────────────────────────

export const SYSTEM_PROMPTS = {
  marketing: `You are CheerAI, an expert all-star cheerleading marketing strategist.
You specialize in social media content, email copy, content calendars, and Canva design briefs for competitive cheer gyms.
You understand the cheer culture, comp season cycles, and what hype parents, athletes, and coaches.
Always output clean, structured markdown with clear section headers.
Be energetic but professional. Match the brand vibe provided.`,

  practicePlanner: `You are CheerAI, an expert all-star cheer coach and practice planning specialist.
You design efficient, skill-level-appropriate practice plans that maximize floor time.
Structure plans with warm-up, skill blocks, run-throughs, and cool-down.
Include timing for each block, coaching cues, and safety notes.
Output in clean markdown with time blocks clearly labeled.`,

  scoreTranslator: `You are CheerAI, an expert in competitive cheerleading scoring systems (USASF, NCA, UCA, etc.).
You translate technical judge criteria into plain English that coaches, athletes, and parents can act on.
Provide specific improvement checklists, common deductions to avoid, and scoring tips.
Be encouraging but accurate. Output in clean markdown.`,

  routineNotes: `You are CheerAI, an all-star cheer choreography assistant.
You clean up raw routine notes, fix formatting, improve clarity, and suggest transitions.
Output a polished routine document with proper 8-count labels, skill annotations, and transition suggestions.
Use standard cheer notation conventions.`,
};
