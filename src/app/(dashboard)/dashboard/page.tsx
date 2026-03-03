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
} from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { FREE_GENERATION_LIMIT, formatDate } from '@/lib/utils';

async function getDashboardData(userId: string) {
  const [user, featuredPacks, recentProjects] = await Promise.all([
    db.user.findUnique({ where: { id: userId }, select: { generationsThisMonth: true, subscription: true, name: true } }),
    db.brandPack.findMany({ where: { featured: true }, orderBy: { createdAt: 'asc' }, take: 3 }),
    db.project.findMany({ where: { userId }, orderBy: { updatedAt: 'desc' }, take: 4 }),
  ]);
  return { user, featuredPacks, recentProjects };
}

const QUICK_ACTIONS = [
  { label: 'Marketing Generator', href: '/generator/marketing', icon: Megaphone, color: 'bg-pink-100 text-pink-600', pro: false },
  { label: 'Practice Planner',    href: '/generator/practice-planner', icon: CalendarDays, color: 'bg-blue-100 text-blue-600', pro: true },
  { label: 'Score Translator',    href: '/generator/score-translator', icon: Star, color: 'bg-amber-100 text-amber-600', pro: true },
  { label: 'Routine Notes',       href: '/generator/routine-notes', icon: FileText, color: 'bg-green-100 text-green-600', pro: true },
];

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const { user, featuredPacks, recentProjects } = await getDashboardData(session.user.id);
  const isPro = session.user.subscription === 'pro' || session.user.subscription === 'annual';
  const generationsLeft = isPro ? null : FREE_GENERATION_LIMIT - (user?.generationsThisMonth ?? 0);

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Hey, {session.user.name ?? 'Coach'} 👋
        </h1>
        <p className="mt-1 text-gray-500 text-sm">
          What are we creating today?
        </p>
      </div>

      {/* Usage banner for free users */}
      {!isPro && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-amber-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-900">
                {generationsLeft} generation{generationsLeft !== 1 ? 's' : ''} left this month
              </p>
              <p className="text-xs text-amber-700">Upgrade to Pro for unlimited generations.</p>
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

      {/* Quick actions */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            const locked = action.pro && !isPro;
            return (
              <Link
                key={action.href}
                href={locked ? '/pricing' : action.href}
                className="group relative flex flex-col items-center gap-3 rounded-xl border border-gray-200 bg-white p-5 hover:border-brand-300 hover:shadow-md transition-all duration-200 text-center"
              >
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${action.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-sm font-semibold text-gray-800">{action.label}</span>
                {locked && (
                  <span className="absolute top-2 right-2">
                    <Crown className="h-3.5 w-3.5 text-amber-400" />
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                <Card key={pack.id} hover>
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
              <p className="text-sm text-gray-500">No projects yet. Generate something!</p>
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
                    <Badge variant="default" className="capitalize flex-shrink-0">
                      {proj.type.replace(/-/g, ' ')}
                    </Badge>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
