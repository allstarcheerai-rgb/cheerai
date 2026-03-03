'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Megaphone, Sparkles, Copy, Save, Crown, Download } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import toast from 'react-hot-toast';
import Link from 'next/link';

const VIBES = [
  { value: 'rave-comp', label: '⚡ Rave Comp' },
  { value: 'legacy-classic', label: '👑 Legacy Classic' },
  { value: 'sparkly-glam', label: '✨ Sparkly Glam' },
  { value: 'clean-minimal', label: '◻️ Clean Minimal' },
  { value: 'school-spirit', label: '📣 School Spirit' },
];

const LEVELS = [
  { value: 'L1', label: 'Level 1' },
  { value: 'L2', label: 'Level 2' },
  { value: 'L3', label: 'Level 3' },
  { value: 'L4', label: 'Level 4' },
  { value: 'L5', label: 'Level 5' },
  { value: 'L6', label: 'Level 6' },
  { value: 'Open', label: 'Open' },
  { value: 'Senior', label: 'Senior' },
  { value: 'All-Girl', label: 'All-Girl' },
  { value: 'Coed', label: 'Coed' },
];

interface MarketingResult {
  captions: string[];
  contentCalendar: string;
  parentEmail: string;
  designBrief: string;
}

export default function MarketingGeneratorPage() {
  const { data: session } = useSession();
  const isPro = session?.user?.subscription === 'pro' || session?.user?.subscription === 'annual';

  const [form, setForm] = useState({
    gymName: '',
    teamLevel: 'L4',
    eventName: '',
    eventDate: '',
    eventLocation: '',
    brandVibe: 'sparkly-glam',
    primaryColor: '#9333ea',
    accentColor: '#ec4899',
    customNotes: '',
  });

  const [result, setResult] = useState<MarketingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'captions' | 'calendar' | 'email' | 'design'>('captions');
  const [saving, setSaving] = useState(false);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/generate/marketing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Generation failed.');
      setResult(data);
      toast.success('Marketing assets generated!');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!result || !isPro) return;
    setSaving(true);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${form.gymName} — ${form.eventName} (Marketing)`,
          type: 'marketing',
          content: JSON.stringify({ form, result }),
          tags: `marketing,${form.brandVibe},${form.teamLevel}`,
        }),
      });
      if (!res.ok) throw new Error('Save failed.');
      toast.success('Project saved!');
    } catch {
      toast.error('Could not save project.');
    } finally {
      setSaving(false);
    }
  }

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  }

  function handleDownload() {
    if (!result) return;
    const content = [
      `# ${form.gymName} — ${form.eventName} Marketing Pack`,
      `\n## Captions\n${result.captions.join('\n\n')}`,
      `\n## Content Calendar\n${result.contentCalendar}`,
      `\n## Parent Email\n${result.parentEmail}`,
      `\n## Design Brief\n${result.designBrief}`,
    ].join('\n');
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cheer-ai-marketing-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const TABS = [
    { key: 'captions' as const,  label: 'Captions' },
    { key: 'calendar' as const,  label: 'Content Calendar' },
    { key: 'email' as const,     label: 'Parent Email' },
    { key: 'design' as const,    label: 'Design Brief' },
  ];

  const tabContent: Record<string, string> = result
    ? {
        captions: result.captions.join('\n\n---\n\n'),
        calendar: result.contentCalendar,
        email: result.parentEmail,
        design: result.designBrief,
      }
    : {};

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-100">
          <Megaphone className="h-5 w-5 text-pink-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Marketing Generator</h1>
          <p className="text-sm text-gray-500">Generate captions, content calendars, and more.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Form */}
        <form onSubmit={handleGenerate} className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold text-gray-700">Event Details</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <Input
                label="Gym Name"
                required
                placeholder="Voltage Athletics"
                value={form.gymName}
                onChange={(e) => setForm({ ...form, gymName: e.target.value })}
              />
              <Input
                label="Event Name"
                required
                placeholder="Mid-Season Invitational 2025"
                value={form.eventName}
                onChange={(e) => setForm({ ...form, eventName: e.target.value })}
              />
              <Input
                label="Event Date"
                type="date"
                value={form.eventDate}
                onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
              />
              <Input
                label="Event Location"
                placeholder="Atlanta, GA"
                value={form.eventLocation}
                onChange={(e) => setForm({ ...form, eventLocation: e.target.value })}
              />
              <Select
                label="Team Level"
                options={LEVELS}
                value={form.teamLevel}
                onChange={(e) => setForm({ ...form, teamLevel: e.target.value })}
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold text-gray-700">Brand Settings</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <Select
                label="Brand Vibe"
                options={VIBES}
                value={form.brandVibe}
                onChange={(e) => setForm({ ...form, brandVibe: e.target.value })}
              />
              <div className="flex gap-3">
                <div className="flex flex-col gap-1.5 flex-1">
                  <label className="text-sm font-medium text-gray-700">Primary Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={form.primaryColor}
                      onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                      className="h-10 w-10 rounded-lg border border-gray-300 cursor-pointer p-0.5"
                    />
                    <span className="text-xs text-gray-500 font-mono">{form.primaryColor}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 flex-1">
                  <label className="text-sm font-medium text-gray-700">Accent Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={form.accentColor}
                      onChange={(e) => setForm({ ...form, accentColor: e.target.value })}
                      className="h-10 w-10 rounded-lg border border-gray-300 cursor-pointer p-0.5"
                    />
                    <span className="text-xs text-gray-500 font-mono">{form.accentColor}</span>
                  </div>
                </div>
              </div>
              <Textarea
                label="Custom Notes (optional)"
                placeholder="Anything specific to include: team motto, special hashtags, emoji preferences…"
                rows={3}
                value={form.customNotes}
                onChange={(e) => setForm({ ...form, customNotes: e.target.value })}
              />
            </CardBody>
          </Card>

          <Button type="submit" fullWidth loading={loading} size="lg">
            <Sparkles className="h-4 w-4" />
            {loading ? 'Generating…' : 'Generate Assets'}
          </Button>
        </form>

        {/* Results */}
        <div className="lg:col-span-3">
          {!result && !loading && (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 text-center p-8">
              <Megaphone className="h-12 w-12 text-gray-300 mb-3" />
              <p className="text-sm font-medium text-gray-500">Fill in the form and hit Generate</p>
              <p className="text-xs text-gray-400 mt-1">Captions, calendar, parent email & design brief will appear here</p>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] rounded-xl border border-gray-200 bg-white">
              <div className="animate-pulse flex flex-col items-center gap-3">
                <Sparkles className="h-10 w-10 text-brand-400" />
                <p className="text-sm text-gray-500">AI is crafting your marketing pack…</p>
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              {/* Tab navigation */}
              <div className="flex items-center justify-between">
                <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                  {TABS.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                        activeTab === tab.key
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(tabContent[activeTab] ?? '')}
                  >
                    <Copy className="h-3.5 w-3.5" /> Copy
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Download className="h-3.5 w-3.5" /> .md
                  </Button>
                  {isPro ? (
                    <Button variant="primary" size="sm" onClick={handleSave} loading={saving}>
                      <Save className="h-3.5 w-3.5" /> Save
                    </Button>
                  ) : (
                    <Link href="/pricing">
                      <Button variant="outline" size="sm">
                        <Crown className="h-3.5 w-3.5 text-amber-500" /> Save (Pro)
                      </Button>
                    </Link>
                  )}
                </div>
              </div>

              {/* Tab content */}
              <Card>
                <CardBody className="max-h-[600px] overflow-y-auto">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                    {tabContent[activeTab]}
                  </pre>
                </CardBody>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
