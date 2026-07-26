import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy / プライバシーポリシー",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="text-3xl font-bold text-slate-900">
        Privacy Policy / プライバシーポリシー
      </h1>
      <p className="mt-6 text-slate-600">
        This page is a placeholder. The full Privacy Policy for Torii Jobs will
        be published before launch.
      </p>
      <p className="mt-3 text-slate-600">
        本ページは準備中です。Torii Jobs のプライバシーポリシーは正式リリース前に公開されます。
      </p>
    </div>
  );
}
