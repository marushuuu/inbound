import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-slate-50">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span aria-hidden className="text-xl">
              ⛩️
            </span>
            <span className="font-bold text-slate-900">
              Torii<span className="text-brand-600">Jobs</span>
            </span>
          </div>
          <p className="mt-3 text-sm text-slate-500">
            Your gateway to working in Japan&apos;s tourism &amp; hospitality
            industry.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-900">Job seekers</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-500">
            <li>
              <Link href="/jobs" className="hover:text-brand-700">
                Browse jobs
              </Link>
            </li>
            <li>
              <Link href="/signup" className="hover:text-brand-700">
                Create an account
              </Link>
            </li>
            <li>
              <Link href="/login" className="hover:text-brand-700">
                Log in
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            事業者の方へ
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-500">
            <li>
              <Link href="/employers" className="hover:text-brand-700">
                求人掲載について
              </Link>
            </li>
            <li>
              <Link href="/signup?type=employer" className="hover:text-brand-700">
                事業者登録(無料)
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-900">Company</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-500">
            <li>
              <Link href="/terms" className="hover:text-brand-700">
                Terms / 利用規約
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-brand-700">
                Privacy / プライバシーポリシー
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-100 py-4 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} Torii Jobs. All rights reserved.
      </div>
    </footer>
  );
}
