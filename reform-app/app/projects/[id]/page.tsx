"use client";

import { useRouter } from "next/navigation";
import { use, useEffect } from "react";
import { useProject, useStore } from "@/lib/store";

/** 案件のステータスに応じた現在ステップへ振り分ける */
export default function ProjectIndexPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { ready } = useStore();
  const project = useProject(id);

  useEffect(() => {
    if (!ready) return;
    if (!project) {
      router.replace("/");
      return;
    }
    const step =
      project.status === "contracted"
        ? "contract"
        : project.status === "presented"
          ? project.schedule
            ? "contract"
            : "schedule"
          : project.status === "estimating"
            ? "estimate"
            : "hearing";
    router.replace(`/projects/${id}/${step}`);
  }, [ready, project, id, router]);

  return <p className="text-sm text-ink-600">読み込み中…</p>;
}
