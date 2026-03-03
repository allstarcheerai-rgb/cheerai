'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { CalendarDays, Sparkles, Copy, Save, Crown, Download, Lock } from 'lucide-react';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import toast from 'react-hot-toast';
import Link from 'next/link';

const DURATIONS = [
  { value: '60', label: '60 minutes' },
  { value: '90', label: '90 minutes' },
  { value: '120', label: '120 minutes' },
];

const SKILL_LEVELS = [
  { value: 'Level 1', label: 'Level 1 (Beginner)' },
  { value: 'Level 2', label: 'Level 2' },
  { value: 'Level 3', label: 'Level 3' },
  { value: 'Level 4', label: 'Level 4' },
  { value: 'Level 5', label: 'Level 5' },
  { value: 'Level 6 / Open', label: 'Level 6 / Open' },
];

const FOCUS_AREA_OPTIONS = [
  'Stunts', 'Pyramids', 'Tumbling', 'Jumps', 'Motions & Technique',
  'Dance / Choreography', 'Formations & Transitions', 'Full Routine Run-Throughs',
  'Cheer & Crowd Leading', 'Conditioning / Strength',
];

export default function PracticePlannerPage() {
  const { data: session } = useSession();
  const isPro = session?.user?.subscription === 'pro' || session?.user?.subscription === 'annual';

  const [form, setForm] = useState({
    duration: '90',
    skillLevel: 'Level 4',
    teamSize: '16',
    upcomingComp: '',
    notes: '',
  });
  const [focusAreas, setFocusAreas] = useState<string[]>(['Stunts', 'Tumbling', 'Full Routine Run-Throughs']);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!isPro) {
    return (
      <div className="p-6 md:p-8 max-w-2xl mx-auto">
        <div className="flex flex-col items-center justify-center min-h-[500px] text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100 mb-5">
            <Lock className="h-8 w-8 text-brand-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Practice Planner</h1>
          <p className="text-gray-500 mb-6 max-w-sm">
            Generate complete 60, 90, or 120-minute practice plans tailored to your skill level and goals. Available on Pro.
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

  function toggleFocus(area: string) {
    setFocusAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (focusAreas.length === 0) {
      toast.error('Select at least one focus area.');
      return;
    }
    setLoading(true);
    setResult('');
    try {
      const res = await fetch('/api/generate/practice-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, focusAreas }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Generation failed.');
      setResult(data.plan);
      toast.success('Practice plan generated!');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!result) return;
    setSaving(true);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${form.skillLevel} — ${form.duration}min Practice Plan`,
          type: 'practice-plan',
          content: JSON.stringify({ form, focusAreas, result }),
          tags: `practice,${form.skillLevel.toLowerCase().replace(' ', '-')},${form.duration}min`,
        }),
      });
      if (!res.ok) throw new Error('Save failed.');
      toast.success('Saved to Projects!');
    } catch {
      toast.error('Could not save.');
    } finally {
      setSaving(false);
    }
  }

  function handleDownload() {
    const blob = new Blob([result], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `practice-plan-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
          <CalendarDays className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Practice Planner</h1>
          <p className="text-sm text-gray-500">AI-generated practice plans by skill level and goals.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <form onSubmit={handleGenerate} className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader><h2 className="text-sm font-semibold text-gray-700">Practice Setup</h2></CardHeader>
            <CardBody className="space-y-4">
              <Select label="Duration" options={DURATIONS} value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
              <Select label="Skill Level" options={SKILL_LEVELS} value={form.skillLevel} onChange={(e) => setForm({ ...form, skillLevel: e.target.value })} />
              <Input label="Team Size" type="number" min="4" max="40" value={form.teamSize} onChange={(e) => setForm({ ...form, teamSize: e.target.value })} />
              <Input label="Upcoming Competition (optional)" placeholder="e.g. NCA Nationals in 2 weeks" value={form.upcomingComp} onChange={(e) => setForm({ ...form, upcomingComp: e.target.value })} />
            </CardBody>
          </Card>

          <Card>
            <CardHeader><h2 className="text-sm font-semibold text-gray-700">Focus Areas</h2></CardHeader>
            <CardBody>
              <div className="flex flex-wrap gap-2">
                {FOCUS_AREA_OPTIONS.map((area) => (
                  <button
                    key={area}
                    type="button"
                    onClick={() => toggleFocus(area)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      focusAreas.includes(area)
                        ? 'bg-brand-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {area}
                  </button>
                ))}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Textarea label="Coach Notes (optional)" placeholder="Anything specific: athlete injuries, weak skills, comp deductions to fix…" rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </CardBody>
          </Card>

          <Button type="submit" fullWidth loading={loading} size="lg">
            <Sparkles className="h-4 w-4" />
            {loading ? 'Building plan…' : 'Generate Practice Plan'}
          </Button>
        </form>

        <div className="lg:col-span-3">
          {!result && !loading && (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 text-center p-8">
              <CalendarDays className="h-12 w-12 text-gray-300 mb-3" />
              <p className="text-sm font-medium text-gray-500">Your practice plan will appear here</p>
            </div>
          )}
          {loading && (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] rounded-xl border border-gray-200 bg-white">
              <div className="animate-pulse flex flex-col items-center gap-3">
                <Sparkles className="h-10 w-10 text-blue-400" />
                <p className="text-sm text-gray-500">Building your practice plan…</p>
              </div>
            </div>
          )}
          {result && (
            <div className="space-y-3">
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(result); toast.success('Copied!'); }}>
                  <Copy className="h-3.5 w-3.5" /> Copy
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="h-3.5 w-3.5" /> .md
                </Button>
                <Button variant="primary" size="sm" onClick={handleSave} loading={saving}>
                  <Save className="h-3.5 w-3.5" /> Save
                </Button>
              </div>
              <Card>
                <CardBody className="max-h-[600px] overflow-y-auto">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">{result}</pre>
                </CardBody>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
