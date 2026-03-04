import Link from 'next/link';
import { Sparkles, ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-pink-500 mb-6 shadow-lg">
        <Sparkles className="h-8 w-8 text-white" />
      </div>

      <div className="text-6xl font-black text-gray-900 mb-2">404</div>
      <h1 className="text-xl font-bold text-gray-700 mb-2">Page not found</h1>
      <p className="text-gray-500 text-sm mb-8 max-w-sm">
        Looks like this page landed off the mat. Let&apos;s get you back to the floor.
      </p>

      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors shadow-sm"
        >
          <Home className="h-4 w-4" /> Go to Dashboard
        </Link>
        <Link
          href="/"
          className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back Home
        </Link>
      </div>
    </div>
  );
}
