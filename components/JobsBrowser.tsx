"use client";

import { useMemo, useState } from "react";
import { JOBS, CATEGORIES } from "@/lib/jobs";
import JobCard from "@/components/JobCard";

const JAPANESE_FILTERS = [
  { value: "", label: "Any Japanese level" },
  { value: "None", label: "No Japanese required" },
  { value: "N5", label: "N5 or below" },
  { value: "N4", label: "N4 or below" },
  { value: "N3", label: "N3 or below" },
  { value: "N2", label: "N2 or below" },
  { value: "N1", label: "N1 or below" },
];

const LEVEL_ORDER = ["None", "N5", "N4", "N3", "N2", "N1"];

const selectClass =
  "rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100";

export default function JobsBrowser({
  initialCategory,
}: {
  initialCategory: string;
}) {
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [japaneseMax, setJapaneseMax] = useState("");
  const [visaOnly, setVisaOnly] = useState(false);

  const filtered = useMemo(() => {
    return JOBS.filter((job) => {
      if (category && job.category !== category) return false;
      if (visaOnly && !job.visaSupport) return false;
      if (
        japaneseMax &&
        LEVEL_ORDER.indexOf(job.japaneseLevel) >
          LEVEL_ORDER.indexOf(japaneseMax)
      ) {
        return false;
      }
      if (keyword) {
        const haystack =
          `${job.title} ${job.company} ${job.location} ${job.summary} ${job.tags.join(" ")}`.toLowerCase();
        if (!haystack.includes(keyword.toLowerCase())) return false;
      }
      return true;
    });
  }, [keyword, category, japaneseMax, visaOnly]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Search title, company, city…"
          className="min-w-56 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
        <select
          aria-label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={selectClass}
        >
          <option value="">All categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <select
          aria-label="Japanese level"
          value={japaneseMax}
          onChange={(e) => setJapaneseMax(e.target.value)}
          className={selectClass}
        >
          {JAPANESE_FILTERS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={visaOnly}
            onChange={(e) => setVisaOnly(e.target.checked)}
            className="h-4 w-4 accent-brand-600"
          />
          Visa support
        </label>
      </div>

      <p className="mt-6 text-sm text-slate-500">
        {filtered.length} job{filtered.length === 1 ? "" : "s"} found
      </p>

      <div className="mt-4 grid gap-5 sm:grid-cols-2">
        {filtered.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="mt-10 rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
          No jobs match your filters. Try widening your search.
        </div>
      )}
    </div>
  );
}
