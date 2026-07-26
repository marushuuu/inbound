import Link from "next/link";
import type { Job } from "@/lib/jobs";

export default function JobCard({ job }: { job: Job }) {
  return (
    <Link
      href={`/jobs/${job.id}`}
      className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-900 group-hover:text-brand-700">
            {job.title}
          </h3>
          <p className="mt-1 text-sm text-slate-500">{job.company}</p>
        </div>
        <span className="shrink-0 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
          {job.employmentType}
        </span>
      </div>

      <p className="mt-3 line-clamp-2 text-sm text-slate-600">{job.summary}</p>

      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        {job.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-slate-100 pt-4 text-sm text-slate-500">
        <span>📍 {job.location}</span>
        <span>💴 {job.salary}</span>
        <span>
          🗣 Japanese:{" "}
          {job.japaneseLevel === "None" ? "Not required" : job.japaneseLevel}
        </span>
      </div>
    </Link>
  );
}
