"use client";

import { use } from "react";
import PrintToolbar from "@/components/PrintToolbar";
import { calcPattern, yen } from "@/lib/calc";
import { PATTERN_DEFAULTS } from "@/lib/data";
import { formatDateJa, minToTime } from "@/lib/schedule";
import { useProject, useStore } from "@/lib/store";

/** 工事請負契約書帳票(ブラウザの印刷機能でPDF保存) */
export default function ContractPrintPage({
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

  const totals = calcPattern(project, project.selectedPattern);
  const contracted = project.status === "contracted";
  // 締結済みなら締結時点のスナップショット、未締結なら現在の会社情報を表示する
  const contractor = project.contract.contractorProfile ?? company;

  const rows: [string, string][] = [
    ["工事名称", project.workTitle],
    [
      "採用プラン",
      `${PATTERN_DEFAULTS[project.selectedPattern].label}(${PATTERN_DEFAULTS[project.selectedPattern].sub})`,
    ],
    ["請負代金額", `${yen(totals.total)}(うち消費税 ${yen(totals.tax)})`],
    ["工事場所", project.siteAddress || "〔工事場所〕"],
    [
      "施工日時",
      project.schedule
        ? `${formatDateJa(project.schedule.date)} ${minToTime(project.schedule.startMin)} 〜 ${minToTime(project.schedule.endMin)}`
        : "〔施工日時 未確定〕",
    ],
    ["支払条件", project.paymentTerms || "〔支払条件〕"],
    [
      "契約締結日",
      contracted && project.contract.contractedAt
        ? project.contract.contractedAt
        : "(未締結)",
    ],
  ];

  return (
    <div className="mx-auto max-w-3xl bg-white p-6 text-ink-900 print:max-w-none print:p-0 sm:p-8">
      <PrintToolbar backHref={`/projects/${id}/contract`} />

      {!contracted && (
        <div className="mb-4 rounded-lg bg-note-100 p-3 text-center text-xs font-bold text-note-700 print:hidden">
          この契約はまだ締結されていません(プレビュー表示)
        </div>
      )}

      <h1 className="text-center text-2xl font-bold tracking-[0.3em]">
        工事請負契約書
      </h1>

      <p className="mt-5 text-[13px] leading-relaxed">
        発注者 {project.customer.replace(/様?邸?$/, "")} 様(以下「甲」)と、請負者{" "}
        {contractor.name || "〔会社名〕"}(以下「乙」)は、下記の工事について請負契約を締結する。
      </p>

      <table className="mt-4 w-full border-collapse text-[13px]">
        <tbody>
          {rows.map(([k, v]) => (
            <tr key={k} className="border-t border-stone-200">
              <td className="w-32 bg-stone-100 px-3 py-2 font-bold">{k}</td>
              <td className="px-3 py-2">{v}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="mt-6 border-b-2 border-ink-900 pb-1 text-sm font-bold">
        説明済み事項の確認
      </h2>
      <ul className="mt-2 list-disc pl-5 text-[13px] leading-relaxed">
        <li>見積内容・仕様のご説明 {project.contract.checks[0] ? "(済)" : "(未)"}</li>
        <li>
          追加費用の可能性(解体後の変動リスク)のご説明{" "}
          {project.contract.checks[1] ? "(済)" : "(未)"}
        </li>
        <li>
          クーリングオフ制度のご説明・書面交付{" "}
          {project.contract.checks[2] ? "(済)" : "(未)"}
        </li>
      </ul>

      {project.hearing.riskMemo && (
        <>
          <h2 className="mt-6 border-b-2 border-ink-900 pb-1 text-sm font-bold">
            追加費用に関する特約
          </h2>
          <p className="mt-2 text-[13px] leading-relaxed">
            {project.hearing.riskMemo}
          </p>
        </>
      )}

      <h2 className="mt-6 border-b-2 border-ink-900 pb-1 text-sm font-bold">
        クーリングオフについて
      </h2>
      <p className="mt-2 text-xs leading-relaxed text-ink-700">
        訪問販売等に該当する契約の場合、甲は法定書面を受領した日から起算して8日間は、書面または電磁的記録により本契約の解除(クーリングオフ)を行うことができます。詳細は交付する法定書面をご確認ください。〔約款・法定書面は別紙〕
      </p>

      <div className="mt-8 grid grid-cols-2 gap-6">
        <div>
          <div className="text-xs font-bold text-ink-600">甲(発注者)ご署名</div>
          {contracted && project.contract.signature ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={project.contract.signature}
              alt="発注者署名"
              className="mt-2 h-28 w-full border border-stone-300 object-contain"
            />
          ) : (
            <div className="mt-2 flex h-28 items-center justify-center border border-dashed border-stone-300 text-xs text-stone-400">
              署名欄
            </div>
          )}
        </div>
        <div>
          <div className="text-xs font-bold text-ink-600">乙(請負者)記名押印</div>
          <div className="relative mt-2 flex h-28 flex-col justify-center gap-0.5 border border-stone-300 px-3 text-[11px] leading-snug">
            <span className="font-bold">{contractor.name || "〔会社名〕"}</span>
            <span className="text-ink-600">{contractor.address || "〔住所〕"}</span>
            <span>代表者 {contractor.representative || "〔代表者名〕"}</span>
            {contractor.sealImage && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={contractor.sealImage}
                alt="社印"
                className="absolute right-2 bottom-2 size-14 object-contain"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
