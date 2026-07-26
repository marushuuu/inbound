import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "事業者の方へ",
};

export default function EmployersPage() {
  return (
    <div>
      <section className="bg-gradient-to-b from-brand-50 to-white">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-600">
            For Employers
          </p>
          <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-bold tracking-tight text-slate-900">
            インバウンド対応の即戦力、
            <br className="hidden sm:block" />
            多言語人材と出会えます
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
            Torii Jobs は、日本で働きたい外国人材と、ホテル・旅館・飲食店・
            観光施設をつなぐ求人プラットフォームです。言語スキルはすべて
            レベル付きで登録されているため、必要な語学力の人材をすぐに
            見つけられます。
          </p>
          <Link
            href="/signup?type=employer"
            className="mt-8 inline-block rounded-xl bg-brand-600 px-8 py-3 font-semibold text-white shadow-sm transition hover:bg-brand-700"
          >
            無料で事業者登録する
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-center text-2xl font-bold text-slate-900">
          Torii Jobs が選ばれる理由
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {[
            {
              icon: "🗣️",
              title: "言語レベルで検索できる",
              body: "求職者の言語スキルは「言語 × レベル(JLPT等)」で構造化して登録。「英語ビジネス・日本語N2」など条件を絞って探せます。",
            },
            {
              icon: "🌏",
              title: "インバウンド特化",
              body: "登録者は観光・宿泊・飲食での就労を希望する多言語人材。ミスマッチの少ない採用ができます。",
            },
            {
              icon: "💴",
              title: "掲載無料ではじめられる",
              body: "アカウント登録・求人掲載は無料。採用が決まるまで費用はかかりません。",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-200 bg-white p-6"
            >
              <span className="text-3xl">{item.icon}</span>
              <h3 className="mt-4 font-semibold text-slate-900">
                {item.title}
              </h3>
              <p className="mt-2 text-sm text-slate-600">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-center text-2xl font-bold text-slate-900">
            ご利用の流れ
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-4">
            {[
              { step: "1", title: "無料登録", body: "事業者アカウントを作成" },
              { step: "2", title: "求人掲載", body: "必要な言語レベルを設定して掲載" },
              { step: "3", title: "応募・スカウト", body: "応募を待つ、または人材を検索" },
              { step: "4", title: "面接・採用", body: "サイト上でやりとりして採用へ" },
            ].map((item) => (
              <div
                key={item.step}
                className="rounded-2xl border border-slate-200 bg-white p-6 text-center"
              >
                <span className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 font-bold text-white">
                  {item.step}
                </span>
                <h3 className="mt-4 font-semibold text-slate-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600">{item.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/signup?type=employer"
              className="inline-block rounded-xl bg-brand-600 px-8 py-3 font-semibold text-white shadow-sm transition hover:bg-brand-700"
            >
              無料で事業者登録する
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
