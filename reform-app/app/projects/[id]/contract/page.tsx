"use client";

import Link from "next/link";
import { use, useRef, useState } from "react";
import { IconCheck, IconDoc, IconLock } from "@/components/icons";
import SignaturePad, { type SignaturePadHandle } from "@/components/SignaturePad";
import {
  Card,
  PageHeader,
  PrimaryButton,
  SectionTitle,
  StepNav,
} from "@/components/ui";
import { calcPattern, yen } from "@/lib/calc";
import { PATTERN_DEFAULTS } from "@/lib/data";
import { formatDateJa, minToTime } from "@/lib/schedule";
import { useProject, useStore } from "@/lib/store";

const CHECK_ITEMS = [
  "見積内容・仕様のご説明",
  "追加費用の可能性(解体後の変動リスク)のご説明",
  "クーリングオフ制度のご説明・書面交付",
] as const;

export default function ContractPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { updateProject, companySignature, setCompanySignature, ready } = useStore();
  const project = useProject(id);

  const customerPadRef = useRef<SignaturePadHandle>(null);
  const companyPadRef = useRef<SignaturePadHandle>(null);
  const [customerHasStroke, setCustomerHasStroke] = useState(false);
  const [companyHasStroke, setCompanyHasStroke] = useState(false);
  const [redrawingCompany, setRedrawingCompany] = useState(false);

  if (!ready) return <p className="text-sm text-ink-600">読み込み中…</p>;
  if (!project) return <p className="text-sm text-ink-600">案件が見つかりません。</p>;

  const totals = calcPattern(project, project.selectedPattern);
  const contracted = project.status === "contracted";
  const checks = project.contract.checks;
  const allChecked = checks.every(Boolean);
  const companyEditing = redrawingCompany || !companySignature;

  const toggleCheck = (i: number) => {
    if (contracted) return;
    const next = [...checks] as [boolean, boolean, boolean];
    next[i] = !next[i];
    updateProject(id, { contract: { ...project.contract, checks: next } });
  };

  const saveCompanySignature = () => {
    if (!companyPadRef.current || companyPadRef.current.isEmpty()) return;
    setCompanySignature(companyPadRef.current.toDataURL());
    setRedrawingCompany(false);
  };

  const canConclude =
    allChecked && customerHasStroke && Boolean(companySignature) && !companyEditing;

  const conclude = () => {
    if (!canConclude || !customerPadRef.current || !companySignature) return;
    updateProject(id, {
      status: "contracted",
      nextAction: project.schedule
        ? `施工 ${formatDateJa(project.schedule.date)} ${minToTime(project.schedule.startMin)}〜`
        : "着工日調整",
      contract: {
        ...project.contract,
        signature: customerPadRef.current.toDataURL(),
        contractorSignature: companySignature,
        contractedAt: new Date().toISOString().slice(0, 10),
      },
    });
    // Googleカレンダーの仮予定を「確定」へ更新(ベストエフォート)
    const eventIds = project.schedule?.calendarEventIds;
    if (eventIds && Object.keys(eventIds).length > 0) {
      const events = project.schedule!.tasks
        .filter((t) => eventIds[t.workItemId])
        .map((t) => ({ workItemId: t.workItemId, ref: eventIds[t.workItemId], name: t.name }));
      fetch("/api/calendar/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer: project.customer, events }),
      }).catch(() => {});
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        backHref="/"
        title="契約手続き"
        subtitle={`${project.customer}｜${project.workTitle}`}
      />
      <StepNav projectId={id} current="contract" />

      {contracted && (
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2 rounded-xl bg-brand-500 p-3.5 text-sm font-bold text-white">
            <IconCheck width={18} height={18} />
            {project.contract.contractedAt} に契約を締結しました
          </div>
          <Link
            href={`/projects/${id}/contract/print`}
            className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-brand-500 bg-white text-sm font-bold text-brand-600 hover:bg-brand-50"
          >
            <IconDoc width={16} height={16} />
            契約書PDFを出力
          </Link>
        </div>
      )}

      {!project.schedule && (
        <Link
          href={`/projects/${id}/schedule`}
          className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-note-500/60 bg-note-100 text-[13px] font-bold text-note-700"
        >
          施工日時が未確定です — 先に施工日時を調整する
        </Link>
      )}

      <Card>
        <SectionTitle>ご契約内容</SectionTitle>
        <div className="mt-2.5">
          {[
            ["工事名称", project.workTitle],
            [
              "採用プラン",
              `${PATTERN_DEFAULTS[project.selectedPattern].label}(${PATTERN_DEFAULTS[project.selectedPattern].sub})`,
            ],
            ["契約金額", `${yen(totals.total)}(税込)`],
            [
              "施工日時",
              project.schedule
                ? `${formatDateJa(project.schedule.date)} ${minToTime(project.schedule.startMin)} 〜 ${minToTime(project.schedule.endMin)}`
                : "未確定",
            ],
            ["お支払条件", "完工後 一括"],
          ].map(([k, v]) => (
            <div
              key={k}
              className="flex justify-between border-t border-stone-100 py-2.5 text-[13px]"
            >
              <span className="text-ink-600">{k}</span>
              <span className={k === "契約金額" ? "text-[15px] font-bold" : "font-medium"}>
                {v}
              </span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="flex flex-col gap-3">
        <SectionTitle>ご説明の確認</SectionTitle>
        {CHECK_ITEMS.map((label, i) => (
          <button
            key={label}
            type="button"
            onClick={() => toggleCheck(i)}
            className="flex min-h-11 items-center gap-2.5 text-left"
          >
            <span
              className={`flex size-6 shrink-0 items-center justify-center rounded-full ${
                checks[i] ? "bg-brand-500 text-white" : "border-2 border-stone-300"
              }`}
            >
              {checks[i] && <IconCheck width={13} height={13} />}
            </span>
            <span className="text-[13px]">{label}</span>
          </button>
        ))}
      </Card>

      <section className="flex flex-col gap-2.5">
        <SectionTitle>ご署名(甲・発注者)</SectionTitle>
        {contracted && project.contract.signature ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.contract.signature}
            alt="発注者のご署名"
            className="h-45 w-full rounded-xl border border-stone-200 bg-white object-contain"
          />
        ) : (
          <>
            <SignaturePad
              ref={customerPadRef}
              onChange={() => setCustomerHasStroke(!customerPadRef.current?.isEmpty())}
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  customerPadRef.current?.clear();
                  setCustomerHasStroke(false);
                }}
                className="min-h-11 px-2 text-[13px] text-ink-700"
              >
                書き直す
              </button>
            </div>
          </>
        )}
      </section>

      <section className="flex flex-col gap-2.5">
        <SectionTitle>署名(乙・請負者/自社)</SectionTitle>
        {contracted ? (
          project.contract.contractorSignature ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={project.contract.contractorSignature}
              alt="請負者の署名"
              className="h-45 w-full rounded-xl border border-stone-200 bg-white object-contain"
            />
          ) : (
            <p className="text-xs text-ink-600">登録なし</p>
          )
        ) : companyEditing ? (
          <>
            <SignaturePad
              ref={companyPadRef}
              onChange={() => setCompanyHasStroke(!companyPadRef.current?.isEmpty())}
            />
            <p className="text-xs leading-relaxed text-ink-600">
              ここで登録した署名は会社の署名として保存され、以降の契約でも自動的に使われます。
            </p>
            <div className="flex justify-end gap-2">
              {companySignature && (
                <button
                  type="button"
                  onClick={() => setRedrawingCompany(false)}
                  className="min-h-11 px-2 text-[13px] text-ink-700"
                >
                  キャンセル
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  companyPadRef.current?.clear();
                  setCompanyHasStroke(false);
                }}
                className="min-h-11 px-2 text-[13px] text-ink-700"
              >
                書き直す
              </button>
              <button
                type="button"
                onClick={saveCompanySignature}
                disabled={!companyHasStroke}
                className="min-h-11 rounded-lg bg-brand-500 px-4 text-[13px] font-bold text-white disabled:bg-stone-300"
              >
                この署名を登録する
              </button>
            </div>
          </>
        ) : (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={companySignature!}
              alt="登録済みの請負者署名"
              className="h-45 w-full rounded-xl border border-stone-200 bg-white object-contain"
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setRedrawingCompany(true)}
                className="min-h-11 px-2 text-[13px] text-ink-700"
              >
                署名を登録し直す
              </button>
            </div>
          </>
        )}
      </section>

      {!contracted && (
        <div className="flex flex-col gap-2.5">
          <PrimaryButton onClick={conclude} disabled={!canConclude}>
            <IconLock width={18} height={18} />
            契約を締結する
          </PrimaryButton>
          <p className="text-center text-xs leading-relaxed text-ink-600">
            締結後、契約書PDFをお客様のメールへ自動送付します。
            <br />
            クーリングオフ書面も同時に交付されます。(MVPでは送付は行いません)
          </p>
        </div>
      )}
    </div>
  );
}
