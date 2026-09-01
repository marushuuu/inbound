"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import {
  LOST_CATEGORIES,
  LOST_REASONS,
  type LostCategory,
  type LostReason,
  type LostRecord,
  type Project,
} from "@/lib/types";
import { Card, SectionTitle } from "./ui";

/**
 * 失注理由の登録フォーム。
 * 業界ナレッジでは、失注理由を「他決 / 検討中止」×「価格 / 時期 / プラン / その他」の
 * 2軸で型化することが推奨されている。自由記述だけにすると分析できないため選択式にし、
 * 他決の場合は競合先を、理由が「その他」の場合は備考を必須にしている。
 */
export default function LostReasonForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (record: LostRecord) => void;
  onCancel: () => void;
}) {
  const [category, setCategory] = useState<LostCategory>("他決");
  const [reason, setReason] = useState<LostReason>("価格");
  const [competitor, setCompetitor] = useState("");
  const [note, setNote] = useState("");

  // 「その他」を選んだときだけ備考を必須にする(分析時に理由が消えないように)
  const noteRequired = reason === "その他";
  const canSubmit = !noteRequired || note.trim().length > 0;

  const submit = () => {
    if (!canSubmit) return;
    onSubmit({
      category,
      reason,
      competitor: category === "他決" ? competitor.trim() : "",
      note: note.trim(),
      lostAt: new Date().toISOString().slice(0, 10),
    });
  };

  return (
    <Card className="flex flex-col gap-3 border-note-500/50 bg-note-100/40">
      <SectionTitle>失注として登録</SectionTitle>

      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-bold text-ink-600">区分</span>
        <div className="flex gap-2">
          {LOST_CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`min-h-11 flex-1 rounded-lg text-[13px] ${
                category === c
                  ? "bg-ink-800 font-bold text-white"
                  : "border border-stone-300 bg-white text-ink-700"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-ink-600">
          {category === "他決"
            ? "他社に決まった場合。競合先を残すと自社の強み・弱みの分析につながります。"
            : "工事自体が取りやめ・保留になった場合。"}
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-bold text-ink-600">理由</span>
        <div className="flex flex-wrap gap-2">
          {LOST_REASONS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setReason(r)}
              className={`min-h-11 rounded-full px-4 text-[13px] ${
                reason === r
                  ? "bg-ink-800 font-bold text-white"
                  : "border border-stone-300 bg-white text-ink-700"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {category === "他決" && (
        <label className="flex flex-col gap-1">
          <span className="text-xs font-bold text-ink-600">競合先(任意)</span>
          <input
            value={competitor}
            onChange={(e) => setCompetitor(e.target.value)}
            placeholder="例: 〇〇ホームセンター"
            className="min-h-11 rounded-lg border border-stone-300 bg-white px-3 text-sm focus:border-brand-500 focus:outline-none"
          />
        </label>
      )}

      <label className="flex flex-col gap-1">
        <span className="text-xs font-bold text-ink-600">
          備考{noteRequired ? "(必須)" : "(任意)"}
        </span>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          placeholder="例: 他社が同等プランで15万円安かった"
          className="rounded-lg border border-stone-300 bg-white p-2.5 text-[13px] focus:border-brand-500 focus:outline-none"
        />
      </label>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={submit}
          disabled={!canSubmit}
          className="min-h-12 flex-1 rounded-xl bg-ink-800 text-sm font-bold text-white disabled:bg-stone-300 disabled:text-ink-600"
        >
          失注として登録
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="min-h-12 rounded-xl border border-stone-300 bg-white px-4 text-sm text-ink-700"
        >
          キャンセル
        </button>
      </div>
    </Card>
  );
}

/** 失注記録を1行の文字列にする(一覧のバッジなどで使う) */
export function lostSummary(lost: LostRecord): string {
  const head = `${lost.category}(${lost.reason})`;
  return lost.competitor ? `${head}／競合: ${lost.competitor}` : head;
}

/**
 * 案件を失注にする / 失注を取り消すためのパネル。
 * 見積画面・契約画面の下部に置き、ステータスと失注記録をまとめて更新する。
 */
export function LostReasonPanel({ project }: { project: Project }) {
  const { updateProject } = useStore();
  const [open, setOpen] = useState(false);

  if (project.status === "contracted") return null;

  if (project.lost) {
    return (
      <Card className="flex flex-col gap-2 border-stone-300 bg-stone-100">
        <div className="flex items-center justify-between">
          <SectionTitle>失注</SectionTitle>
          <span className="text-xs text-ink-600">{project.lost.lostAt}</span>
        </div>
        <p className="text-[13px] font-bold">{lostSummary(project.lost)}</p>
        {project.lost.note && (
          <p className="text-xs leading-relaxed text-ink-600">{project.lost.note}</p>
        )}
        <button
          type="button"
          onClick={() =>
            updateProject(project.id, {
              lost: null,
              status: "estimating",
              nextAction: "見積作成中",
            })
          }
          className="min-h-11 self-start px-1 text-[13px] font-bold text-brand-600 underline"
        >
          失注を取り消す
        </button>
      </Card>
    );
  }

  if (open) {
    return (
      <LostReasonForm
        onCancel={() => setOpen(false)}
        onSubmit={(record) => {
          updateProject(project.id, {
            lost: record,
            status: "lost",
            nextAction: `失注 ${record.category}(${record.reason})`,
          });
          setOpen(false);
        }}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="min-h-11 self-center px-3 text-[13px] text-ink-600 underline"
    >
      この案件を失注として登録する
    </button>
  );
}
