'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { FileText, Sparkles, Copy, Save, Crown, Download, Lock } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import toast from 'react-hot-toast';
import Link from 'next/link';

const EXAMPLE_NOTES = `Intro - Hit pose 1
1-8 Arm motions
9-16 walk in formation
17-24 hit opening pyramid
[MUSIC DROP]
25-32 stunt section - all groups hit extensions
33-40 lib section group 1, baskettoss groups 2&3
...cradles
41-48 tumbling pass - back walkovers then bhs
49-56 formation change to V
57-64 dance section
65-72 jump sequence - toe touch, pike, toe touch
73-80 pyramid buildup
81-88 top girls hit scorpions
89-96 dismount cradles, hit ending pose`;

export default function RoutineNotesPage() {
  const { data: session } = useSession();
  const isPro = session?.user?.subscription === 'pro' || session?.user?.subscription === 'annual';

  const [rawNotes, setRawNotes] = useState('');
  const [music, setMusic] = useState('');
  const [level, setLevel] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!isPro) {
    return (
      <div className="p-6 md:p-8 max-w-2xl mx-auto">
        <div className="flex flex-col items-center justify-center min-h-[500px] text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 mb-5">
            <Lock className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Routine Notes Formatter</h1>
          <p className="text-gray-500 mb-6 max-w-sm">
            Clean up raw routine counts and notes into a polished, professional document. Available on Pro.
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

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!rawNotes.trim()) {
      toast.error('Paste your routine notes first.');
      return;
    }
    setLoading(true);
    setResult('');
    try {
      const res = await fetch('/api/generate/routine-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawNotes, music, level }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Generation failed.');
      setResult(data.formatted);
      toast.success('Routine notes cleaned up!');
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
          title: music ? `${music} — Routine Notes` : 'Routine Notes',
          type: 'routine-notes',
          content: JSON.stringify({ rawNotes, music, level, result }),
          tags: `routine,notes${level ? ',' + level.toLowerCase() : ''}`,
        }),
      });
      if (!res.ok) throw new Error();
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
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">
          <FileText className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Routine Notes Formatter</h1>
          <p className="text-sm text-gray-500">Paste raw counts → get clean, formatted routine docs.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <form onSubmit={handleGenerate} className="space-y-4">
          <Card>
            <CardHeader><h2 className="text-sm font-semibold text-gray-700">Routine Info (optional)</h2></CardHeader>
            <CardBody className="space-y-3">
              <Input label="Music / Song" placeholder="e.g. Electric Love Remix" value={music} onChange={(e) => setMusic(e.target.value)} />
              <Input label="Level" placeholder="e.g. Level 4 Senior" value={level} onChange={(e) => setLevel(e.target.value)} />
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-700">Raw Routine Notes</h2>
                <button
                  type="button"
                  onClick={() => setRawNotes(EXAMPLE_NOTES)}
                  className="text-xs text-brand-600 hover:underline"
                >
                  Load example
                </button>
              </div>
            </CardHeader>
            <CardBody>
              <Textarea
                placeholder="Paste your raw routine counts and notes here…&#10;&#10;Example:&#10;1-8 Arm motions&#10;9-16 stunt groups hit libs&#10;17-24 tumbling pass..."
                rows={16}
                value={rawNotes}
                onChange={(e) => setRawNotes(e.target.value)}
              />
            </CardBody>
          </Card>

          <Button type="submit" fullWidth loading={loading} size="lg">
            <Sparkles className="h-4 w-4" />
            {loading ? 'Formatting…' : 'Format Routine Notes'}
          </Button>
        </form>

        <div>
          {!result && !loading && (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 text-center p-8">
              <FileText className="h-12 w-12 text-gray-300 mb-3" />
              <p className="text-sm font-medium text-gray-500">Formatted routine will appear here</p>
              <p className="text-xs text-gray-400 mt-1">Includes proper 8-count labels, skill annotations, and transition suggestions</p>
            </div>
          )}
          {loading && (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] rounded-xl border border-gray-200 bg-white">
              <div className="animate-pulse flex flex-col items-center gap-3">
                <Sparkles className="h-10 w-10 text-green-400" />
                <p className="text-sm text-gray-500">Formatting your routine notes…</p>
              </div>
            </div>
          )}
          {result && (
            <div className="space-y-3 sticky top-6">
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(result); toast.success('Copied!'); }}>
                  <Copy className="h-3.5 w-3.5" /> Copy
                </Button>
                <Button variant="outline" size="sm" onClick={() => {
                  const blob = new Blob([result], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a'); a.href = url; a.download = `routine-notes-${Date.now()}.md`; a.click();
                }}>
                  <Download className="h-3.5 w-3.5" /> .md
                </Button>
                <Button variant="primary" size="sm" onClick={handleSave} loading={saving}>
                  <Save className="h-3.5 w-3.5" /> Save
                </Button>
              </div>
              <Card>
                <CardBody className="max-h-[700px] overflow-y-auto">
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
