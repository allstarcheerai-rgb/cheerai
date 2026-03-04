'use client';

import { useState } from 'react';
import { Check, ChevronDown, ChevronUp, X, Megaphone, CalendarDays, FolderOpen } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface Step {
  id: string;
  label: string;
  description: string;
  href: string;
  icon: React.ElementType;
  completed: boolean;
}

interface OnboardingChecklistProps {
  hasGenerations: boolean;
  hasProjects: boolean;
  hasPracticePlan: boolean;
  onDismiss?: () => void;
}

export function OnboardingChecklist({
  hasGenerations,
  hasProjects,
  hasPracticePlan,
  onDismiss,
}: OnboardingChecklistProps) {
  const [collapsed, setCollapsed] = useState(false);

  const steps: Step[] = [
    {
      id: 'first-post',
      label: 'Create your first marketing post',
      description: 'Use the Marketing Generator to create captions, emails, and content.',
      href: '/generator/marketing',
      icon: Megaphone,
      completed: hasGenerations,
    },
    {
      id: 'practice-plan',
      label: 'Generate a practice plan',
      description: 'Create a structured, time-blocked practice plan for your team.',
      href: '/generator/practice-planner',
      icon: CalendarDays,
      completed: hasPracticePlan,
    },
    {
      id: 'save-project',
      label: 'Save your first project',
      description: 'Save generated content to your project library for later.',
      href: '/projects',
      icon: FolderOpen,
      completed: hasProjects,
    },
  ];

  const completedCount = steps.filter((s) => s.completed).length;
  const allComplete = completedCount === steps.length;

  if (allComplete && onDismiss) {
    return null;
  }

  return (
    <div className="mb-6 rounded-xl border border-brand-200 bg-gradient-to-br from-brand-50 to-purple-50 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            {steps.map((s, i) => (
              <div
                key={i}
                className={cn(
                  'h-2 w-2 rounded-full transition-colors',
                  s.completed ? 'bg-brand-600' : 'bg-brand-200'
                )}
              />
            ))}
          </div>
          <span className="text-sm font-semibold text-brand-900">
            Getting started — {completedCount}/{steps.length} complete
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="rounded-lg p-1 text-brand-500 hover:bg-brand-100 transition-colors"
          >
            {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </button>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="rounded-lg p-1 text-brand-400 hover:bg-brand-100 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {!collapsed && (
        <div className="border-t border-brand-100 divide-y divide-brand-100">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <Link
                key={step.id}
                href={step.href}
                className={cn(
                  'flex items-center gap-4 px-5 py-3.5 transition-colors',
                  step.completed
                    ? 'opacity-60 cursor-default pointer-events-none'
                    : 'hover:bg-brand-100/50'
                )}
              >
                <div
                  className={cn(
                    'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                    step.completed
                      ? 'border-brand-500 bg-brand-500'
                      : 'border-brand-200 bg-white'
                  )}
                >
                  {step.completed ? (
                    <Check className="h-4 w-4 text-white" />
                  ) : (
                    <Icon className="h-4 w-4 text-brand-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    'text-sm font-medium',
                    step.completed ? 'line-through text-gray-400' : 'text-gray-800'
                  )}>
                    {step.label}
                  </p>
                  {!step.completed && (
                    <p className="text-xs text-gray-500 truncate">{step.description}</p>
                  )}
                </div>
                {!step.completed && (
                  <span className="text-xs font-semibold text-brand-600 flex-shrink-0">
                    Start →
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
