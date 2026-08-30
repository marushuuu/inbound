"use client";

import { useId, useRef, useState } from "react";
import { lineAmount, yen } from "@/lib/calc";
import { SECTION_ORDER, UNIT_OPTIONS } from "@/lib/workmaster";
import type { EstimateLine, WorkItem } from "@/lib/types";
import { IconPlus } from "./icons";
import { Card, SectionTitle } from "./ui";

/** セクション順に明細をグループ化 */
function groupBySection(lines: EstimateLine[]) {
  const map = new Map<string, EstimateLine[]>();
  for (const l of lines) {
    const list = map.get(l.section) ?? [];
    list.push(l);
    map.set(l.section, list);
  }
  return [...map.entries()].sort((a, b) => {
    const ai = SECTION_ORDER.indexOf(a[0]);
    const bi = SECTION_ORDER.indexOf(b[0]);
    return (ai < 0 ? SECTION_ORDER.length : ai) - (bi < 0 ? SECTION_ORDER.length : bi);
  });
}

export default function EstimateEditor({
  lines,
  works,
  onChange,
}: {
  lines: EstimateLine[];
  works: WorkItem[];
  onChange: (next: EstimateLine[]) => void;
}) {
  const [picking, setPicking] = useState(false);
  // 明細行のID採番(レンダー中に副作用を持たない連番)
  const idPrefix = useId();
  const seq = useRef(0);
  const nextId = () => `l-${idPrefix}-${seq.current++}`;

  const update = (id: string, patch: Partial<EstimateLine>) =>
    onChange(lines.map((l) => (l.id === id ? { ...l, ...patch } : l)));

  const remove = (id: string) => onChange(lines.filter((l) => l.id !== id));

  const addFromMaster = (item: WorkItem) => {
    onChange([
      ...lines,
      {
        id: nextId(),
        section: item.category,
        name: item.name,
        spec: item.spec ?? "",
        quantity: 1,
        unit: item.unit,
        unitPrice: item.unitPrice,
        workItemId: item.id,
      },
    ]);
    setPicking(false);
  };

  const addBlank = () =>
    onChange([
      ...lines,
      {
        id: nextId(),
        section: "共通工事",
        name: "",
        spec: "",
        quantity: 1,
        unit: "式",
        unitPrice: 0,
      },
    ]);

  const grouped = groupBySection(lines);
  const subtotal = lines.reduce((s, l) => s + lineAmount(l), 0);
  const masterByCategory = groupWorks(works);

  return (
    <div className="flex flex-col gap-3">
      {lines.length === 0 && (
        <p className="rounded-xl border border-dashed border-stone-300 p-4 text-center text-[13px] text-ink-600">
          明細がありません。工事マスタから追加してください。
        </p>
      )}

      {grouped.map(([section, sectionLines]) => (
        <div key={section} className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-ink-600">{section}</span>
            <span className="text-xs font-bold">
              {yen(sectionLines.reduce((s, l) => s + lineAmount(l), 0))}
            </span>
          </div>
          {sectionLines.map((line) => (
            <Card key={line.id} className="flex flex-col gap-2 py-3">
              <div className="flex items-start gap-2">
                <input
                  value={line.name}
                  onChange={(e) => update(line.id, { name: e.target.value })}
                  placeholder="名称"
                  className="min-h-11 flex-1 rounded-lg border border-stone-300 px-2.5 text-sm font-medium focus:border-brand-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => remove(line.id)}
                  className="min-h-11 shrink-0 px-2 text-xs text-ink-500"
                >
                  削除
                </button>
              </div>
              <input
                value={line.spec}
                onChange={(e) => update(line.id, { spec: e.target.value })}
                placeholder="仕様(任意)"
                className="min-h-11 rounded-lg border border-stone-300 px-2.5 text-[13px] focus:border-brand-500 focus:outline-none"
              />
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step={0.5}
                  value={line.quantity}
                  onChange={(e) =>
                    update(line.id, { quantity: Math.max(0, Number(e.target.value) || 0) })
                  }
                  aria-label="数量"
                  className="min-h-11 w-16 rounded-lg border border-stone-300 px-2 text-right text-sm focus:border-brand-500 focus:outline-none"
                />
                <select
                  value={line.unit}
                  onChange={(e) => update(line.id, { unit: e.target.value })}
                  aria-label="単位"
                  className="min-h-11 w-20 rounded-lg border border-stone-300 px-1.5 text-sm focus:border-brand-500 focus:outline-none"
                >
                  {UNIT_OPTIONS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
                <span className="text-xs text-ink-600">×</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={line.unitPrice.toLocaleString("ja-JP")}
                  onChange={(e) =>
                    update(line.id, {
                      unitPrice: Number(e.target.value.replace(/[^0-9]/g, "")) || 0,
                    })
                  }
                  aria-label="単価"
                  className="min-h-11 min-w-0 flex-1 rounded-lg border border-stone-300 px-2 text-right text-sm focus:border-brand-500 focus:outline-none"
                />
                <span className="w-24 shrink-0 text-right text-sm font-bold">
                  {yen(lineAmount(line))}
                </span>
              </div>
            </Card>
          ))}
        </div>
      ))}

      <div className="flex items-center justify-between border-t border-stone-300 pt-2.5">
        <span className="text-[13px] font-bold">工事費 小計</span>
        <span className="text-[15px] font-bold">{yen(subtotal)}</span>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setPicking(true)}
          className="flex min-h-12 flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand-500 text-sm font-bold text-white hover:bg-brand-600"
        >
          <IconPlus width={16} height={16} />
          工事マスタから追加
        </button>
        <button
          type="button"
          onClick={addBlank}
          className="min-h-12 rounded-xl border border-stone-300 px-4 text-sm font-medium text-ink-700 hover:border-brand-400"
        >
          空の明細
        </button>
      </div>

      {picking && (
        <div
          className="fixed inset-0 z-30 flex items-end justify-center bg-black/40 lg:items-center"
          onClick={() => setPicking(false)}
        >
          <div
            className="max-h-[80dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-5 lg:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-bold">工事マスタから選択</h3>
              <button
                type="button"
                onClick={() => setPicking(false)}
                className="min-h-11 px-2 text-sm text-ink-600"
              >
                閉じる
              </button>
            </div>
            <div className="flex flex-col gap-4">
              {masterByCategory.map(([category, items]) => (
                <div key={category} className="flex flex-col gap-1.5">
                  <SectionTitle>{category}</SectionTitle>
                  {items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => addFromMaster(item)}
                      className="flex items-center justify-between gap-2 rounded-lg border border-stone-200 px-3 py-2.5 text-left hover:border-brand-400"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-medium">
                          {item.name}
                        </span>
                        <span className="text-[11px] text-ink-600">
                          {item.trade}・{item.durationMinutes}分
                        </span>
                      </span>
                      <span className="shrink-0 text-[13px] font-bold">
                        {yen(item.unitPrice)}
                        <span className="text-[11px] font-normal text-ink-600">
                          /{item.unit}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function groupWorks(works: WorkItem[]): [string, WorkItem[]][] {
  const map = new Map<string, WorkItem[]>();
  for (const w of works) {
    const list = map.get(w.category) ?? [];
    list.push(w);
    map.set(w.category, list);
  }
  return [...map.entries()].sort((a, b) => {
    const ai = SECTION_ORDER.indexOf(a[0]);
    const bi = SECTION_ORDER.indexOf(b[0]);
    return (ai < 0 ? SECTION_ORDER.length : ai) - (bi < 0 ? SECTION_ORDER.length : bi);
  });
}
