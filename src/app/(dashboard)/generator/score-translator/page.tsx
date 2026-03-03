'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Star, Sparkles, Copy, Save, Crown, Download, Lock } from 'lucide-react';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import toast from 'react-hot-toast';
import Link from 'next/link';

const SCORING_SYSTEMS = [
  { value: 'USASF', label: 'USASF (All-Star Standard)' },
  { value: 'NCA', label: 'NCA / Varsity' },
  { value: 'UCA', label: 'UCA / Universal' },
  { value: 'ICU', label: 'ICU (International)' },
  { value: 'Generic', label: 'Generic / Custom' },
];

const DIVISIONS = [
  { value: 'Youth', label: 'Youth' },
  { value: 'Junior', label: 'Junior' },
  { value: 'Senior', label: 'Senior' },
  { value: 'Open', label: 'Open' },
  { value: 'School', label: 'School / Scholastic' },
];

const WEAK_AREA_OPTIONS = [
  'Stunts - Execution', 'Stunts - Difficulty',
  'Pyramids - Execution', 'Pyramids - Difficulty',
  'Tumbling - Execution', 'Tumbling - Difficulty',
  'Jumps', 'Motions & Technique', 'Dance / Performance',
  'Building Transitions', 'Routine Flow', 'Overall Connection',
];

export default function ScoreTranslatorPage() {
  const { data: session } = useSession();
  const isPro = session?.user?.subscription === 'pro' || session?.user?.subscription === 'annual';

  const [form, setForm] = useState({
    scoringSystem: 'USASF',
    division: 'Senior',
    customNotes: '',
  });
  const [weakAreas, setWeakAreas] = useState<string[]>([]);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!isPro) {
    return (
      <div className="p-6 md:p-8 max-w-2xl mx-auto">
        <div className="flex flex-col items-center justify-center min-h-[500px] text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 mb-5">
            <Lock className="h-8 w-8 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Score Sheet Translator</h1>
          <p className="text-gray-500 mb-6 max-w-sm">
            Understand exactly what judges look for and get an actionable improvement checklist. Available on Pro.
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

  function toggleWeak(area: string) {
    setWeakAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult('');
    try {
      const res = await fetch('/api/generate/score-translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, weakAreas }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Generation failed.');
      setResult(data.explanation);
      toast.success('Score sheet explained!');
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
          title: `${form.scoringSystem} Score Sheet — ${form.division}`,
          type: 'score-translate',
          content: JSON.stringify({ form, weakAreas, result }),
          tags: `score,${form.scoringSystem.toLowerCase()},${form.division.toLowerCase()}`,
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

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
          <Star className="h-5 w-5 text-amber-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Score Sheet Translator</h1>
          <p className="text-sm text-gray-500">Plain-English breakdown of what judges score + improvement checklist.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <form onSubmit={handleGenerate} className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader><h2 className="text-sm font-semibold text-gray-700">Competition Info</h2></CardHeader>
            <CardBody className="space-y-4">
              <Select label="Scoring System" options={SCORING_SYSTEMS} value={form.scoringSystem} onChange={(e) => setForm({ ...form, scoringSystem: e.target.value })} />
              <Select label="Division" options={DIVISIONS} value={form.division} onChange={(e) => setForm({ ...form, division: e.target.value })} />
            </CardBody>
          </Card>

          <Card>
            <CardHeader><h2 className="text-sm font-semibold text-gray-700">Weak Areas to Focus On</h2></CardHeader>
            <CardBody>
              <div className="flex flex-wrap gap-2">
                {WEAK_AREA_OPTIONS.map((area) => (
                  <button
                    key={area}
                    type="button"
                    onClick={() => toggleWeak(area)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      weakAreas.includes(area)
                        ? 'bg-amber-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {area}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2">Select areas where you lost points last competition.</p>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Textarea label="Additional Context (optional)" placeholder="We lost 0.4 in Stunts difficulty and don't know why…" rows={3} value={form.customNotes} onChange={(e) => setForm({ ...form, customNotes: e.target.value })} />
            </CardBody>
          </Card>

          <Button type="submit" fullWidth loading={loading} size="lg">
            <Sparkles className="h-4 w-4" />
            {loading ? 'Translating…' : 'Translate Score Sheet'}
          </Button>
        </form>

        <div className="lg:col-span-3">
          {!result && !loading && (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 text-center p-8">
              <Star className="h-12 w-12 text-gray-300 mb-3" />
              <p className="text-sm font-medium text-gray-500">Your score sheet breakdown will appear here</p>
            </div>
          )}
          {loading && (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] rounded-xl border border-gray-200 bg-white">
              <div className="animate-pulse flex flex-col items-center gap-3">
                <Sparkles className="h-10 w-10 text-amber-400" />
                <p className="text-sm text-gray-500">Translating your score sheet…</p>
              </div>
            </div>
          )}
          {result && (
            <div className="space-y-3">
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(result); toast.success('Copied!'); }}>
                  <Copy className="h-3.5 w-3.5" /> Copy
                </Button>
                <Button variant="outline" size="sm" onClick={() => {
                  const blob = new Blob([result], { type: 'text/markdown' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a'); a.href = url; a.download = `score-sheet-${Date.now()}.md`; a.click();
                }}>
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
