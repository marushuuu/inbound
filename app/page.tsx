import Link from "next/link";
import { JOBS, CATEGORIES } from "@/lib/jobs";
import JobCard from "@/components/JobCard";

const CATEGORY_ICONS: Record<string, string> = {
  "Hotel & Ryokan": "🏨",
  "Restaurant & Café": "🍜",
  "Tour & Activity": "🗺️",
  "Resort & Leisure": "🎿",
  "Retail & Duty Free": "🛍️",
  "Office & Marketing": "💼",
};

export default function Home() {
  const featured = JOBS.slice(0, 4);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-brand-50 to-white">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-600">
            Jobs in Japan&apos;s tourism &amp; hospitality industry
          </p>
          <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Your gateway to working in{" "}
            <span className="text-brand-600">Japan</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
            Torii Jobs connects international talent with hotels, ryokan,
            restaurants and resorts across Japan. Many positions offer visa
            support — and your language skills are your strength here.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/signup"
              className="rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-brand-700"
            >
              Sign up free
            </Link>
            <Link
              href="/jobs"
              className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:border-brand-400 hover:text-brand-700"
            >
              Browse jobs
            </Link>
          </div>
          <p className="mt-6 text-sm text-slate-500">
            事業者の方は{" "}
            <Link
              href="/employers"
              className="font-medium text-brand-700 underline underline-offset-2"
            >
              こちら
            </Link>
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-2xl font-bold text-slate-900">
          Explore by category
        </h2>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              href={`/jobs?category=${encodeURIComponent(cat)}`}
              className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white p-5 text-center text-sm font-medium text-slate-700 transition hover:border-brand-300 hover:text-brand-700"
            >
              <span className="text-3xl">{CATEGORY_ICONS[cat]}</span>
              {cat}
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-2xl font-bold text-slate-900">How it works</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {[
              {
                step: "1",
                title: "Create your profile",
                body: "Tell us your languages and experience. It takes 3 minutes and it's completely free.",
              },
              {
                step: "2",
                title: "Find jobs that fit you",
                body: "Filter by Japanese level, location, and visa support to find realistic matches.",
              },
              {
                step: "3",
                title: "Apply & get hired",
                body: "Apply directly to employers who are actively looking for international talent.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="rounded-2xl border border-slate-200 bg-white p-6"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 font-bold text-white">
                  {item.step}
                </span>
                <h3 className="mt-4 font-semibold text-slate-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured jobs */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Featured jobs</h2>
          <Link
            href="/jobs"
            className="text-sm font-medium text-brand-700 hover:underline"
          >
            View all →
          </Link>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {featured.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </section>

      {/* Employer CTA (Japanese) */}
      <section className="bg-brand-800">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6">
          <h2 className="text-2xl font-bold text-white">
            外国人材の採用をお考えの事業者様へ
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-brand-100">
            Torii Jobs
            には、日本で働きたい多言語人材が登録しています。ホテル・旅館・飲食店・観光施設の採用を、掲載から面接までシンプルにサポートします。
          </p>
          <Link
            href="/employers"
            className="mt-6 inline-block rounded-xl bg-white px-6 py-3 font-semibold text-brand-800 transition hover:bg-brand-50"
          >
            求人掲載について見る
          </Link>
        </div>
      </section>
    </div>
  );
}
