"use client";

import { IconBath, IconVanity } from "@/components/icons";
import { Card, PageHeader, SectionTitle } from "@/components/ui";
import { yen } from "@/lib/calc";
import { gradeSeries } from "@/lib/data";
import type { EquipmentCategory } from "@/lib/types";

const CATEGORIES: { key: EquipmentCategory; label: string }[] = [
  { key: "bath", label: "ユニットバス" },
  { key: "vanity", label: "洗面化粧台" },
];

export default function CatalogPage() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="カタログ(商品マスタ)"
        subtitle="グレード系列 — 松竹梅の自動生成と上位グレード提案の元データ"
      />
      {CATEGORIES.map(({ key, label }) => (
        <section key={key} className="flex flex-col gap-2.5">
          <SectionTitle>{label}</SectionTitle>
          <div className="grid gap-3 lg:grid-cols-3">
            {gradeSeries(key).map((p) => (
              <Card key={p.id} className="flex gap-3">
                <div className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-stone-100 text-brand-500">
                  {key === "bath" ? (
                    <IconBath width={32} height={32} />
                  ) : (
                    <IconVanity width={32} height={32} />
                  )}
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-note-700">
                    {p.gradeLabel}
                  </span>
                  <span className="text-sm font-bold">
                    {p.maker} {p.name}
                  </span>
                  <span className="text-xs text-ink-600">{p.model}</span>
                  <span className="text-xs text-ink-600">
                    {p.features.join("・")}
                  </span>
                  <span className="text-sm font-bold">{yen(p.price)}</span>
                </div>
              </Card>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
