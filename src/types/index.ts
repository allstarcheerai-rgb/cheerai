export type ProjectType =
  | 'marketing'
  | 'practice-plan'
  | 'score-translate'
  | 'routine-notes';

export interface Project {
  id: string;
  userId: string;
  title: string;
  type: ProjectType;
  content: string; // JSON string
  tags: string;    // comma-separated
  createdAt: Date;
  updatedAt: Date;
}

export interface BrandPack {
  id: string;
  name: string;
  vibe: string;
  description: string;
  colors: string; // JSON array string
  tone: string;
  emoji: string;
  exampleCopy: string;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ── Marketing generator types ────────────────────────────────────────────────

export interface MarketingInput {
  gymName: string;
  teamLevel: string;
  eventName: string;
  eventDate: string;
  eventLocation: string;
  brandVibe: string;
  primaryColor: string;
  accentColor: string;
  customNotes?: string;
}

export interface MarketingOutput {
  captions: string[];
  contentCalendar: string;
  parentEmail: string;
  designBrief: string;
}

// ── Practice planner types ────────────────────────────────────────────────────

export interface PracticePlanInput {
  duration: 60 | 90 | 120;
  skillLevel: string;
  teamSize: number;
  focusAreas: string[];
  upcomingCompetition?: string;
  notes?: string;
}

// ── Score translator types ────────────────────────────────────────────────────

export interface ScoreTranslateInput {
  scoringSystem: string;
  division: string;
  weakAreas: string[];
  customNotes?: string;
}

// ── Routine notes types ───────────────────────────────────────────────────────

export interface RoutineNotesInput {
  rawNotes: string;
  music?: string;
  level?: string;
}

// ── Subscription ─────────────────────────────────────────────────────────────

export type SubscriptionTier = 'free' | 'pro' | 'annual';
