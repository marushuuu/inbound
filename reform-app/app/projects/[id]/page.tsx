"use client";

import { useRouter } from "next/navigation";
import { use, useEffect } from "react";
import { useProject, useStore } from "@/lib/store";
import type { Project } from "@/lib/types";

/** 案件のステータスに応じて、開くべきステップを決める */
function stepFor(project: Project): string {
  switch (project.status) {
    case "contracted":
      return "contract";
    // 失注案件は、失注理由パネルのある見積画面を開く
    case "lost":
      return "estimate";
    case "presented":
      return project.schedule ? "contract" : "schedule";
    case "estimating":
      return "estimate";
    default:
      return "hearing";
  }
}

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
    router.replace(`/projects/${id}/${stepFor(project)}`);
  }, [ready, project, id, router]);

  return <p className="text-sm text-ink-600">読み込み中…</p>;
}
