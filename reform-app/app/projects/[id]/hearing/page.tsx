"use client";

import { useRouter } from "next/navigation";
import { use } from "react";
import { IconAlert, IconPlus, IconSearch } from "@/components/icons";
import {
  Card,
  Chip,
  PageHeader,
  PrimaryButton,
  SectionTitle,
  StepNav,
} from "@/components/ui";
import { formatFullDateJa } from "@/lib/schedule";
import { TRIGGER_OPTIONS } from "@/lib/data";
import { useProject, useStore } from "@/lib/store";
import type { Hearing, HistoryRecord } from "@/lib/types";

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 41 }, (_, i) => CURRENT_YEAR - i);
const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => i + 1);

export default function HearingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { updateProject, ready } = useStore();
  const project = useProject(id);

  if (!ready) return <p className="text-sm text-ink-600">読み込み中…</p>;
  if (!project) return <p className="text-sm text-ink-600">案件が見つかりません。</p>;

  const hearing = project.hearing;
  const patch = (h: Partial<Hearing>) =>
    updateProject(id, {
      hearing: { ...hearing, ...h },
      status: project.status === "new" ? "hearing" : project.status,
    });

  const toggleTrigger = (t: string) =>
    patch({
      triggers: hearing.triggers.includes(t)
        ? hearing.triggers.filter((x) => x !== t)
        : [...hearing.triggers, t],
    });

  const updateHistory = (recordId: string, changes: Partial<HistoryRecord>) =>
    patch({
      history: hearing.history.map((r) =>
        r.id === recordId ? { ...r, ...changes } : r,
      ),
    });

  const removeHistory = (recordId: string) =>
    patch({ history: hearing.history.filter((r) => r.id !== recordId) });

  const addManualHistory = () =>
    patch({
      history: [
        ...hearing.history,
        {
          id: `h-${Date.now()}`,
          year: null,
          month: null,
          description: "",
          source: "manual",
        },
      ],
    });

  // ANDPAD連携(実装後)で自動取得される想定のダミー動作。
  // 実連携が有効になった段階で、ここを実際のANDPAD APIからの取得に置き換える。
  const fetchFromAndpad = () =>
    patch({
      history: [
        ...hearing.history,
        {
          id: `h-andpad-${Date.now()}`,
          year: 2020,
          month: 4,
          description: "外壁塗装工事(ANDPAD連携で取得・サンプル)",
          source: "andpad",
        },
      ],
    });

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        backHref="/"
        title={`${project.customer}｜${project.workTitle}`}
        subtitle={project.meta}
      />
      <StepNav projectId={id} current="hearing" />

      <section className="flex flex-col gap-2.5">
        <SectionTitle>きっかけ・お悩み</SectionTitle>
        <div className="flex flex-wrap gap-2">
          {TRIGGER_OPTIONS.map((t) => (
            <Chip
              key={t}
              selected={hearing.triggers.includes(t)}
              onClick={() => toggleTrigger(t)}
            >
              {t}
            </Chip>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-2.5">
        <SectionTitle>ご予算</SectionTitle>
        <Card className="flex items-center justify-between py-3">
          <span className="text-[13px] text-ink-600">ご予算</span>
          <div className="flex items-center gap-1">
            <span className="text-[15px] font-bold">¥</span>
            <input
              type="text"
              inputMode="numeric"
              value={hearing.budget != null ? hearing.budget.toLocaleString("ja-JP") : ""}
              onChange={(e) => {
                const digits = e.target.value.replace(/[^0-9]/g, "");
                patch({ budget: digits ? Number(digits) : null });
              }}
              placeholder="0"
              className="w-36 text-right text-[15px] font-bold focus:outline-none"
            />
          </div>
        </Card>
      </section>

      <section className="flex flex-col gap-2.5">
        <SectionTitle>希望時期</SectionTitle>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={hearing.timingFrom ?? ""}
            onChange={(e) => patch({ timingFrom: e.target.value || null })}
            className="min-h-12 flex-1 rounded-xl border border-stone-200 bg-white px-3 text-sm focus:border-brand-500 focus:outline-none"
          />
          <span className="text-sm text-ink-600">〜</span>
          <input
            type="date"
            value={hearing.timingTo ?? ""}
            onChange={(e) => patch({ timingTo: e.target.value || null })}
            className="min-h-12 flex-1 rounded-xl border border-stone-200 bg-white px-3 text-sm focus:border-brand-500 focus:outline-none"
          />
        </div>
        {(hearing.timingFrom || hearing.timingTo) && (
          <p className="text-xs text-ink-600">
            {formatFullDateJa(hearing.timingFrom)} 〜 {formatFullDateJa(hearing.timingTo)}
          </p>
        )}
      </section>

      <section className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <SectionTitle>過去のリフォーム履歴</SectionTitle>
          <button
            type="button"
            onClick={fetchFromAndpad}
            className="text-[11px] font-bold text-brand-600 underline"
          >
            ANDPADから取得
          </button>
        </div>

        <div className="flex flex-col gap-2.5">
          {hearing.history.map((record) => {
            const readOnly = record.source === "andpad";
            return (
              <Card key={record.id} className="flex flex-col gap-2 py-3">
                <div className="flex items-center justify-between">
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                      readOnly
                        ? "bg-brand-100 text-brand-700"
                        : "bg-stone-100 text-ink-600"
                    }`}
                  >
                    {readOnly ? "ANDPAD連携" : "手入力"}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeHistory(record.id)}
                    className="min-h-9 px-2 text-xs text-ink-500"
                  >
                    削除
                  </button>
                </div>
                <div className="flex gap-2">
                  <select
                    disabled={readOnly}
                    value={record.year ?? ""}
                    onChange={(e) =>
                      updateHistory(record.id, {
                        year: Number(e.target.value) || null,
                      })
                    }
                    className="min-h-11 flex-1 rounded-lg border border-stone-300 px-2 text-sm disabled:bg-stone-100 disabled:text-ink-600"
                  >
                    <option value="">年</option>
                    {YEAR_OPTIONS.map((y) => (
                      <option key={y} value={y}>
                        {y}年
                      </option>
                    ))}
                  </select>
                  <select
                    disabled={readOnly}
                    value={record.month ?? ""}
                    onChange={(e) =>
                      updateHistory(record.id, {
                        month: Number(e.target.value) || null,
                      })
                    }
                    className="min-h-11 flex-1 rounded-lg border border-stone-300 px-2 text-sm disabled:bg-stone-100 disabled:text-ink-600"
                  >
                    <option value="">月</option>
                    {MONTH_OPTIONS.map((m) => (
                      <option key={m} value={m}>
                        {m}月
                      </option>
                    ))}
                  </select>
                </div>
                <input
                  type="text"
                  disabled={readOnly}
                  value={record.description}
                  onChange={(e) =>
                    updateHistory(record.id, { description: e.target.value })
                  }
                  placeholder="例: 給湯器交換(他社施工)"
                  className="min-h-11 rounded-lg border border-stone-300 px-3 text-sm disabled:bg-stone-100 disabled:text-ink-600"
                />
              </Card>
            );
          })}
        </div>

        <button
          type="button"
          onClick={addManualHistory}
          className="flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-dashed border-stone-300 text-sm font-medium text-ink-700 hover:border-brand-400"
        >
          <IconPlus width={16} height={16} />
          履歴を追加
        </button>
      </section>

      <section className="flex flex-col gap-2.5">
        <div className="flex items-center gap-1.5">
          <IconAlert width={16} height={16} className="text-note-700" />
          <SectionTitle>変動リスクメモ(解体後に金額が変わりうる点)</SectionTitle>
        </div>
        <textarea
          value={hearing.riskMemo}
          onChange={(e) => patch({ riskMemo: e.target.value })}
          rows={3}
          placeholder="例: 土台の腐食が見つかった場合、最大 +15万円の可能性あり(要事前説明)"
          className="rounded-xl border border-note-500/40 bg-note-100/50 p-3.5 text-[13px] leading-relaxed focus:border-note-500 focus:outline-none"
        />
      </section>

      <PrimaryButton onClick={() => router.push(`/search?project=${id}`)}>
        <IconSearch width={18} height={18} />
        類似の過去見積を検索
      </PrimaryButton>
    </div>
  );
}
