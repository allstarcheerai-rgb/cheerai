'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import {
  LayoutTemplate,
  Search,
  Sparkles,
  Loader2,
  Copy,
  Download,
  Save,
  ChevronLeft,
  Crown,
  Star,
} from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { TemplateSkeleton } from '@/components/ui/Skeleton';
import { UpgradeModal } from '@/components/dashboard/UpgradeModal';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

// ── Types ────────────────────────────────────────────────────────────────────

interface FieldDef {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'date';
  required?: boolean;
  placeholder?: string;
  options?: string[];
}

interface Template {
  id: string;
  title: string;
  category: string;
  description: string;
  inputSchema: string;
  defaultValues: string;
  tags: string | null;
  isSystem: boolean;
  usageCount: number;
}

// ── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { value: '', label: 'All Templates' },
  { value: 'marketing', label: '📢 Marketing' },
  { value: 'coaching', label: '🏆 Coaching' },
  { value: 'communication', label: '📧 Communication' },
  { value: 'outreach', label: '🤝 Outreach' },
  { value: 'hr', label: '👥 HR & Staffing' },
];

const CATEGORY_COLORS: Record<string, string> = {
  marketing: 'bg-pink-100 text-pink-700',
  coaching: 'bg-blue-100 text-blue-700',
  communication: 'bg-green-100 text-green-700',
  outreach: 'bg-amber-100 text-amber-700',
  hr: 'bg-purple-100 text-purple-700',
};

// ── Main Component ────────────────────────────────────────────────────────────

export default function TemplatesPage() {
  const { data: session } = useSession();
  const isPro = session?.user?.subscription === 'pro' || session?.user?.subscription === 'annual';

  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [selected, setSelected] = useState<Template | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (category) params.set('category', category);
      const res = await fetch(`/api/templates?${params.toString()}`);
      const data = await res.json();
      if (res.ok) setTemplates(data.templates ?? []);
    } catch {
      toast.error('Failed to load templates.');
    } finally {
      setLoading(false);
    }
  }, [search, category]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  function handleSelect(template: Template) {
    setSelected(template);
    setResult(null);
    try {
      const defaults = JSON.parse(template.defaultValues || '{}');
      setFormValues(defaults);
    } catch {
      setFormValues({});
    }
  }

  function handleBack() {
    setSelected(null);
    setResult(null);
    setFormValues({});
  }

  async function handleGenerate() {
    if (!selected) return;

    const fields: FieldDef[] = JSON.parse(selected.inputSchema || '[]');
    const missing = fields.filter((f) => f.required && !formValues[f.name]?.trim());
    if (missing.length > 0) {
      toast.error(`Please fill in: ${missing.map((f) => f.label).join(', ')}`);
      return;
    }

    setGenerating(true);
    try {
      const res = await fetch('/api/generate/template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId: selected.id, inputs: formValues }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 403) {
          setUpgradeOpen(true);
          return;
        }
        throw new Error(data.error ?? 'Generation failed.');
      }
      setResult(data.result);
      toast.success('Content generated!');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Generation failed.');
    } finally {
      setGenerating(false);
    }
  }

  async function handleSave() {
    if (!result || !selected) return;
    if (!isPro) {
      setUpgradeOpen(true);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${selected.title} — ${formValues.gymName || formValues.eventName || new Date().toLocaleDateString()}`,
          type: 'template',
          content: JSON.stringify({ result, templateTitle: selected.title, inputs: formValues }),
          tags: `template,${selected.category}`,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success('Saved to projects!');
    } catch {
      toast.error('Failed to save project.');
    } finally {
      setSaving(false);
    }
  }

  function handleCopy() {
    if (!result) return;
    navigator.clipboard.writeText(result);
    toast.success('Copied to clipboard!');
  }

  function handleDownload() {
    if (!result || !selected) return;
    const blob = new Blob([result], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selected.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded!');
  }

  // ── Template Detail / Form View ───────────────────────────────────────────
  if (selected) {
    let fields: FieldDef[] = [];
    try { fields = JSON.parse(selected.inputSchema || '[]'); } catch { /* empty */ }

    return (
      <div className="p-6 md:p-8 max-w-3xl mx-auto">
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> Back to templates
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', CATEGORY_COLORS[selected.category] ?? 'bg-gray-100 text-gray-700')}>
              {selected.category}
            </span>
            {selected.isSystem && (
              <span className="flex items-center gap-1 text-xs text-amber-600">
                <Star className="h-3 w-3" /> System template
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{selected.title}</h1>
          <p className="mt-1 text-gray-500 text-sm">{selected.description}</p>
        </div>

        {/* Form */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 mb-4 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">Fill in the details</h2>
          {fields.map((field) => {
            if (field.type === 'select') {
              return (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>
                  <select
                    value={formValues[field.name] || ''}
                    onChange={(e) => setFormValues((v) => ({ ...v, [field.name]: e.target.value }))}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                  >
                    <option value="">Select…</option>
                    {(field.options || []).map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              );
            }
            if (field.type === 'textarea') {
              return (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>
                  <textarea
                    value={formValues[field.name] || ''}
                    onChange={(e) => setFormValues((v) => ({ ...v, [field.name]: e.target.value }))}
                    placeholder={field.placeholder}
                    rows={3}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 resize-none"
                  />
                </div>
              );
            }
            return (
              <Input
                key={field.name}
                label={`${field.label}${field.required ? ' *' : ''}`}
                value={formValues[field.name] || ''}
                onChange={(e) => setFormValues((v) => ({ ...v, [field.name]: e.target.value }))}
                placeholder={field.placeholder}
              />
            );
          })}

          <Button
            fullWidth
            size="lg"
            onClick={handleGenerate}
            loading={generating}
          >
            <Sparkles className="h-4 w-4" />
            {generating ? 'Generating…' : 'Generate Content'}
          </Button>
        </div>

        {/* Result */}
        {result && (
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-700">Generated Content</h3>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={handleCopy}>
                  <Copy className="h-3.5 w-3.5" /> Copy
                </Button>
                <Button variant="ghost" size="sm" onClick={handleDownload}>
                  <Download className="h-3.5 w-3.5" /> .md
                </Button>
                <Button size="sm" onClick={handleSave} loading={saving}>
                  <Save className="h-3.5 w-3.5" />
                  {!isPro && <Crown className="h-3 w-3 text-amber-300" />}
                  Save
                </Button>
              </div>
            </div>
            <div className="p-5 max-h-[600px] overflow-y-auto">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                {result}
              </pre>
            </div>
          </div>
        )}

        <UpgradeModal
          open={upgradeOpen}
          onClose={() => setUpgradeOpen(false)}
          reason="Upgrade to Pro to save projects and get unlimited generations."
        />
      </div>
    );
  }

  // ── Template Gallery View ─────────────────────────────────────────────────
  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
          <LayoutTemplate className="h-5 w-5 text-purple-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Template Library</h1>
          <p className="text-sm text-gray-500">
            {templates.length} cheer-specific templates ready to use
          </p>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates…"
            className="w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={cn(
                'px-3 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap',
                category === cat.value
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(9)].map((_, i) => <TemplateSkeleton key={i} />)}
        </div>
      ) : templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <LayoutTemplate className="h-12 w-12 text-gray-300 mb-3" />
          <p className="text-sm font-medium text-gray-500">
            {search || category ? 'No templates match your filters.' : 'No templates available.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {templates.map((template) => (
            <Card
              key={template.id}
              hover
              className="cursor-pointer transition-all hover:border-brand-300 hover:shadow-md"
              onClick={() => handleSelect(template)}
            >
              <CardBody className="h-full flex flex-col">
                <div className="flex items-center gap-2 mb-2.5">
                  <span className={cn(
                    'text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide',
                    CATEGORY_COLORS[template.category] ?? 'bg-gray-100 text-gray-700'
                  )}>
                    {template.category}
                  </span>
                  {template.usageCount > 50 && (
                    <span className="flex items-center gap-0.5 text-[10px] text-amber-600 font-medium">
                      <Star className="h-2.5 w-2.5" /> Popular
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1.5 leading-snug">
                  {template.title}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed flex-1 mb-4">
                  {template.description}
                </p>
                {template.tags && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {template.tags.split(',').slice(0, 3).map((tag) => (
                      <span key={tag} className="text-[10px] bg-gray-100 text-gray-500 rounded px-1.5 py-0.5">
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
                <Button fullWidth variant="secondary" size="sm">
                  <Sparkles className="h-3.5 w-3.5" /> Use Template
                </Button>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Pro CTA for custom templates */}
      {!isPro && (
        <div className="mt-8 rounded-xl border-2 border-dashed border-brand-200 bg-brand-50/50 p-6 text-center">
          <Crown className="h-8 w-8 text-brand-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-brand-900 mb-1">Create Custom Templates</p>
          <p className="text-xs text-brand-600 mb-3">Save your own prompt templates and reuse them anytime. Pro feature.</p>
          <Button size="sm" onClick={() => setUpgradeOpen(true)}>
            Upgrade to Pro
          </Button>
        </div>
      )}

      <UpgradeModal
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        reason="Upgrade to Pro for unlimited template generations and custom templates."
      />
    </div>
  );
}
