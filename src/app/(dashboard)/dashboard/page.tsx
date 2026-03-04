import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import Link from 'next/link';
import {
  Megaphone,
  CalendarDays,
  Star,
  FileText,
  Crown,
  ArrowRight,
  Sparkles,
  FolderOpen,
  LayoutTemplate,
  Image,
  Pin,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { FREE_GENERATION_LIMIT, formatDate } from '@/lib/utils';
import { OnboardingChecklist } from '@/components/dashboard/OnboardingChecklist';

async function getDashboardData(userId: string) {
  const [user, featuredPacks, recentProjects, pinnedProjects, projectCount, templateCount] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: {
        generationsThisMonth: true,
        subscription: true,
        name: true,
        onboardingCompleted: true,
        createdAt: true,
      },
    }),
    db.brandPack.findMany({ where: { featured: true }, orderBy: { createdAt: 'asc' }, take: 3 }),
    db.project.findMany({
      where: { userId, pinned: false },
      orderBy: { updatedAt: 'desc' },
      take: 4,
    }),
    db.project.findMany({
      where: { userId, pinned: true },
      orderBy: { updatedAt: 'desc' },
      take: 3,
    }),
    db.project.count({ where: { userId } }),
    db.template.count({ where: { isSystem: true } }),
  ]);
  return { user, featuredPacks, recentProjects, pinnedProjects, projectCount, templateCount };
}

const QUICK_ACTIONS = [
  { label: 'Marketing Generator', href: '/generator/marketing', icon: Megaphone, color: 'bg-pink-100 text-pink-600', pro: false },
  { label: 'Template Library',    href: '/templates',           icon: LayoutTemplate, color: 'bg-purple-100 text-purple-600', pro: false },
  { label: 'Practice Planner',    href: '/generator/practice-planner', icon: CalendarDays, color: 'bg-blue-100 text-blue-600', pro: true },
  { label: 'Score Translator',    href: '/generator/score-translator', icon: Star, color: 'bg-amber-100 text-amber-600', pro: true },
  { label: 'Routine Notes',       href: '/generator/routine-notes', icon: FileText, color: 'bg-green-100 text-green-600', pro: true },
  { label: 'Image Generator',     href: '/image-generator', icon: Image, color: 'bg-indigo-100 text-indigo-600', pro: true },
];

const TYPE_COLORS: Record<string, string> = {
  'marketing': 'bg-pink-100 text-pink-700',
  'practice-plan': 'bg-blue-100 text-blue-700',
  'score-translate': 'bg-amber-100 text-amber-700',
  'routine-notes': 'bg-green-100 text-green-700',
  'template': 'bg-purple-100 text-purple-700',
  'image': 'bg-indigo-100 text-indigo-700',
};

const TYPE_LABELS: Record<string, string> = {
  'marketing': 'Marketing',
  'practice-plan': 'Practice Plan',
  'score-translate': 'Score Sheet',
  'routine-notes': 'Routine Notes',
  'template': 'Template',
  'image': 'Image',
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const { user, featuredPacks, recentProjects, pinnedProjects, projectCount, templateCount } =
    await getDashboardData(session.user.id);

  const isPro = session.user.subscription === 'pro' || session.user.subscription === 'annual';
  const generationsLeft = isPro ? null : FREE_GENERATION_LIMIT - (user?.generationsThisMonth ?? 0);
  const hasGenerations = (user?.generationsThisMonth ?? 0) > 0;
  const hasProjects = projectCount > 0;
  const hasPracticePlan = recentProjects.some((p) => p.type === 'practice-plan') ||
    pinnedProjects.some((p) => p.type === 'practice-plan');

  // Show onboarding if user was created in the last 7 days and not all steps complete
  const isNewUser = user?.createdAt
    ? Date.now() - new Date(user.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000
    : false;
  const showOnboarding = isNewUser && !user?.onboardingCompleted;

  const greetingHour = new Date().getHours();
  const greeting = greetingHour < 12 ? 'Good morning' : greetingHour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {greeting}, {session.user.name ?? 'Coach'} 👋
          </h1>
          <p className="mt-1 text-gray-500 text-sm">
            {isPro ? 'Pro plan — unlimited generations' : `${generationsLeft ?? 0} free generation${generationsLeft !== 1 ? 's' : ''} left this month`}
          </p>
        </div>
        {isPro && (
          <div className="flex items-center gap-1.5 rounded-full bg-brand-100 px-3 py-1.5">
            <Crown className="h-3.5 w-3.5 text-brand-600" />
            <span className="text-xs font-semibold text-brand-700">Pro</span>
          </div>
        )}
      </div>

      {/* Onboarding Checklist (new users) */}
      {showOnboarding && (
        <OnboardingChecklist
          hasGenerations={hasGenerations}
          hasProjects={hasProjects}
          hasPracticePlan={hasPracticePlan}
        />
      )}

      {/* Usage banner for free users */}
      {!isPro && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-amber-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-900">
                {generationsLeft} generation{generationsLeft !== 1 ? 's' : ''} left this month
              </p>
              <p className="text-xs text-amber-700">Upgrade to Pro for unlimited generations + all tools.</p>
            </div>
          </div>
          <Link
            href="/pricing"
            className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-white hover:bg-amber-600 transition-colors flex-shrink-0"
          >
            <Crown className="h-3.5 w-3.5" /> Upgrade
          </Link>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Projects Saved', value: projectCount, icon: FolderOpen, color: 'text-brand-600', bg: 'bg-brand-50' },
          { label: 'Templates Available', value: templateCount, icon: LayoutTemplate, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Generations Used', value: user?.generationsThisMonth ?? 0, icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Pinned Projects', value: pinnedProjects.length, icon: Pin, color: 'text-pink-600', bg: 'bg-pink-50' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-xl border border-gray-200 bg-white px-4 py-3 flex items-center gap-3">
              <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${stat.bg}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-[10px] text-gray-400 leading-tight">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick actions */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            const locked = action.pro && !isPro;
            return (
              <Link
                key={action.href}
                href={locked ? '/pricing' : action.href}
                className="group relative flex flex-col items-center gap-2.5 rounded-xl border border-gray-200 bg-white p-4 hover:border-brand-300 hover:shadow-md transition-all duration-200 text-center"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${action.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-semibold text-gray-800 leading-tight">{action.label}</span>
                {locked && (
                  <span className="absolute top-2 right-2">
                    <Crown className="h-3 w-3 text-amber-400" />
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pinned Projects */}
        {pinnedProjects.length > 0 && (
          <section className="lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                <Pin className="h-3.5 w-3.5" /> Pinned Projects
              </h2>
              <Link href="/projects" className="text-xs text-brand-600 hover:underline font-medium flex items-center gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {pinnedProjects.map((proj) => (
                <Card key={proj.id} hover>
                  <CardBody className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{proj.title}</p>
                      <p className="text-xs text-gray-400">{formatDate(proj.updatedAt)}</p>
                    </div>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0 ${TYPE_COLORS[proj.type] ?? 'bg-gray-100 text-gray-700'}`}>
                      {TYPE_LABELS[proj.type] ?? proj.type}
                    </span>
                  </CardBody>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Featured Brand Packs */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              Featured Brand Packs
            </h2>
            <Link href="/generator/marketing" className="text-xs text-brand-600 hover:underline font-medium flex items-center gap-1">
              Use one <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {featuredPacks.map((pack) => {
              const colors: string[] = JSON.parse(pack.colors);
              return (
                <Link key={pack.id} href="/generator/marketing">
                  <Card hover>
                    <CardBody className="flex items-center gap-4">
                      <div className="flex gap-1.5 flex-shrink-0">
                        {colors.slice(0, 4).map((c) => (
                          <div
                            key={c}
                            className="h-5 w-5 rounded-full border border-white shadow-sm"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                          <span>{pack.emoji}</span> {pack.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{pack.description}</p>
                      </div>
                      <Badge variant="default">{pack.tone}</Badge>
                    </CardBody>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Recent Projects */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              Recent Projects
            </h2>
            {isPro && (
              <Link href="/projects" className="text-xs text-brand-600 hover:underline font-medium flex items-center gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            )}
          </div>
          {!isPro ? (
            <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-8 text-center">
              <FolderOpen className="mx-auto h-8 w-8 text-gray-300 mb-2" />
              <p className="text-sm font-medium text-gray-500">Project Library is a Pro feature</p>
              <Link href="/pricing" className="mt-2 inline-flex items-center gap-1 text-xs text-brand-600 font-semibold hover:underline">
                <Crown className="h-3 w-3" /> Upgrade to save projects
              </Link>
            </div>
          ) : recentProjects.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-8 text-center">
              <FolderOpen className="mx-auto h-8 w-8 text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">No projects yet.</p>
              <Link href="/generator/marketing" className="mt-2 inline-flex items-center gap-1 text-xs text-brand-600 font-semibold hover:underline">
                Generate something! <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentProjects.map((proj) => (
                <Card key={proj.id} hover>
                  <CardBody className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{proj.title}</p>
                      <p className="text-xs text-gray-400">{formatDate(proj.updatedAt)}</p>
                    </div>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0 ${TYPE_COLORS[proj.type] ?? 'bg-gray-100 text-gray-700'}`}>
                      {TYPE_LABELS[proj.type] ?? proj.type}
                    </span>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Trending Templates */}
      <section className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5" /> Popular Templates
          </h2>
          <Link href="/templates" className="text-xs text-brand-600 hover:underline font-medium flex items-center gap-1">
            Browse all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { title: 'Tryout Announcement', category: 'marketing', href: '/templates' },
            { title: 'Competition Hype Post', category: 'marketing', href: '/templates' },
            { title: 'Practice Plan Block', category: 'coaching', href: '/templates' },
            { title: 'Parent Info Email', category: 'communication', href: '/templates' },
          ].map((t) => (
            <Link
              key={t.title}
              href={t.href}
              className="flex items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-4 py-3 hover:border-brand-300 hover:shadow-sm transition-all"
            >
              <LayoutTemplate className="h-4 w-4 text-brand-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-800 truncate">{t.title}</p>
                <p className="text-[10px] text-gray-400 capitalize">{t.category}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
