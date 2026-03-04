'use client';

import Link from 'next/link';
import { Megaphone, CalendarDays, Star, FileText, Image, LayoutTemplate, Crown } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { cn } from '@/lib/utils';

interface NewProjectModalProps {
  open: boolean;
  onClose: () => void;
  isPro: boolean;
}

const TOOLS = [
  {
    label: 'Marketing Generator',
    description: 'Captions, emails, content calendars for your gym.',
    href: '/generator/marketing',
    icon: Megaphone,
    color: 'bg-pink-100 text-pink-600',
    pro: false,
  },
  {
    label: 'Template Library',
    description: '25+ ready-to-use cheer templates.',
    href: '/templates',
    icon: LayoutTemplate,
    color: 'bg-purple-100 text-purple-600',
    pro: false,
  },
  {
    label: 'Practice Planner',
    description: 'AI-structured practice plans with time blocks.',
    href: '/generator/practice-planner',
    icon: CalendarDays,
    color: 'bg-blue-100 text-blue-600',
    pro: true,
  },
  {
    label: 'Score Translator',
    description: 'Turn judge scores into actionable feedback.',
    href: '/generator/score-translator',
    icon: Star,
    color: 'bg-amber-100 text-amber-600',
    pro: true,
  },
  {
    label: 'Routine Notes',
    description: 'Clean up and format raw routine notes.',
    href: '/generator/routine-notes',
    icon: FileText,
    color: 'bg-green-100 text-green-600',
    pro: true,
  },
  {
    label: 'Image Generator',
    description: 'AI cheer marketing graphics for social media.',
    href: '/image-generator',
    icon: Image,
    color: 'bg-indigo-100 text-indigo-600',
    pro: true,
  },
];

export function NewProjectModal({ open, onClose, isPro }: NewProjectModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Start something new" size="lg">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          const locked = tool.pro && !isPro;
          return (
            <Link
              key={tool.href}
              href={locked ? '/pricing' : tool.href}
              onClick={onClose}
              className={cn(
                'group flex items-start gap-3.5 rounded-xl border border-gray-200 p-4 transition-all duration-200',
                locked
                  ? 'opacity-60 cursor-default'
                  : 'hover:border-brand-300 hover:shadow-sm hover:bg-brand-50/30'
              )}
            >
              <div className={cn('flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl', tool.color)}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold text-gray-900">{tool.label}</p>
                  {locked && <Crown className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />}
                </div>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{tool.description}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </Modal>
  );
}
