'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  Image as ImageIcon,
  Sparkles,
  Download,
  RefreshCw,
  Save,
  Crown,
  Lock,
  ZoomIn,
  X,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardBody } from '@/components/ui/Card';
import { UpgradeModal } from '@/components/dashboard/UpgradeModal';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

// ── Types / Constants ────────────────────────────────────────────────────────

const FORMATS = [
  { value: 'ig-post', label: 'Instagram Post (1:1)' },
  { value: 'ig-story', label: 'Instagram Story (9:16)' },
  { value: 'flyer', label: 'Flyer (8.5 × 11)' },
  { value: 'banner', label: 'Banner (3:1)' },
];

const STYLES = [
  { value: 'sparkly-glam', label: '✨ Sparkly Glam' },
  { value: 'competition-lights', label: '🎭 Competition Lights' },
  { value: 'legacy-classic', label: '👑 Legacy Classic' },
  { value: 'clean-modern', label: '◻️ Clean Modern' },
  { value: 'southern-preppy', label: '📣 Southern Preppy' },
];

const IMAGE_COUNTS = [
  { value: '2', label: '2 images' },
  { value: '3', label: '3 images' },
  { value: '4', label: '4 images' },
];

interface GeneratedResult {
  imageUrls: string[];
  imagePrompt: string;
  format: string;
  style: string;
  dimensions: { width: number; height: number };
}

// ── Component ────────────────────────────────────────────────────────────────

export default function ImageGeneratorPage() {
  const { data: session } = useSession();
  const isPro = session?.user?.subscription === 'pro' || session?.user?.subscription === 'annual';

  const [form, setForm] = useState({
    format: 'ig-post',
    style: 'sparkly-glam',
    gymName: '',
    eventName: '',
    eventDate: '',
    location: '',
    callToAction: '',
    imageCount: '2',
  });
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<GeneratedResult | null>(null);
  const [loadingImages, setLoadingImages] = useState<Record<number, boolean>>({});
  const [zoomed, setZoomed] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const update = (field: string, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  async function handleGenerate() {
    if (!isPro) { setUpgradeOpen(true); return; }
    if (!form.gymName.trim()) {
      toast.error('Gym name is required.');
      return;
    }

    setGenerating(true);
    setResult(null);
    const initLoading: Record<number, boolean> = {};
    for (let i = 0; i < Number(form.imageCount); i++) initLoading[i] = true;
    setLoadingImages(initLoading);

    try {
      const res = await fetch('/api/generate/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          imageCount: Number(form.imageCount),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 403) { setUpgradeOpen(true); return; }
        throw new Error(data.error ?? 'Generation failed.');
      }
      setResult(data);
      toast.success('Images generated! Loading previews…');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Generation failed.');
    } finally {
      setGenerating(false);
    }
  }

  function handleImageLoad(i: number) {
    setLoadingImages((l) => ({ ...l, [i]: false }));
  }

  async function handleDownload(url: string, i: number) {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const objUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objUrl;
      a.download = `cheer-ai-image-${i + 1}.jpg`;
      a.click();
      URL.revokeObjectURL(objUrl);
      toast.success('Image downloaded!');
    } catch {
      // Fallback: open in new tab
      window.open(url, '_blank');
    }
  }

  async function handleSaveToProject() {
    if (!result) return;
    setSaving(true);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${form.gymName}${form.eventName ? ` — ${form.eventName}` : ''} (Images)`,
          type: 'image',
          content: JSON.stringify({ imagePrompt: result.imagePrompt, inputs: form }),
          outputImages: JSON.stringify(result.imageUrls),
          tags: 'image,marketing',
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

  // ── Pro Gate ─────────────────────────────────────────────────────────────
  if (!isPro) {
    return (
      <div className="p-6 md:p-8 max-w-2xl mx-auto">
        <div className="flex flex-col items-center justify-center min-h-[500px] text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 mb-5">
            <Lock className="h-8 w-8 text-indigo-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">AI Image Generator</h1>
          <p className="text-gray-500 mb-2 max-w-sm">
            Generate stunning cheer marketing graphics for Instagram, stories, and flyers — powered by AI.
          </p>
          <p className="text-sm text-gray-400 mb-6 max-w-sm">
            Image generation is a Pro-exclusive feature. Upgrade to start creating custom cheer graphics.
          </p>
          <Button size="lg" onClick={() => setUpgradeOpen(true)}>
            <Crown className="h-5 w-5 text-amber-300" /> Upgrade to Pro
          </Button>
          <div className="mt-8 grid grid-cols-3 gap-4 w-full max-w-md opacity-40 pointer-events-none">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="aspect-square rounded-xl bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center">
                <ImageIcon className="h-8 w-8 text-white" />
              </div>
            ))}
          </div>
        </div>
        <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} reason="AI Image Generator requires a Pro subscription." />
      </div>
    );
  }

  // ── Main UI ───────────────────────────────────────────────────────────────
  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100">
          <ImageIcon className="h-5 w-5 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">AI Image Generator</h1>
          <p className="text-sm text-gray-500">Generate cheer marketing graphics for social media and print.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Form Panel */}
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <CardBody className="space-y-4">
              <h2 className="text-sm font-semibold text-gray-700 pb-1 border-b border-gray-100">Output Format</h2>

              <Select
                label="Format"
                value={form.format}
                onChange={(e) => update('format', e.target.value)}
              >
                {FORMATS.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </Select>

              <Select
                label="Visual Style"
                value={form.style}
                onChange={(e) => update('style', e.target.value)}
              >
                {STYLES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </Select>

              <Select
                label="Number of Images"
                value={form.imageCount}
                onChange={(e) => update('imageCount', e.target.value)}
              >
                {IMAGE_COUNTS.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </Select>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="space-y-4">
              <h2 className="text-sm font-semibold text-gray-700 pb-1 border-b border-gray-100">Content Details</h2>

              <Input
                label="Gym Name *"
                value={form.gymName}
                onChange={(e) => update('gymName', e.target.value)}
                placeholder="Elite Cheer Academy"
              />
              <Input
                label="Event Name"
                value={form.eventName}
                onChange={(e) => update('eventName', e.target.value)}
                placeholder="Spring Showcase 2026"
              />
              <Input
                label="Event Date"
                value={form.eventDate}
                onChange={(e) => update('eventDate', e.target.value)}
                placeholder="March 15, 2026"
              />
              <Input
                label="Location"
                value={form.location}
                onChange={(e) => update('location', e.target.value)}
                placeholder="Atlanta, GA"
              />
              <Input
                label="Call to Action"
                value={form.callToAction}
                onChange={(e) => update('callToAction', e.target.value)}
                placeholder="Register now! Limited spots."
              />
            </CardBody>
          </Card>

          <Button
            fullWidth
            size="lg"
            onClick={handleGenerate}
            loading={generating}
          >
            <Sparkles className="h-4 w-4" />
            {generating ? 'Generating…' : 'Generate Images'}
          </Button>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-3">
          {!result && !generating && (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 text-center p-8">
              <div className="flex gap-3 mb-4 opacity-30">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-20 w-20 rounded-xl bg-gradient-to-br from-pink-300 to-purple-400" />
                ))}
              </div>
              <ImageIcon className="h-10 w-10 text-gray-300 mb-3" />
              <p className="text-sm font-medium text-gray-400">
                Fill in the form and click Generate to create images
              </p>
              <p className="text-xs text-gray-400 mt-1">
                AI generates a detailed prompt, then creates stunning cheer graphics
              </p>
            </div>
          )}

          {generating && (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] rounded-xl border border-gray-200 bg-white text-center p-8">
              <Loader2 className="h-10 w-10 text-brand-500 animate-spin mb-4" />
              <p className="text-sm font-semibold text-gray-700">Generating your images…</p>
              <p className="text-xs text-gray-400 mt-1">This may take 15–30 seconds</p>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              {/* Action bar */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-700">{result.format}</p>
                  <p className="text-xs text-gray-400">{result.dimensions.width} × {result.dimensions.height}px</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={handleGenerate} loading={generating}>
                    <RefreshCw className="h-3.5 w-3.5" /> Regenerate
                  </Button>
                  <Button size="sm" onClick={handleSaveToProject} loading={saving}>
                    <Save className="h-3.5 w-3.5" /> Save Project
                  </Button>
                </div>
              </div>

              {/* Image Grid */}
              <div className={cn(
                'grid gap-4',
                result.imageUrls.length === 2 ? 'grid-cols-2' : 'grid-cols-2'
              )}>
                {result.imageUrls.map((url, i) => (
                  <div key={i} className="relative group rounded-xl overflow-hidden border border-gray-200 bg-gray-100">
                    {loadingImages[i] && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                        <div className="text-center">
                          <Loader2 className="h-6 w-6 text-brand-500 animate-spin mx-auto mb-1" />
                          <p className="text-xs text-gray-400">Loading…</p>
                        </div>
                      </div>
                    )}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`Generated image ${i + 1}`}
                      className="w-full h-auto object-cover"
                      onLoad={() => handleImageLoad(i)}
                      onError={() => handleImageLoad(i)}
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => setZoomed(url)}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-gray-700 hover:bg-white transition-colors"
                      >
                        <ZoomIn className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDownload(url, i)}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-gray-700 hover:bg-white transition-colors"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* AI Prompt used */}
              <details className="rounded-lg border border-gray-100 bg-gray-50">
                <summary className="px-4 py-2.5 text-xs font-semibold text-gray-500 cursor-pointer hover:text-gray-700">
                  View AI prompt used →
                </summary>
                <div className="px-4 pb-3 pt-1">
                  <p className="text-xs text-gray-500 leading-relaxed">{result.imagePrompt}</p>
                </div>
              </details>
            </div>
          )}
        </div>
      </div>

      {/* Zoom Modal */}
      {zoomed && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setZoomed(null)}
        >
          <button
            onClick={() => setZoomed(null)}
            className="absolute top-4 right-4 h-10 w-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={zoomed}
            alt="Zoomed image"
            className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
