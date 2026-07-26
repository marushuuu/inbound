import type { Metadata } from "next";
import JobsBrowser from "@/components/JobsBrowser";

export const metadata: Metadata = {
  title: "Find jobs",
};

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-slate-900">Find jobs in Japan</h1>
      <p className="mt-2 text-slate-600">
        Filter by Japanese level and visa support to find jobs that fit you
        today.
      </p>
      <div className="mt-8">
        <JobsBrowser initialCategory={category ?? ""} />
      </div>
    </div>
  );
}
