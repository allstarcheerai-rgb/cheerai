import { Megaphone, CalendarDays, Star, FileText, FolderOpen, Palette } from 'lucide-react';

const FEATURES = [
  {
    icon: Megaphone,
    title: 'Marketing Generator',
    description:
      'Pick your brand vibe—Rave Comp, Legacy Classic, Sparkly Glam—and get captions, a 2-week content calendar, parent email copy, and a Canva design brief instantly.',
    color: 'bg-pink-100 text-pink-600',
    badge: 'Free',
  },
  {
    icon: CalendarDays,
    title: 'Practice Planner',
    description:
      'Generate complete 60, 90, or 120-minute practice plans by skill level and focus areas. Includes warm-up, skill blocks, run-throughs, and coaching cues.',
    color: 'bg-blue-100 text-blue-600',
    badge: 'Pro',
  },
  {
    icon: Star,
    title: 'Score Sheet Translator',
    description:
      'Select your scoring system and get plain-English explanations of what judges actually look for, plus an actionable improvement checklist for your team.',
    color: 'bg-amber-100 text-amber-600',
    badge: 'Pro',
  },
  {
    icon: FileText,
    title: 'Routine Notes Formatter',
    description:
      'Paste in your raw counts and notes. Get back a clean, professional routine document with proper 8-count labels and suggested transitions.',
    color: 'bg-green-100 text-green-600',
    badge: 'Pro',
  },
  {
    icon: FolderOpen,
    title: 'Project Library',
    description:
      "Save every output as a project. Tag, search, copy to clipboard, or export as .txt or .md. Your whole season's content, organized.",
    color: 'bg-purple-100 text-purple-600',
    badge: 'Pro',
  },
  {
    icon: Palette,
    title: 'Brand Packs',
    description:
      'Curated palettes, tone guides, and example copy for the most popular cheer aesthetics. Swap vibes in one click.',
    color: 'bg-rose-100 text-rose-600',
    badge: 'Free',
  },
];

export function Features() {
  return (
    <section id="features" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Everything your gym needs,{' '}
            <span className="text-gradient">in one place</span>
          </h2>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            Stop spending hours on content creation. Cheer AI handles the words so you can
            focus on the mat.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group relative rounded-2xl border border-gray-100 bg-gray-50 p-6 hover:border-brand-200 hover:bg-white hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start gap-4">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${feature.color} flex-shrink-0`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-base font-semibold text-gray-900">{feature.title}</h3>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          feature.badge === 'Pro'
                            ? 'bg-brand-100 text-brand-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {feature.badge}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
