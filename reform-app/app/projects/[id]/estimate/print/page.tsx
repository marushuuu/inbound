"use client";

import { use } from "react";
import PrintToolbar from "@/components/PrintToolbar";
import { calcPattern, yen } from "@/lib/calc";
import { PATTERN_DEFAULTS } from "@/lib/data";
import { useProject, useStore } from "@/lib/store";
import type { WorkLine } from "@/lib/types";

/** 見積書帳票(ブラウザの印刷機能でPDF保存) */
export default function EstimatePrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { company, ready } = useStore();
  const project = useProject(id);

  if (!ready) return <p className="p-4 text-sm text-ink-600">読み込み中…</p>;
  if (!project)
    return <p className="p-4 text-sm text-ink-600">案件が見つかりません。</p>;

  const pattern = project.selectedPattern;
  const totals = calcPattern(project, pattern);

  const today = new Date();
  const validUntil = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
  const fmt = (d: Date) =>
    `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;

  return (
    <div className="mx-auto max-w-3xl bg-white p-6 text-ink-900 print:max-w-none print:p-0 sm:p-8">
      <PrintToolbar backHref={`/projects/${id}/estimate`} />

      <h1 className="text-center text-2xl font-bold tracking-[0.5em]">御見積書</h1>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-6">
        <div className="flex flex-col gap-3">
          <div className="border-b border-ink-900 pb-1 text-lg">
            {project.customer.replace(/様?邸?$/, "")} 様
          </div>
          <p className="text-xs text-ink-600">
            下記の通り御見積を申し上げます。何卒御用命を賜りますようお願い申し上げます。
          </p>
          <div className="mt-2 border-2 border-ink-900 px-4 py-2.5">
            <span className="text-sm">御見積金額 </span>
            <span className="text-2xl font-bold">{yen(totals.total)}</span>
            <span className="text-sm">(税込)</span>
          </div>
          <div className="text-xs text-ink-600">
            <div>うち工事価格(消費税等を除く額): {yen(totals.taxable)}</div>
            <div>取引に係る消費税等: {yen(totals.tax)}</div>
            <div className="mt-1">
              見積有効期限: {fmt(validUntil)}
            </div>
          </div>
        </div>
        <div className="text-right text-xs leading-relaxed text-ink-700">
          <div>発行日: {fmt(today)}</div>
          <div>見積No. {project.id.toUpperCase()}</div>
          <div className="mt-3 font-bold">{company.name || "〔会社名〕"}</div>
          <div>{company.address || "〔住所〕"}</div>
          <div>{company.representative || "〔代表者名〕"}</div>
          {company.sealImage && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={company.sealImage}
              alt="社印"
              className="mt-1 ml-auto size-14 object-contain"
            />
          )}
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-1 text-sm">
        <div>
          <span className="font-bold">工事名称: </span>
          {project.workTitle}(
          {PATTERN_DEFAULTS[pattern].label}プラン / {PATTERN_DEFAULTS[pattern].sub})
        </div>
        <div className="text-[13px]">
          <span className="font-bold">工事場所: </span>
          {project.siteAddress || "〔工事場所〕"}
        </div>
        <div className="text-[13px]">
          <span className="font-bold">御支払条件: </span>
          {project.paymentTerms || "〔支払条件〕"}
        </div>
      </div>

      <h2 className="mt-6 border-b-2 border-ink-900 pb-1 text-sm font-bold">
        内訳明細
      </h2>
      <table className="mt-2 w-full border-collapse text-[13px]">
        <thead>
          <tr className="border-b border-ink-600 text-left text-xs text-ink-600">
            <th className="py-1.5 font-medium">名称</th>
            <th className="py-1.5 font-medium">仕様</th>
            <th className="py-1.5 text-right font-medium">数量</th>
            <th className="py-1.5 pl-1 font-medium">単位</th>
            <th className="py-1.5 text-right font-medium">単価</th>
            <th className="py-1.5 text-right font-medium">金額</th>
          </tr>
        </thead>
        <tbody>
          {totals.detail.map(({ section, lines }) => (
            <SectionRows key={section} section={section} lines={lines} />
          ))}
          <tr className="border-t border-stone-300">
            <td className="py-1.5">諸経費</td>
            <td className="py-1.5 text-ink-600" colSpan={4}>
              工事保険・現場管理費など(5%)
            </td>
            <td className="py-1.5 text-right">{yen(totals.overhead)}</td>
          </tr>
          <tr>
            <td className="py-1.5">値引き</td>
            <td colSpan={4}></td>
            <td className="py-1.5 text-right">▲{yen(totals.discount)}</td>
          </tr>
          <tr className="border-t border-stone-300">
            <td className="py-1.5">値引後合計(税抜)</td>
            <td colSpan={4}></td>
            <td className="py-1.5 text-right font-medium">{yen(totals.taxable)}</td>
          </tr>
          <tr>
            <td className="py-1.5">消費税額(10%)</td>
            <td colSpan={4}></td>
            <td className="py-1.5 text-right">{yen(totals.tax)}</td>
          </tr>
          <tr className="border-t-2 border-ink-900 text-[15px] font-bold">
            <td className="py-2">御見積合計</td>
            <td colSpan={4}></td>
            <td className="py-2 text-right">{yen(totals.total)}</td>
          </tr>
        </tbody>
      </table>

      <h2 className="mt-6 border-b-2 border-ink-900 pb-1 text-sm font-bold">
        補足・注意事項
      </h2>
      <ul className="mt-2 list-disc pl-5 text-xs leading-relaxed text-ink-700">
        <li>この御見積書に記載無き事項は、別途とさせて頂きます。</li>
        <li>工事で使用する電気・水道は、お施主様より御支給をお願い致します。</li>
        <li>工事内容については施工上、若干の誤差がでる場合が御座います。</li>
        {project.hearing.riskMemo && (
          <li className="font-bold">
            解体後の状況により金額が変動する可能性: {project.hearing.riskMemo}
          </li>
        )}
      </ul>
    </div>
  );
}

function SectionRows({ section, lines }: { section: string; lines: WorkLine[] }) {
  const subtotal = lines.reduce((s, l) => s + l.amount, 0);
  return (
    <>
      <tr className="border-t border-stone-300 bg-stone-100">
        <td colSpan={5} className="py-1.5 font-bold">
          {section}
        </td>
        <td className="py-1.5 text-right font-bold">{yen(subtotal)}</td>
      </tr>
      {lines.map((l, i) => (
        <tr key={`${l.name}-${i}`} className="border-t border-stone-100">
          <td className="py-1 pl-3">{l.name}</td>
          <td className="py-1 text-ink-600">{l.spec ?? ""}</td>
          <td className="py-1 text-right">{l.quantity ?? 1}</td>
          <td className="py-1 pl-1 text-ink-600">{l.unit ?? "式"}</td>
          <td className="py-1 text-right">{yen(l.unitPrice ?? l.amount)}</td>
          <td className="py-1 text-right">{yen(l.amount)}</td>
        </tr>
      ))}
    </>
  );
}
