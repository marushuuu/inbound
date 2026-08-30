"use client";

import { Card, PageHeader, SectionTitle } from "@/components/ui";
import { DEFAULT_TASK_IDS } from "@/lib/workmaster";
import { useStore } from "@/lib/store";

export default function WorkMasterPage() {
  const { works, updateWork, ready } = useStore();

  if (!ready) return <p className="text-sm text-ink-600">読み込み中…</p>;

  const categories = [...new Set(works.map((w) => w.category))];
  const defaultTotal = works
    .filter((w) => DEFAULT_TASK_IDS.includes(w.id))
    .reduce((s, w) => s + w.durationMinutes, 0);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="工事マスタ|所要時間"
        subtitle="工事項目ごとの標準所要時間を分単位で設定"
      />

      <div className="rounded-xl border border-brand-200 bg-brand-50 p-3.5 text-xs leading-relaxed text-brand-800">
        ここで設定した所要時間(分)を合計して、施工日程の候補と各担当者への時間割付を自動算出します。変更は即保存されます。
      </div>

      {categories.map((category) => (
        <section key={category} className="flex flex-col gap-2.5">
          <SectionTitle>{category}</SectionTitle>
          <Card className="p-0">
            {works
              .filter((w) => w.category === category)
              .map((w, i) => (
                <div
                  key={w.id}
                  className={`flex items-center justify-between gap-3 px-4 py-3 ${
                    i > 0 ? "border-t border-stone-100" : ""
                  }`}
                >
                  <div className="text-[13px]">
                    {w.name}
                    <span className="pl-1.5 text-xs text-ink-600">{w.trade}</span>
                    {DEFAULT_TASK_IDS.includes(w.id) && (
                      <span className="ml-1.5 rounded bg-brand-100 px-1.5 py-0.5 text-[10px] font-bold text-brand-700">
                        Fast系標準
                      </span>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      step={15}
                      value={w.durationMinutes}
                      onChange={(e) =>
                        updateWork(w.id, Math.max(0, Number(e.target.value) || 0))
                      }
                      className="min-h-11 w-20 rounded-lg border border-stone-300 px-2.5 text-right text-sm font-bold focus:border-brand-500 focus:outline-none"
                    />
                    <span className="text-xs text-ink-600">分</span>
                  </div>
                </div>
              ))}
          </Card>
        </section>
      ))}

      <Card className="flex items-center justify-between py-3.5">
        <span className="text-[13px] font-bold">Fast系標準セットの合計</span>
        <span className="text-[15px] font-bold text-brand-600">
          {defaultTotal.toLocaleString()}分({(defaultTotal / 60).toFixed(1).replace(/\.0$/, "")}
          時間)
        </span>
      </Card>
    </div>
  );
}
