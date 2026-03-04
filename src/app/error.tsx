'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('[GlobalError]', error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 mb-6">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>

          <h1 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h1>
          <p className="text-gray-500 text-sm mb-8 max-w-sm">
            An unexpected error occurred. We&apos;ve been notified and are working to fix it.
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={reset}
              className="flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" /> Try Again
            </button>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Home className="h-4 w-4" /> Go Home
            </Link>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <details className="mt-6 text-left max-w-md w-full">
              <summary className="text-xs text-gray-400 cursor-pointer">Error details</summary>
              <pre className="mt-2 text-xs text-red-600 bg-red-50 p-3 rounded-lg overflow-auto">
                {error.message}
              </pre>
            </details>
          )}
        </div>
      </body>
    </html>
  );
}
