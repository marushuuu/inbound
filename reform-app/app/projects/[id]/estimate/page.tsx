"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import {
  IconAlert,
  IconArrowUpRight,
  IconBath,
  IconCheck,
  IconDoc,
  IconVanity,
} from "@/components/icons";
import {
  Card,
  PageHeader,
  PrimaryButton,
  SectionTitle,
  StepNav,
} from "@/components/ui";
import { calcPattern, resolveEquipment, yen } from "@/lib/calc";
import { PATTERN_DEFAULTS, PATTERN_ORDER, getProduct, gradeSeries } from "@/lib/data";
import { useProject, useStore } from "@/lib/store";
import type { EquipmentCategory, PatternKey } from "@/lib/types";

const CATEGORY_LABEL: Record<EquipmentCategory, string> = {
  bath: "ユニットバス",
  vanity: "洗面化粧台",
};

export default function EstimatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { updateProject, ready } = useStore();
  const project = useProject(id);
  const [gradeModal, setGradeModal] = useState<EquipmentCategory | null>(null);

  if (!ready) return <p className="text-sm text-ink-600">読み込み中…</p>;
  if (!project) return <p className="text-sm text-ink-600">案件が見つかりません。</p>;

  const pattern = project.selectedPattern;
  const totals = calcPattern(project, pattern);

  const selectPattern = (p: PatternKey) =>
    updateProject(id, {
      selectedPattern: p,
      status:
        project.status === "new" || project.status === "hearing"
          ? "estimating"
          : project.status,
    });

  const chooseGrade = (category: EquipmentCategory, productId: string) => {
    updateProject(id, {
      equipmentChoice: {
        ...project.equipmentChoice,
        [`${pattern}:${category}`]: productId,
      },
    });
    setGradeModal(null);
  };

  const present = () => {
    updateProject(id, { status: "presented", nextAction: "施工日時の調整へ" });
    router.push(`/projects/${id}/schedule`);
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        backHref="/"
        title="見積作成"
        subtitle={`${project.customer}｜${project.workTitle}`}
        right={
          <span className="rounded-md bg-stone-200 px-2 py-1 text-xs font-bold text-ink-700">
            v1
          </span>
        }
      />
      <StepNav projectId={id} current="estimate" />

      {/* 松竹梅パターン */}
      <div className="grid grid-cols-3 gap-2.5">
        {PATTERN_ORDER.map((p) => {
          const t = calcPattern(project, p);
          const active = pattern === p;
          const def = PATTERN_DEFAULTS[p];
          return (
            <button
              key={p}
              type="button"
              onClick={() => selectPattern(p)}
              className={`relative flex flex-col items-center gap-1 rounded-xl border bg-white px-2 py-3 ${
                active ? "border-2 border-brand-500" : "border-stone-200"
              }`}
            >
              {p === "take" && (
                <span className="absolute -top-2.5 rounded-full bg-note-500 px-2.5 py-0.5 text-[11px] font-bold text-ink-900">
                  おすすめ
                </span>
              )}
              <span
                className={`text-[13px] font-bold ${active ? "text-brand-600" : "text-ink-700"}`}
              >
                {def.label}
              </span>
              <span className="text-[11px] text-ink-600">{def.sub}</span>
              <span
                className={`text-sm font-bold ${active ? "text-brand-600" : ""}`}
              >
                {yen(t.total)}
              </span>
            </button>
          );
        })}
      </div>

      {/* 主要設備(グレード差し替え) */}
      <Card className="flex flex-col gap-4">
        <SectionTitle>
          主要設備({PATTERN_DEFAULTS[pattern].label}プラン)
        </SectionTitle>
        {(["bath", "vanity"] as EquipmentCategory[]).map((category) => {
          const product = getProduct(resolveEquipment(project, pattern, category));
          if (!product) return null;
          const Icon = category === "bath" ? IconBath : IconVanity;
          return (
            <div key={category} className="flex gap-3">
              <div className="flex size-22 shrink-0 items-center justify-center rounded-lg bg-stone-100 text-brand-500">
                <Icon width={40} height={40} />
              </div>
              <div className="flex flex-1 flex-col gap-0.5">
                <div className="text-sm font-bold">
                  {product.maker} {product.name}
                </div>
                <div className="text-xs text-ink-600">
                  {product.model}｜{product.gradeLabel}
                </div>
                <div className="text-sm font-bold">{yen(product.price)}</div>
                <button
                  type="button"
                  onClick={() => setGradeModal(category)}
                  className="flex min-h-9 items-center gap-1 text-xs font-medium text-note-700"
                >
                  <IconArrowUpRight width={14} height={14} />
                  他のグレードを見せる
                </button>
              </div>
            </div>
          );
        })}
      </Card>

      {/* 内訳 */}
      <Card>
        <SectionTitle>内訳(工事種別)</SectionTitle>
        <div className="mt-2.5">
          {totals.sections.map((s) => (
            <div
              key={s.section}
              className="flex justify-between border-t border-stone-100 py-2.5 text-[13px]"
            >
              <span>{s.section}</span>
              <span className="font-medium">{yen(s.amount)}</span>
            </div>
          ))}
          <div className="flex justify-between border-t border-stone-100 py-2.5 text-[13px]">
            <span>諸経費(5%)</span>
            <span className="font-medium">{yen(totals.overhead)}</span>
          </div>
          <div className="flex justify-between border-t border-stone-100 py-2.5 text-[13px] text-brand-600">
            <span>端数値引き</span>
            <span className="font-medium">▲{yen(totals.discount)}</span>
          </div>
          <div className="flex justify-between border-t border-stone-100 py-2.5 text-[13px]">
            <span>消費税(10%)</span>
            <span className="font-medium">{yen(totals.tax)}</span>
          </div>
          <div className="flex justify-between border-t border-stone-300 pt-3 text-[15px] font-bold">
            <span>合計(税込)</span>
            <span>{yen(totals.total)}</span>
          </div>
        </div>
      </Card>

      {project.hearing.riskMemo && (
        <div className="flex gap-2 rounded-xl border border-note-500/40 bg-note-100/60 p-3.5">
          <IconAlert
            width={18}
            height={18}
            className="mt-0.5 shrink-0 text-note-700"
          />
          <p className="text-[13px] leading-relaxed text-ink-700">
            {project.hearing.riskMemo}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-2.5">
        <PrimaryButton onClick={present}>この内容で提示 → 施工日時へ</PrimaryButton>
        <Link
          href={`/projects/${id}/estimate/print`}
          className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-stone-300 bg-white text-sm font-medium text-ink-700 hover:border-brand-400"
        >
          <IconDoc width={16} height={16} />
          見積書PDFを出力
        </Link>
      </div>

      {/* グレード選択モーダル */}
      {gradeModal && (
        <div
          className="fixed inset-0 z-30 flex items-end justify-center bg-black/40 lg:items-center"
          onClick={() => setGradeModal(null)}
        >
          <div
            className="max-h-[80dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-5 lg:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-bold">
                {CATEGORY_LABEL[gradeModal]} グレード比較
              </h3>
              <button
                type="button"
                onClick={() => setGradeModal(null)}
                className="min-h-11 px-2 text-sm text-ink-600"
              >
                閉じる
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {gradeSeries(gradeModal)
                .slice()
                .reverse()
                .map((p) => {
                  const current =
                    resolveEquipment(project, pattern, gradeModal) === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => chooseGrade(gradeModal, p.id)}
                      className={`flex items-start gap-3 rounded-xl border p-3.5 text-left ${
                        current
                          ? "border-2 border-brand-500"
                          : "border-stone-200 hover:border-brand-300"
                      }`}
                    >
                      <div className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-stone-100 text-brand-500">
                        {gradeModal === "bath" ? (
                          <IconBath width={32} height={32} />
                        ) : (
                          <IconVanity width={32} height={32} />
                        )}
                      </div>
                      <div className="flex flex-1 flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold">
                            {p.maker} {p.name}
                          </span>
                          {current && (
                            <IconCheck
                              width={14}
                              height={14}
                              className="text-brand-500"
                            />
                          )}
                        </div>
                        <span className="text-xs text-ink-600">
                          {p.gradeLabel}｜{p.features.join("・")}
                        </span>
                        <span className="text-sm font-bold">{yen(p.price)}</span>
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
