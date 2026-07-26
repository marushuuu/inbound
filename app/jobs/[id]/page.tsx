import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JOBS, getJob } from "@/lib/jobs";

export function generateStaticParams() {
  return JOBS.map((job) => ({ id: job.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const job = getJob(id);
  return { title: job ? `${job.title} — ${job.company}` : "Job not found" };
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = getJob(id);
  if (!job) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Link
        href="/jobs"
        className="text-sm font-medium text-brand-700 hover:underline"
      >
        ← Back to all jobs
      </Link>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{job.title}</h1>
            <p className="mt-1 text-slate-600">{job.company}</p>
          </div>
          <span className="rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700">
            {job.employmentType}
          </span>
        </div>

        <dl className="mt-6 grid gap-4 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-slate-500">Location</dt>
            <dd className="font-medium text-slate-800">📍 {job.location}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Salary</dt>
            <dd className="font-medium text-slate-800">💴 {job.salary}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Japanese level</dt>
            <dd className="font-medium text-slate-800">
              🗣{" "}
              {job.japaneseLevel === "None"
                ? "Not required"
                : `JLPT ${job.japaneseLevel} or equivalent`}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Visa support</dt>
            <dd className="font-medium text-slate-800">
              {job.visaSupport ? "✅ Available" : "— Not provided"}
            </dd>
          </div>
        </dl>

        <div className="mt-6 flex flex-wrap gap-2">
          {job.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600"
            >
              {tag}
            </span>
          ))}
        </div>

        <section className="mt-8">
          <h2 className="text-lg font-semibold text-slate-900">
            About this job
          </h2>
          <div className="mt-3 space-y-3 text-slate-700">
            {job.description.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-semibold text-slate-900">Requirements</h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-slate-700">
            {job.requirements.map((req, i) => (
              <li key={i}>{req}</li>
            ))}
          </ul>
        </section>

        <div className="mt-10 border-t border-slate-100 pt-6">
          <Link
            href="/signup"
            className="block w-full rounded-xl bg-brand-600 py-3 text-center font-semibold text-white shadow-sm transition hover:bg-brand-700"
          >
            Sign up free to apply
          </Link>
          <p className="mt-3 text-center text-xs text-slate-500">
            Creating an account takes about 3 minutes.
          </p>
        </div>
      </div>
    </div>
  );
}
