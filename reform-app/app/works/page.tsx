"use client";

import { Card, PageHeader, SectionTitle } from "@/components/ui";
import { yen } from "@/lib/calc";
import { DEFAULT_TASK_IDS, SECTION_ORDER } from "@/lib/workmaster";
import { useStore } from "@/lib/store";

export default function WorkMasterPage() {
  const { works, updateWork, ready } = useStore();

  if (!ready) return <p className="text-sm text-ink-600">読み込み中…</p>;

  const categories = [...new Set(works.map((w) => w.category))].sort((a, b) => {
    const ai = SECTION_ORDER.indexOf(a);
    const bi = SECTION_ORDER.indexOf(b);
    return (ai < 0 ? SECTION_ORDER.length : ai) - (bi < 0 ? SECTION_ORDER.length : bi);
  });
  const defaultTotal = works
    .filter((w) => DEFAULT_TASK_IDS.includes(w.id))
    .reduce((s, w) => s + w.durationMinutes, 0);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="工事マスタ"
        subtitle="工事項目ごとの所要時間(分)と標準単価(円)を設定"
      />

      <div className="rounded-xl border border-brand-200 bg-brand-50 p-3.5 text-xs leading-relaxed text-brand-800">
        ここで設定した所要時間は施工日程の自動割付に、単価は見積作成時の初期値に使われます。変更は即保存されます。
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
                  className={`flex flex-col gap-2 px-4 py-3 ${
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
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5">
                      <span className="text-xs text-ink-600">所要</span>
                      <input
                        type="number"
                        inputMode="numeric"
                        min={0}
                        step={15}
                        value={w.durationMinutes}
                        onChange={(e) =>
                          updateWork(w.id, {
                            durationMinutes: Math.max(0, Number(e.target.value) || 0),
                          })
                        }
                        className="min-h-11 w-20 rounded-lg border border-stone-300 px-2.5 text-right text-sm font-bold focus:border-brand-500 focus:outline-none"
                      />
                      <span className="text-xs text-ink-600">分</span>
                    </label>
                    <label className="flex flex-1 items-center gap-1.5">
                      <span className="text-xs text-ink-600">単価</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={w.unitPrice.toLocaleString("ja-JP")}
                        onChange={(e) =>
                          updateWork(w.id, {
                            unitPrice: Number(e.target.value.replace(/[^0-9]/g, "")) || 0,
                          })
                        }
                        className="min-h-11 min-w-0 flex-1 rounded-lg border border-stone-300 px-2.5 text-right text-sm font-bold focus:border-brand-500 focus:outline-none"
                      />
                      <span className="text-xs text-ink-600">円/{w.unit}</span>
                    </label>
                  </div>
                </div>
              ))}
          </Card>
        </section>
      ))}

      <Card className="flex items-center justify-between py-3.5">
        <span className="text-[13px] font-bold">Fast系標準セットの所要時間</span>
        <span className="text-[15px] font-bold text-brand-600">
          {defaultTotal.toLocaleString()}分(
          {(defaultTotal / 60).toFixed(1).replace(/\.0$/, "")}時間)
        </span>
      </Card>

      <p className="text-center text-xs text-ink-600">
        参考: 標準単価の合計 {yen(works.reduce((s, w) => s + w.unitPrice, 0))}
      </p>
    </div>
  );
}
