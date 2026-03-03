'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { FolderOpen, Search, Trash2, Copy, Download, Crown, Lock, Tag } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { formatDate, truncate } from '@/lib/utils';

interface Project {
  id: string;
  title: string;
  type: string;
  content: string;
  tags: string;
  createdAt: string;
  updatedAt: string;
}

const TYPE_LABELS: Record<string, string> = {
  'marketing': 'Marketing',
  'practice-plan': 'Practice Plan',
  'score-translate': 'Score Sheet',
  'routine-notes': 'Routine Notes',
};

const TYPE_COLORS: Record<string, string> = {
  'marketing': 'bg-pink-100 text-pink-700',
  'practice-plan': 'bg-blue-100 text-blue-700',
  'score-translate': 'bg-amber-100 text-amber-700',
  'routine-notes': 'bg-green-100 text-green-700',
};

export default function ProjectsPage() {
  const { data: session } = useSession();
  const isPro = session?.user?.subscription === 'pro' || session?.user?.subscription === 'annual';

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

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
    if (!confirm('Delete this project?')) return;
    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setProjects((prev) => prev.filter((p) => p.id !== id));
      toast.success('Project deleted.');
    } catch {
      toast.error('Could not delete project.');
    }
  }

  function getExportContent(project: Project): string {
    try {
      const parsed = JSON.parse(project.content);
      if (parsed.result) return typeof parsed.result === 'string' ? parsed.result : JSON.stringify(parsed.result, null, 2);
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
  }

  if (!isPro) {
    return (
      <div className="p-6 md:p-8 max-w-2xl mx-auto">
        <div className="flex flex-col items-center justify-center min-h-[500px] text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100 mb-5">
            <Lock className="h-8 w-8 text-brand-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Project Library</h1>
          <p className="text-gray-500 mb-6 max-w-sm">
            Save, search, and export all your AI-generated content. Keep your whole season organized. Available on Pro.
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
          <p className="text-sm text-gray-500">{projects.length} saved project{projects.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search projects…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {['', 'marketing', 'practice-plan', 'score-translate', 'routine-notes'].map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                typeFilter === type
                  ? 'bg-brand-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {type === '' ? 'All' : TYPE_LABELS[type] ?? type}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FolderOpen className="h-12 w-12 text-gray-300 mb-3" />
          <p className="text-sm font-medium text-gray-500">
            {search || typeFilter ? 'No projects match your filters.' : 'No projects yet. Generate something!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-md transition-shadow duration-200">
              <CardBody>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${TYPE_COLORS[project.type] ?? 'bg-gray-100 text-gray-700'}`}>
                    {TYPE_LABELS[project.type] ?? project.type}
                  </span>
                  <span className="text-xs text-gray-400">{formatDate(project.updatedAt)}</span>
                </div>

                <h3 className="text-sm font-semibold text-gray-900 mb-2 leading-snug">
                  {project.title}
                </h3>

                {project.tags && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {project.tags.split(',').filter(Boolean).map((tag) => (
                      <span key={tag} className="inline-flex items-center gap-0.5 text-[10px] text-gray-400 bg-gray-100 rounded px-1.5 py-0.5">
                        <Tag className="h-2.5 w-2.5" />{tag.trim()}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                  <Button variant="ghost" size="sm" onClick={() => handleCopy(project)} className="flex-1 text-xs">
                    <Copy className="h-3.5 w-3.5" /> Copy
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDownload(project)} className="flex-1 text-xs">
                    <Download className="h-3.5 w-3.5" /> .md
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(project.id)}
                    className="text-red-500 hover:bg-red-50 hover:text-red-600 px-2"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
