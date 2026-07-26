import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span aria-hidden className="text-2xl">
            ⛩️
          </span>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            Torii<span className="text-brand-600">Jobs</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 sm:flex">
          <Link href="/jobs" className="hover:text-brand-700">
            Find jobs
          </Link>
          <Link href="/employers" className="hover:text-brand-700">
            事業者の方へ
          </Link>
        </nav>

        <div className="flex items-center gap-3 text-sm font-medium">
          <Link
            href="/login"
            className="rounded-lg px-3 py-2 text-slate-600 hover:text-brand-700"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-brand-600 px-4 py-2 text-white shadow-sm transition hover:bg-brand-700"
          >
            Sign up free
          </Link>
        </div>
      </div>
    </header>
  );
}
