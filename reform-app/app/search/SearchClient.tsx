"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { IconDoc } from "@/components/icons";
import { Card, Chip, PageHeader, PrimaryButton } from "@/components/ui";
import { yen } from "@/lib/calc";
import { PAST_ESTIMATES } from "@/lib/data";
import { SIMILARITY_MAX_SCORE, inferBuiltAge, inferWorkType, scoreSimilarity } from "@/lib/similarity";
import { useProject, useStore } from "@/lib/store";

const WORK_TYPES = ["すべて", "浴室・洗面", "水回り複合", "キッチン", "洗面"];
const AGES = ["すべて", "築11〜20年", "築21〜30年", "築31年〜"];

export default function SearchClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("project");
  const { updateProject } = useStore();
  const project = useProject(projectId ?? "");

  const [workType, setWorkType] = useState(
    (project && inferWorkType(project.workTitle)) ?? "すべて",
  );
  const [age, setAge] = useState(
    (project && inferBuiltAge(project.meta)) ?? "すべて",
  );

  const filtered = PAST_ESTIMATES.filter(
    (e) =>
      (workType === "すべて" || e.workType === workType) &&
      (age === "すべて" || e.builtAge === age),
  );

  // 案件から来た場合は類似度スコアで降順に並べる
  const results = project
    ? filtered
        .map((e) => ({ estimate: e, similarity: scoreSimilarity(project, e) }))
        .sort((a, b) => b.similarity.score - a.similarity.score)
    : filtered.map((e) => ({ estimate: e, similarity: null }));

  /**
   * 見積画面へ進む。過去見積を1件も選んでいなくても呼べる(その場合は空の見積から作成)。
   * 案件の紐付けが無い場合は案件一覧へ戻すだけでエラーにはしない。
   */
  const goEstimate = () => {
    if (!project) {
      router.push("/");
      return;
    }
    updateProject(project.id, { status: "estimating", nextAction: "見積作成中" });
    router.push(`/projects/${project.id}/estimate`);
  };

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        backHref={project ? `/projects/${project.id}/hearing` : "/"}
        title="過去見積の検索"
        subtitle={
          project
            ? `${project.customer} との類似度が高い順に表示`
            : "蓄積された見積データベースから検索"
        }
      />

      <div className="flex flex-col gap-2.5">
        <div className="text-xs font-bold text-ink-600">工事種別</div>
        <div className="flex flex-wrap gap-2">
          {WORK_TYPES.map((w) => (
            <Chip key={w} selected={workType === w} onClick={() => setWorkType(w)}>
              {w}
            </Chip>
          ))}
        </div>
        <div className="text-xs font-bold text-ink-600">築年数</div>
        <div className="flex flex-wrap gap-2">
          {AGES.map((a) => (
            <Chip key={a} selected={age === a} onClick={() => setAge(a)}>
              {a}
            </Chip>
          ))}
        </div>
      </div>

      <p className="text-[13px] text-ink-600">{results.length}件ヒット</p>

      <div className="grid gap-3 lg:grid-cols-2">
        {results.map(({ estimate: e, similarity }) => (
          <Card key={e.id} className="flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <span className="text-sm font-bold">{e.title}</span>
              <span className="shrink-0 text-sm font-bold">{yen(e.total)}</span>
            </div>
            <div className="text-xs text-ink-600">
              {e.builtAge}・{e.structure}・{e.year}年
            </div>
            {similarity && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span
                  className={`rounded-md px-1.5 py-0.5 text-[11px] font-bold ${
                    similarity.score >= 5
                      ? "bg-brand-500 text-white"
                      : similarity.score >= 3
                        ? "bg-brand-100 text-brand-700"
                        : "bg-stone-200 text-ink-600"
                  }`}
                >
                  類似度 {similarity.score}/{SIMILARITY_MAX_SCORE}
                </span>
                {similarity.reasons.map((r) => (
                  <span
                    key={r}
                    className="rounded-md bg-stone-100 px-1.5 py-0.5 text-[11px] text-ink-600"
                  >
                    {r}
                  </span>
                ))}
              </div>
            )}
            <p className="text-xs leading-relaxed text-ink-700">{e.highlights}</p>
            {project && (
              <button
                type="button"
                onClick={goEstimate}
                className="mt-1 min-h-11 rounded-lg border border-brand-500 text-[13px] font-bold text-brand-600 hover:bg-brand-50"
              >
                この見積をベースに作成
              </button>
            )}
          </Card>
        ))}
      </div>

      {/* 過去見積を選ばなくても見積作成へ進めるようにする */}
      <div className="flex flex-col gap-2">
        <PrimaryButton onClick={goEstimate}>
          <IconDoc width={18} height={18} />
          {project ? "見積に進む" : "案件一覧へ戻る"}
        </PrimaryButton>
        <p className="text-center text-xs text-ink-600">
          {project
            ? "過去見積を選ばずに、そのまま見積を作成することもできます"
            : "案件のヒアリング画面から検索すると、その案件の見積作成へ進めます"}
        </p>
      </div>
    </div>
  );
}
