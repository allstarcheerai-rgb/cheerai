import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-hero-gradient flex flex-col">
      <header className="px-6 py-5">
        <Link href="/" className="flex items-center gap-2 text-white font-bold text-lg w-fit">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          Cheer AI
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>

      <footer className="text-center py-6 text-white/40 text-xs">
        © {new Date().getFullYear()} Cheer AI
      </footer>
    </div>
  );
}
