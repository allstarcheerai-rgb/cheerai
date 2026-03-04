'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import {
  LayoutDashboard,
  Megaphone,
  CalendarDays,
  FileText,
  Star,
  FolderOpen,
  Settings,
  LogOut,
  Sparkles,
  Crown,
  ChevronRight,
  LayoutTemplate,
  Image,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { NewProjectModal } from '@/components/dashboard/NewProjectModal';

const NAV_ITEMS = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    pro: false,
  },
  {
    label: 'Marketing Generator',
    href: '/generator/marketing',
    icon: Megaphone,
    pro: false,
  },
  {
    label: 'Template Library',
    href: '/templates',
    icon: LayoutTemplate,
    pro: false,
  },
  {
    label: 'Practice Planner',
    href: '/generator/practice-planner',
    icon: CalendarDays,
    pro: true,
  },
  {
    label: 'Score Translator',
    href: '/generator/score-translator',
    icon: Star,
    pro: true,
  },
  {
    label: 'Routine Notes',
    href: '/generator/routine-notes',
    icon: FileText,
    pro: true,
  },
  {
    label: 'Image Generator',
    href: '/image-generator',
    icon: Image,
    pro: true,
  },
  {
    label: 'Projects',
    href: '/projects',
    icon: FolderOpen,
    pro: true,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isPro = session?.user?.subscription === 'pro' || session?.user?.subscription === 'annual';
  const [newModalOpen, setNewModalOpen] = useState(false);

  return (
    <>
      <aside className="fixed left-0 top-0 h-full w-64 bg-slate-900 flex flex-col z-40">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-slate-800">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-brand">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold text-white tracking-tight">Cheer AI</span>
        </div>

        {/* New button */}
        <div className="px-3 pt-3 pb-1">
          <button
            onClick={() => setNewModalOpen(true)}
            className="flex w-full items-center gap-2 rounded-lg bg-brand-600 hover:bg-brand-700 px-3 py-2 text-sm font-semibold text-white transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>New</span>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-2 px-3">
          <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Tools</p>
          <div className="space-y-0.5">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
              const isLocked = item.pro && !isPro;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={isLocked ? '/pricing' : item.href}
                  className={cn(
                    'sidebar-link group',
                    isActive && 'active',
                    isLocked && 'opacity-60'
                  )}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="flex-1 truncate">{item.label}</span>
                  {isLocked && (
                    <Crown className="h-3.5 w-3.5 text-amber-400 opacity-80" />
                  )}
                  {isActive && !isLocked && (
                    <ChevronRight className="h-3.5 w-3.5 opacity-60" />
                  )}
                </Link>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800">
            <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Account</p>
            <Link
              href="/settings"
              className={cn('sidebar-link', pathname === '/settings' && 'active')}
            >
              <Settings className="h-4 w-4 flex-shrink-0" />
              <span>Settings & Billing</span>
            </Link>
          </div>
        </nav>

        {/* User + subscription */}
        <div className="px-3 py-3 border-t border-slate-800">
          {!isPro && (
            <Link
              href="/pricing"
              className="mb-3 flex items-center gap-2 rounded-lg bg-gradient-to-r from-brand-700 to-pink-700 px-3 py-2.5 text-xs font-semibold text-white hover:opacity-90 transition-opacity"
            >
              <Crown className="h-4 w-4 text-amber-300" />
              <span>Upgrade to Pro</span>
              <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-70" />
            </Link>
          )}
          <div className="flex items-center gap-2.5 px-2 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-white text-xs font-bold flex-shrink-0">
              {session?.user?.name?.[0]?.toUpperCase() ?? session?.user?.email?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">
                {session?.user?.name ?? 'Athlete'}
              </p>
              <div className="flex items-center gap-1">
                <Badge variant={isPro ? 'pro' : 'free'} className="text-[10px] px-1.5 py-0">
                  {isPro ? 'Pro' : 'Free'}
                </Badge>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="text-slate-500 hover:text-slate-300 transition-colors"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      <NewProjectModal
        open={newModalOpen}
        onClose={() => setNewModalOpen(false)}
        isPro={isPro}
      />
    </>
  );
}
