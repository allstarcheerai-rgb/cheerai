import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const db = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ── Admin user ─────────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('admin123', 12);
  await db.user.upsert({
    where: { email: 'admin@cheerai.app' },
    update: {},
    create: {
      email: 'admin@cheerai.app',
      name: 'Admin',
      password: adminPassword,
      role: 'admin',
      subscription: 'pro',
    },
  });

  // ── Demo user ──────────────────────────────────────────────────────────────
  const demoPassword = await bcrypt.hash('demo1234', 12);
  await db.user.upsert({
    where: { email: 'demo@cheerai.app' },
    update: {},
    create: {
      email: 'demo@cheerai.app',
      name: 'Coach Taylor',
      password: demoPassword,
      role: 'user',
      subscription: 'pro',
    },
  });

  // ── Brand Packs ────────────────────────────────────────────────────────────
  const packs = [
    {
      name: 'Rave Comp',
      vibe: 'rave-comp',
      description: 'Bold neons, electric energy, hype-crowd ready.',
      colors: JSON.stringify(['#FF006E', '#FB5607', '#FFBE0B', '#8338EC', '#3A86FF']),
      tone: 'hype',
      emoji: '⚡',
      exampleCopy:
        'THE FLOOR IS OURS. Lights up. Music drops. Watch [Gym Name] tear it apart at [Event]. This is not a drill. 🔥',
      featured: true,
    },
    {
      name: 'Legacy Classic',
      vibe: 'legacy-classic',
      description: 'Deep jewel tones, timeless prestige, championship pedigree.',
      colors: JSON.stringify(['#1B1F3B', '#C5A028', '#7B2D8B', '#FFFFFF', '#2E4057']),
      tone: 'elegant',
      emoji: '👑',
      exampleCopy:
        'Champions are built over seasons, not days. [Gym Name] brings legacy to the mat at [Event]. Honor the grind.',
      featured: true,
    },
    {
      name: 'Sparkly Glam',
      vibe: 'sparkly-glam',
      description: 'Pastels, holographic shimmer, cheerleader-pink perfection.',
      colors: JSON.stringify(['#FF85A1', '#FFC8DD', '#BDE0FE', '#CAFFBF', '#FFD6FF']),
      tone: 'playful',
      emoji: '✨',
      exampleCopy:
        'Sparkle season is HERE. ✨ [Gym Name] is bringing ALL the glam to [Event] and we are NOT holding back. Get ready, babe.',
      featured: true,
    },
    {
      name: 'Clean Minimal',
      vibe: 'clean-minimal',
      description: 'White space, sharp typography, modern and professional.',
      colors: JSON.stringify(['#111827', '#F9FAFB', '#6366F1', '#E5E7EB', '#4F46E5']),
      tone: 'clean',
      emoji: '◻️',
      exampleCopy:
        '[Gym Name]. [Event]. [Date]. We\'ll let the score sheet speak for itself.',
      featured: false,
    },
    {
      name: 'School Spirit',
      vibe: 'school-spirit',
      description: 'Classic school colors energy — adaptable, crowd-rallying.',
      colors: JSON.stringify(['#D00000', '#FFBA08', '#FFFFFF', '#3F88C5', '#032B43']),
      tone: 'hype',
      emoji: '📣',
      exampleCopy:
        'Friday night feels. [Gym Name] goes ALL OUT for [Event]. Bring your school pride and your loudest voice! 📣',
      featured: false,
    },
  ];

  for (const pack of packs) {
    await db.brandPack.upsert({
      where: { vibe: pack.vibe } as never,
      update: pack,
      create: pack,
    });
  }

  console.log('✅ Seed complete!');
  console.log('   Admin:  admin@cheerai.app / admin123');
  console.log('   Demo:   demo@cheerai.app  / demo1234');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
