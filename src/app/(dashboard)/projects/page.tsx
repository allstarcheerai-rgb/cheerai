'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import {
  FolderOpen,
  Search,
  Trash2,
  Copy,
  Download,
  Crown,
  Lock,
  Tag,
  Pin,
  PinOff,
  CopyPlus,
  Image as ImageIcon,
  Filter,
  SortDesc,
} from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { CardSkeleton } from '@/components/ui/Skeleton';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { formatDate, truncate } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface Project {
  id: string;
  title: string;
  type: string;
  content: string;
  outputImages: string | null;
  tags: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

const TYPE_LABELS: Record<string, string> = {
  'marketing': 'Marketing',
  'practice-plan': 'Practice Plan',
  'score-translate': 'Score Sheet',
  'routine-notes': 'Routine Notes',
  'template': 'Template',
  'image': 'Image',
};

const TYPE_COLORS: Record<string, string> = {
  'marketing': 'bg-pink-100 text-pink-700',
  'practice-plan': 'bg-blue-100 text-blue-700',
  'score-translate': 'bg-amber-100 text-amber-700',
  'routine-notes': 'bg-green-100 text-green-700',
  'template': 'bg-purple-100 text-purple-700',
  'image': 'bg-indigo-100 text-indigo-700',
};

const TYPE_FILTER_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'practice-plan', label: 'Practice Plans' },
  { value: 'score-translate', label: 'Score Sheets' },
  { value: 'routine-notes', label: 'Routine Notes' },
  { value: 'template', label: 'Templates' },
  { value: 'image', label: 'Images' },
];

export default function ProjectsPage() {
  const { data: session } = useSession();
  const isPro = session?.user?.subscription === 'pro' || session?.user?.subscription === 'annual';

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [sortBy, setSortBy] = useState<'updatedAt' | 'createdAt'>('updatedAt');
  const [pinnedFirst, setPinnedFirst] = useState(true);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (typeFilter) params.set('type', typeFilter);
      const res = await fetch(`/api/projects?${params.toString()}`);
      const data = await res.json();
      if (res.ok) setProjects(data.projects ?? []);
    } catch {
      toast.error('Could not load projects.');
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter]);

  useEffect(() => {
    if (isPro) fetchProjects();
  }, [isPro, fetchProjects]);

  async function handleDelete(id: string) {
    if (!confirm('Delete this project? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setProjects((prev) => prev.filter((p) => p.id !== id));
      toast.success('Project deleted.');
    } catch {
      toast.error('Could not delete project.');
    }
  }

  async function handlePin(id: string, currentlyPinned: boolean) {
    try {
      const res = await fetch(`/api/projects/${id}/pin`, { method: 'PATCH' });
      if (!res.ok) throw new Error();
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, pinned: !p.pinned } : p))
      );
      toast.success(currentlyPinned ? 'Unpinned.' : 'Pinned to dashboard!');
    } catch {
      toast.error('Could not pin project.');
    }
  }

  async function handleDuplicate(id: string) {
    try {
      const res = await fetch(`/api/projects/${id}/duplicate`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error();
      setProjects((prev) => [data.project, ...prev]);
      toast.success('Project duplicated!');
    } catch {
      toast.error('Could not duplicate project.');
    }
  }

  function getExportContent(project: Project): string {
    try {
      const parsed = JSON.parse(project.content);
      if (parsed.result) return typeof parsed.result === 'string' ? parsed.result : JSON.stringify(parsed.result, null, 2);
      if (parsed.plan) return parsed.plan;
      if (parsed.explanation) return parsed.explanation;
      if (parsed.formatted) return parsed.formatted;
      return project.content;
    } catch {
      return project.content;
    }
  }

  function handleCopy(project: Project) {
    navigator.clipboard.writeText(getExportContent(project));
    toast.success('Copied to clipboard!');
  }

  function handleDownload(project: Project) {
    const content = getExportContent(project);
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded!');
  }

  function getPreviewText(project: Project): string {
    try {
      const parsed = JSON.parse(project.content);
      const text = parsed.result || parsed.plan || parsed.explanation || parsed.formatted || project.content;
      return truncate(typeof text === 'string' ? text : JSON.stringify(text), 120);
    } catch {
      return truncate(project.content, 120);
    }
  }

  const getImageUrls = (project: Project): string[] => {
    if (!project.outputImages) return [];
    try { return JSON.parse(project.outputImages); } catch { return []; }
  };

  // Sort projects
  const sortedProjects = [...projects].sort((a, b) => {
    if (pinnedFirst && a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    const dateA = new Date(a[sortBy]).getTime();
    const dateB = new Date(b[sortBy]).getTime();
    return dateB - dateA;
  });

  const pinnedCount = projects.filter((p) => p.pinned).length;

  if (!isPro) {
    return (
      <div className="p-6 md:p-8 max-w-2xl mx-auto">
        <div className="flex flex-col items-center justify-center min-h-[500px] text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100 mb-5">
            <Lock className="h-8 w-8 text-brand-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Project Library</h1>
          <p className="text-gray-500 mb-6 max-w-sm">
            Save, pin, search, and export all your AI-generated content. Keep your whole season organized. Available on Pro.
          </p>
          <Link href="/pricing">
            <Button size="lg">
              <Crown className="h-5 w-5 text-amber-300" /> Upgrade to Pro
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100">
          <FolderOpen className="h-5 w-5 text-brand-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Project Library</h1>
          <p className="text-sm text-gray-500">
            {projects.length} project{projects.length !== 1 ? 's' : ''}
            {pinnedCount > 0 && ` · ${pinnedCount} pinned`}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects…"
              className="w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <button
            onClick={() => setPinnedFirst((p) => !p)}
            title={pinnedFirst ? 'Sort: Pinned first' : 'Sort: Date only'}
            className={cn(
              'flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
              pinnedFirst ? 'border-brand-300 bg-brand-50 text-brand-600' : 'border-gray-200 text-gray-500 hover:bg-gray-50'
            )}
          >
            <Pin className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setSortBy((s) => s === 'updatedAt' ? 'createdAt' : 'updatedAt')}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
          >
            <SortDesc className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{sortBy === 'updatedAt' ? 'Modified' : 'Created'}</span>
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {TYPE_FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTypeFilter(opt.value)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap',
                typeFilter === opt.value
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : sortedProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FolderOpen className="h-12 w-12 text-gray-300 mb-3" />
          <p className="text-sm font-medium text-gray-500">
            {search || typeFilter ? 'No projects match your filters.' : 'No projects yet — generate something!'}
          </p>
          {!(search || typeFilter) && (
            <Link href="/generator/marketing" className="mt-3 text-xs text-brand-600 hover:underline font-semibold">
              Start with Marketing Generator →
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {sortedProjects.map((project) => {
            const images = getImageUrls(project);
            return (
              <Card
                key={project.id}
                className={cn(
                  'hover:shadow-md transition-shadow duration-200',
                  project.pinned && 'ring-1 ring-brand-200 border-brand-200'
                )}
              >
                <CardBody>
                  {/* Image preview for image projects */}
                  {images.length > 0 && (
                    <div className="mb-3 -mx-5 -mt-5 rounded-t-xl overflow-hidden h-32 bg-gray-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={images[0]}
                        alt="Project preview"
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    </div>
                  )}

                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className={cn(
                        'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold',
                        TYPE_COLORS[project.type] ?? 'bg-gray-100 text-gray-700'
                      )}>
                        {project.type === 'image' && <ImageIcon className="h-2.5 w-2.5 mr-0.5" />}
                        {TYPE_LABELS[project.type] ?? project.type}
                      </span>
                      {project.pinned && (
                        <Pin className="h-3 w-3 text-brand-400" />
                      )}
                    </div>
                    <span className="text-[10px] text-gray-400 flex-shrink-0">{formatDate(project.updatedAt)}</span>
                  </div>

                  <h3 className="text-sm font-semibold text-gray-900 mb-1.5 leading-snug">
                    {project.title}
                  </h3>

                  {project.type !== 'image' && (
                    <p className="text-xs text-gray-400 leading-relaxed mb-2">
                      {getPreviewText(project)}
                    </p>
                  )}

                  {project.tags && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {project.tags.split(',').filter(Boolean).slice(0, 3).map((tag) => (
                        <span key={tag} className="inline-flex items-center gap-0.5 text-[10px] text-gray-400 bg-gray-100 rounded px-1.5 py-0.5">
                          <Tag className="h-2.5 w-2.5" />{tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-gray-100">
                    {project.type !== 'image' && (
                      <>
                        <Button variant="ghost" size="sm" onClick={() => handleCopy(project)} className="flex-1 text-xs min-w-0">
                          <Copy className="h-3.5 w-3.5" /> Copy
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDownload(project)} className="flex-1 text-xs min-w-0">
                          <Download className="h-3.5 w-3.5" /> .md
                        </Button>
                      </>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePin(project.id, project.pinned)}
                      title={project.pinned ? 'Unpin' : 'Pin to dashboard'}
                      className={cn('px-2', project.pinned ? 'text-brand-500' : 'text-gray-400')}
                    >
                      {project.pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDuplicate(project.id)}
                      title="Duplicate"
                      className="px-2 text-gray-400"
                    >
                      <CopyPlus className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(project.id)}
                      className="px-2 text-red-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
