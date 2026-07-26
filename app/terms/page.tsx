import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service / 利用規約",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="text-3xl font-bold text-slate-900">
        Terms of Service / 利用規約
      </h1>
      <p className="mt-6 text-slate-600">
        This page is a placeholder. The full Terms of Service for Torii Jobs
        will be published before launch.
      </p>
      <p className="mt-3 text-slate-600">
        本ページは準備中です。Torii Jobs の利用規約は正式リリース前に公開されます。
      </p>
    </div>
  );
}
