import type { Metadata } from "next";
import SignupForm from "@/components/SignupForm";

export const metadata: Metadata = {
  title: "Sign up",
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const initialTab = type === "employer" ? "employer" : "seeker";

  return (
    <div className="mx-auto max-w-xl px-4 py-14 sm:px-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900">
          Create your free account
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          無料会員登録 — 求職者・事業者とも、登録は完全無料です。
        </p>
      </div>
      <div className="mt-8">
        <SignupForm initialTab={initialTab} />
      </div>
    </div>
  );
}
