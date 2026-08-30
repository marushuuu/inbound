"use client";

import { useRouter } from "next/navigation";
import { use } from "react";
import { IconAlert, IconSearch } from "@/components/icons";
import {
  Card,
  Chip,
  PageHeader,
  PrimaryButton,
  SectionTitle,
  StepNav,
} from "@/components/ui";
import { BUDGET_OPTIONS, TRIGGER_OPTIONS } from "@/lib/data";
import { useProject, useStore } from "@/lib/store";
import type { Hearing } from "@/lib/types";

export default function HearingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { updateProject, ready } = useStore();
  const project = useProject(id);

  if (!ready) return <p className="text-sm text-ink-600">読み込み中…</p>;
  if (!project) return <p className="text-sm text-ink-600">案件が見つかりません。</p>;

  const hearing = project.hearing;
  const patch = (h: Partial<Hearing>) =>
    updateProject(id, {
      hearing: { ...hearing, ...h },
      status: project.status === "new" ? "hearing" : project.status,
    });

  const toggleTrigger = (t: string) =>
    patch({
      triggers: hearing.triggers.includes(t)
        ? hearing.triggers.filter((x) => x !== t)
        : [...hearing.triggers, t],
    });

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        backHref="/"
        title={`${project.customer}｜${project.workTitle}`}
        subtitle={project.meta}
      />
      <StepNav projectId={id} current="hearing" />

      <section className="flex flex-col gap-2.5">
        <SectionTitle>きっかけ・お悩み</SectionTitle>
        <div className="flex flex-wrap gap-2">
          {TRIGGER_OPTIONS.map((t) => (
            <Chip
              key={t}
              selected={hearing.triggers.includes(t)}
              onClick={() => toggleTrigger(t)}
            >
              {t}
            </Chip>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-2.5">
        <SectionTitle>ご予算の目安</SectionTitle>
        <div className="flex flex-wrap gap-2">
          {BUDGET_OPTIONS.map((b) => (
            <Chip
              key={b}
              selected={hearing.budget === b}
              onClick={() => patch({ budget: hearing.budget === b ? null : b })}
            >
              {b}
            </Chip>
          ))}
        </div>
        <Card className="flex items-center justify-between py-3">
          <span className="text-[13px] text-ink-600">ご予算</span>
          <input
            value={hearing.budgetCeiling}
            onChange={(e) => patch({ budgetCeiling: e.target.value })}
            placeholder="¥2,200,000"
            className="w-40 text-right text-[15px] font-bold focus:outline-none"
          />
        </Card>
      </section>

      <section className="flex flex-col gap-2.5">
        <SectionTitle>希望時期</SectionTitle>
        <input
          value={hearing.timing}
          onChange={(e) => patch({ timing: e.target.value })}
          placeholder="例: 10月中旬までに完了希望"
          className="min-h-12 rounded-xl border border-stone-200 bg-white px-3.5 text-sm focus:border-brand-500 focus:outline-none"
        />
      </section>

      <section className="flex flex-col gap-2.5">
        <SectionTitle>過去のリフォーム履歴</SectionTitle>
        <input
          value={hearing.history}
          onChange={(e) => patch({ history: e.target.value })}
          placeholder="例: 2018年 給湯器交換(他社施工)"
          className="min-h-12 rounded-xl border border-stone-200 bg-white px-3.5 text-sm focus:border-brand-500 focus:outline-none"
        />
      </section>

      <Card className="flex items-center justify-between py-3">
        <div>
          <div className="text-sm font-bold">キーマン同席</div>
          <div className="text-xs text-ink-600">意思決定者の同席を確認</div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={hearing.keymanTogether}
          onClick={() => patch({ keymanTogether: !hearing.keymanTogether })}
          className={`flex h-8 w-13 items-center rounded-full px-1 transition-colors ${
            hearing.keymanTogether
              ? "justify-end bg-brand-500"
              : "justify-start bg-stone-300"
          }`}
        >
          <span className="size-6 rounded-full bg-white" />
        </button>
      </Card>

      <section className="flex flex-col gap-2.5">
        <div className="flex items-center gap-1.5">
          <IconAlert width={16} height={16} className="text-note-700" />
          <SectionTitle>変動リスクメモ(解体後に金額が変わりうる点)</SectionTitle>
        </div>
        <textarea
          value={hearing.riskMemo}
          onChange={(e) => patch({ riskMemo: e.target.value })}
          rows={3}
          placeholder="例: 土台の腐食が見つかった場合、最大 +15万円の可能性あり(要事前説明)"
          className="rounded-xl border border-note-500/40 bg-note-100/50 p-3.5 text-[13px] leading-relaxed focus:border-note-500 focus:outline-none"
        />
      </section>

      <PrimaryButton onClick={() => router.push(`/search?project=${id}`)}>
        <IconSearch width={18} height={18} />
        類似の過去見積を検索
      </PrimaryButton>
    </div>
  );
}
