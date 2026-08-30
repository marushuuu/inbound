"use client";

import { use, useRef, useState } from "react";
import { IconCheck, IconLock, IconPen } from "@/components/icons";
import {
  Card,
  PageHeader,
  PrimaryButton,
  SectionTitle,
  StepNav,
} from "@/components/ui";
import { calcPattern, yen } from "@/lib/calc";
import { PATTERN_DEFAULTS } from "@/lib/data";
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
  const { updateProject, ready } = useStore();
  const project = useProject(id);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [hasStroke, setHasStroke] = useState(false);

  if (!ready) return <p className="text-sm text-ink-600">読み込み中…</p>;
  if (!project) return <p className="text-sm text-ink-600">案件が見つかりません。</p>;

  const totals = calcPattern(project, project.selectedPattern);
  const contracted = project.status === "contracted";
  const checks = project.contract.checks;
  const allChecked = checks.every(Boolean);

  const toggleCheck = (i: number) => {
    if (contracted) return;
    const next = [...checks] as [boolean, boolean, boolean];
    next[i] = !next[i];
    updateProject(id, { contract: { ...project.contract, checks: next } });
  };

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (contracted) return;
    drawing.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    const ctx = canvasRef.current!.getContext("2d")!;
    const { x, y } = pos(e);
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#2b2926";
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current!.getContext("2d")!;
    const { x, y } = pos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasStroke(true);
  };

  const onPointerUp = () => {
    drawing.current = false;
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.getContext("2d")!.clearRect(0, 0, canvas.width, canvas.height);
    setHasStroke(false);
  };

  const conclude = () => {
    const canvas = canvasRef.current;
    if (!canvas || !allChecked || !hasStroke) return;
    updateProject(id, {
      status: "contracted",
      nextAction: "着工日調整",
      contract: {
        ...project.contract,
        signature: canvas.toDataURL("image/png"),
        contractedAt: new Date().toISOString().slice(0, 10),
      },
    });
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
        <div className="flex items-center gap-2 rounded-xl bg-brand-500 p-3.5 text-sm font-bold text-white">
          <IconCheck width={18} height={18} />
          {project.contract.contractedAt} に契約を締結しました
        </div>
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
        <SectionTitle>ご署名</SectionTitle>
        {contracted && project.contract.signature ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.contract.signature}
            alt="ご署名"
            className="h-45 w-full rounded-xl border border-stone-200 bg-white object-contain"
          />
        ) : (
          <>
            <div className="relative">
              <canvas
                ref={canvasRef}
                width={700}
                height={360}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                className="h-45 w-full touch-none rounded-xl border-2 border-dashed border-stone-300 bg-white"
              />
              {!hasStroke && (
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-stone-400">
                  <IconPen width={26} height={26} />
                  <span className="text-[13px]">
                    こちらに指またはペンでご署名ください
                  </span>
                </div>
              )}
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={clearSignature}
                className="min-h-11 px-2 text-[13px] text-ink-700"
              >
                書き直す
              </button>
            </div>
          </>
        )}
      </section>

      {!contracted && (
        <div className="flex flex-col gap-2.5">
          <PrimaryButton onClick={conclude} disabled={!allChecked || !hasStroke}>
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
