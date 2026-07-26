"use client";

import { useState } from "react";
import Link from "next/link";
import LanguagePicker from "@/components/LanguagePicker";
import type { LanguageSkill } from "@/lib/languages";

type Tab = "seeker" | "employer";

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100";

function Label({
  children,
  required,
  hint,
}: {
  children: React.ReactNode;
  required?: boolean;
  hint?: string;
}) {
  return (
    <span className="mb-1.5 block text-sm font-medium text-slate-700">
      {children}
      {required && <span className="ml-0.5 text-red-500">*</span>}
      {hint && (
        <span className="ml-2 text-xs font-normal text-slate-400">{hint}</span>
      )}
    </span>
  );
}

export default function SignupForm({ initialTab }: { initialTab: Tab }) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [submitted, setSubmitted] = useState<Tab | null>(null);
  // Japanese ability is the first thing employers ask about, so it is the
  // default first row; English is the most common second language.
  const [languages, setLanguages] = useState<LanguageSkill[]>([
    { language: "ja", level: "" },
    { language: "en", level: "" },
  ]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(tab);
  };

  if (submitted) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <span className="text-4xl">🎉</span>
        <h2 className="mt-4 text-xl font-bold text-slate-900">
          {submitted === "seeker"
            ? "Welcome to Torii Jobs!"
            : "登録ありがとうございます!"}
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          {submitted === "seeker"
            ? "Your account has been created. Let's find your job in Japan."
            : "アカウントが作成されました。求人の掲載を始めましょう。"}
        </p>
        <Link
          href={submitted === "seeker" ? "/jobs" : "/employers"}
          className="mt-6 inline-block rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          {submitted === "seeker" ? "Browse jobs →" : "求人掲載について →"}
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Tab switch */}
      <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1 text-sm font-semibold">
        <button
          type="button"
          onClick={() => setTab("seeker")}
          className={`rounded-lg px-4 py-2.5 transition ${
            tab === "seeker"
              ? "bg-white text-brand-700 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Find a job
          <span className="block text-xs font-normal">仕事を探す(求職者)</span>
        </button>
        <button
          type="button"
          onClick={() => setTab("employer")}
          className={`rounded-lg px-4 py-2.5 transition ${
            tab === "employer"
              ? "bg-white text-brand-700 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          人材を探す
          <span className="block text-xs font-normal">事業者の方</span>
        </button>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        {tab === "seeker" ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <Label required hint="as in your passport">
                  First name
                </Label>
                <input
                  type="text"
                  name="firstName"
                  required
                  autoComplete="given-name"
                  placeholder="e.g. Maria"
                  className={inputClass}
                />
              </label>
              <label className="block">
                <Label required hint="family name">
                  Last name
                </Label>
                <input
                  type="text"
                  name="lastName"
                  required
                  autoComplete="family-name"
                  placeholder="e.g. Santos"
                  className={inputClass}
                />
              </label>
            </div>

            <label className="block">
              <Label required>Email</Label>
              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                className={inputClass}
              />
            </label>

            <label className="block">
              <Label required hint="8+ characters">
                Password
              </Label>
              <input
                type="password"
                name="password"
                required
                minLength={8}
                autoComplete="new-password"
                className={inputClass}
              />
            </label>

            <div>
              <Label hint="employers search by language & level">
                Languages you speak
              </Label>
              <LanguagePicker value={languages} onChange={setLanguages} />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-brand-600 py-3 font-semibold text-white shadow-sm transition hover:bg-brand-700"
            >
              Sign up free &amp; find jobs
            </button>

            <p className="text-center text-xs text-slate-500">
              By signing up you agree to our{" "}
              <Link href="/terms" className="underline">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="underline">
                Privacy Policy
              </Link>
              .
            </p>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block">
              <Label required>会社名・施設名</Label>
              <input
                type="text"
                name="companyName"
                required
                autoComplete="organization"
                placeholder="例: 株式会社さくらホテル"
                className={inputClass}
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <Label required>担当者 姓</Label>
                <input
                  type="text"
                  name="contactLastName"
                  required
                  autoComplete="family-name"
                  placeholder="例: 山田"
                  className={inputClass}
                />
              </label>
              <label className="block">
                <Label required>担当者 名</Label>
                <input
                  type="text"
                  name="contactFirstName"
                  required
                  autoComplete="given-name"
                  placeholder="例: 太郎"
                  className={inputClass}
                />
              </label>
            </div>

            <label className="block">
              <Label required>メールアドレス</Label>
              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                placeholder="you@company.co.jp"
                className={inputClass}
              />
            </label>

            <label className="block">
              <Label required hint="8文字以上">
                パスワード
              </Label>
              <input
                type="password"
                name="password"
                required
                minLength={8}
                autoComplete="new-password"
                className={inputClass}
              />
            </label>

            <button
              type="submit"
              className="w-full rounded-xl bg-brand-600 py-3 font-semibold text-white shadow-sm transition hover:bg-brand-700"
            >
              無料で登録して人材を探す
            </button>

            <p className="text-center text-xs text-slate-500">
              登録すると
              <Link href="/terms" className="underline">
                利用規約
              </Link>
              と
              <Link href="/privacy" className="underline">
                プライバシーポリシー
              </Link>
              に同意したものとみなされます。
            </p>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-slate-500">
          {tab === "seeker" ? (
            <>
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-brand-700 hover:underline"
              >
                Log in
              </Link>
            </>
          ) : (
            <>
              アカウントをお持ちの方は{" "}
              <Link
                href="/login"
                className="font-medium text-brand-700 hover:underline"
              >
                ログイン
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
