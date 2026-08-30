"use client";

import { useRouter } from "next/navigation";
import { use, useEffect, useMemo, useRef, useState } from "react";
import { IconCalendar } from "@/components/icons";
import {
  Card,
  PageHeader,
  PrimaryButton,
  SectionTitle,
  StepNav,
} from "@/components/ui";
import {
  addDays,
  allocateDay,
  findCandidates,
  formatDateJa,
  minToTime,
  todayISO,
  type Candidate,
} from "@/lib/schedule";
import { WORKERS, demoBusyFor } from "@/lib/workers";
import { useProject, useStore } from "@/lib/store";
import type { BusyBlock, ScheduledTask } from "@/lib/types";

interface GoogleStatus {
  enabled: boolean;
  connected: string[];
}

export default function SchedulePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { updateProject, works, ready } = useStore();
  const project = useProject(id);

  const [slotMin, setSlotMin] = useState(30);
  const [date, setDate] = useState<string | null>(null);
  const [google, setGoogle] = useState<GoogleStatus>({ enabled: false, connected: [] });
  const [liveBusy, setLiveBusy] = useState<{
    date: string;
    busy: Record<string, BusyBlock[]>;
  } | null>(null);
  const [reserving, setReserving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const gridScrollRef = useRef<HTMLDivElement>(null);

  // タブレット/PC(lg以上)は15分単位、スマホは30分単位で表示
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const apply = () => setSlotMin(mq.matches ? 15 : 30);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // Google連携の状態を取得
  useEffect(() => {
    fetch("/api/google/status")
      .then((r) => r.json())
      .then((s: GoogleStatus) => setGoogle(s))
      .catch(() => {});
  }, []);

  const tasks = useMemo(() => {
    if (!project) return [];
    return project.taskIds
      .map((taskId) => works.find((w) => w.id === taskId))
      .filter((w) => w !== undefined);
  }, [project, works]);

  const totalMinutes = tasks.reduce((s, t) => s + t.durationMinutes, 0);

  // 空き状況: デモデータを、連携済み担当者ぶんだけ実データ(FreeBusy)で上書き
  const busyFor = useMemo(() => {
    return (workerId: string, d: string): BusyBlock[] => {
      if (liveBusy && liveBusy.date === d && liveBusy.busy[workerId]) {
        return liveBusy.busy[workerId];
      }
      return demoBusyFor(workerId, d);
    };
  }, [liveBusy]);

  const candidates: Candidate[] = useMemo(
    () => findCandidates(tasks, busyFor, addDays(todayISO(), 1), 2),
    [tasks, busyFor],
  );

  // 表示中の日付(未選択なら最短候補)
  const viewDate = date ?? candidates[0]?.date ?? null;

  // 表示日の実データ(FreeBusy)を取得
  useEffect(() => {
    if (!viewDate || !google.enabled) return;
    fetch("/api/calendar/freebusy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: viewDate }),
    })
      .then((r) => r.json())
      .then((data: { busy: Record<string, BusyBlock[]> }) =>
        setLiveBusy({ date: viewDate, busy: data.busy ?? {} }),
      )
      .catch(() => {});
  }, [viewDate, google.enabled]);

  // 8:00付近まで自動スクロール
  useEffect(() => {
    const el = gridScrollRef.current;
    if (!el) return;
    const rowH = slotMin === 15 ? 14 : 22;
    el.scrollTop = ((7 * 60) / slotMin) * rowH;
  }, [slotMin, viewDate]);

  if (!ready) return <p className="text-sm text-ink-600">読み込み中…</p>;
  if (!project) return <p className="text-sm text-ink-600">案件が見つかりません。</p>;

  const busyByWorker: Record<string, BusyBlock[]> = {};
  for (const w of WORKERS) busyByWorker[w.id] = viewDate ? busyFor(w.id, viewDate) : [];
  const allocation: ScheduledTask[] | null = viewDate
    ? allocateDay(tasks, busyByWorker)
    : null;

  const rows = (24 * 60) / slotMin;
  const rowH = slotMin === 15 ? 14 : 22;
  const rowOf = (min: number) => Math.floor(min / slotMin) + 1;
  const spanOf = (start: number, end: number) =>
    Math.max(1, Math.ceil(end / slotMin) - Math.floor(start / slotMin));

  const reserve = async () => {
    if (!viewDate || !allocation) return;
    setReserving(true);
    setError(null);
    let eventIds: Record<string, string> | null = null;
    if (google.enabled) {
      try {
        const res = await fetch("/api/calendar/reserve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId: project.id,
            customer: project.customer,
            workTitle: project.workTitle,
            date: viewDate,
            tasks: allocation,
          }),
        });
        const data = (await res.json()) as { eventIds: Record<string, string> };
        eventIds = data.eventIds ?? null;
      } catch {
        setError("Googleカレンダーへの仮予定登録に失敗しました(日程はアプリに保存されます)");
      }
    }
    const startMin = Math.min(...allocation.map((t) => t.startMin));
    const endMin = Math.max(...allocation.map((t) => t.endMin));
    updateProject(id, {
      schedule: {
        date: viewDate,
        startMin,
        endMin,
        tasks: allocation,
        reservedAt: new Date().toISOString(),
        calendarEventIds: eventIds,
      },
      status: "presented",
      nextAction: `施工 ${formatDateJa(viewDate)} ${minToTime(startMin)}〜`,
    });
    setReserving(false);
    router.push(`/projects/${id}/contract`);
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        backHref="/"
        title="施工日の調整"
        subtitle={`${project.customer}｜${project.workTitle}`}
      />
      <StepNav projectId={id} current="schedule" />

      <Card className="flex items-center justify-between py-3">
        <div>
          <div className="text-[13px] font-bold">
            合計所要時間: {totalMinutes.toLocaleString()}分(
            {(totalMinutes / 60).toFixed(1).replace(/\.0$/, "")}時間)
          </div>
          <div className="text-xs text-ink-600">
            工事マスタから自動集計｜{tasks.map((t) => t.name).join(" → ")}
          </div>
        </div>
      </Card>

      {/* 担当者と連携状態 */}
      <Card className="flex flex-col gap-2 py-3">
        {WORKERS.map((w) => {
          const connected = google.connected.includes(w.id);
          return (
            <div key={w.id} className="flex items-center justify-between">
              <span className="text-[13px] font-bold">
                {w.name}
                <span className="pl-1.5 text-xs font-normal text-ink-600">
                  {w.company}・{w.trades.join("/")}
                </span>
              </span>
              {google.enabled ? (
                connected ? (
                  <span className="flex items-center gap-1 text-[11px] text-green-700">
                    <span className="size-2 rounded-full bg-green-700" />
                    Googleカレンダー連携済
                  </span>
                ) : (
                  <a
                    href={`/api/google/auth?worker=${w.id}&returnTo=/projects/${id}/schedule`}
                    className="text-[11px] font-bold text-brand-600 underline"
                  >
                    Googleカレンダーを連携する
                  </a>
                )
              ) : (
                <span className="text-[11px] text-ink-600">デモ空き状況</span>
              )}
            </div>
          );
        })}
        {!google.enabled && (
          <p className="border-t border-stone-100 pt-2 text-[11px] leading-relaxed text-ink-600">
            Google連携は未設定です(GOOGLE_CLIENT_ID / SECRET を設定すると各担当者のカレンダーと自動連携します)
          </p>
        )}
      </Card>

      {/* タイムグリッド */}
      {viewDate && (
        <Card className="p-3">
          <div className="flex items-center justify-between pb-2">
            <button
              type="button"
              onClick={() => setDate(addDays(viewDate, -1))}
              className="min-h-11 min-w-11 text-ink-600"
            >
              ◀
            </button>
            <span className="text-sm font-bold">{formatDateJa(viewDate)}</span>
            <button
              type="button"
              onClick={() => setDate(addDays(viewDate, 1))}
              className="min-h-11 min-w-11 text-ink-600"
            >
              ▶
            </button>
          </div>

          <div className="flex gap-3 pb-2 text-[10px] text-ink-600">
            <span className="flex items-center gap-1">
              <span className="size-2.5 rounded-sm border border-brand-500 bg-brand-100" />
              この案件(仮)
            </span>
            <span className="flex items-center gap-1">
              <span className="size-2.5 rounded-sm bg-stone-300" />
              既存予定
            </span>
            <span className="ml-auto">{slotMin}分単位表示</span>
          </div>

          <div
            className="grid gap-x-1 pb-1"
            style={{ gridTemplateColumns: `44px repeat(${WORKERS.length}, minmax(0, 1fr))` }}
          >
            <div />
            {WORKERS.map((w) => (
              <div key={w.id} className="text-center text-[11px] font-bold">
                {w.name}
              </div>
            ))}
          </div>

          <div ref={gridScrollRef} className="max-h-120 overflow-y-auto">
            <div
              className="grid gap-x-1"
              style={{
                gridTemplateColumns: `44px repeat(${WORKERS.length}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${rows}, ${rowH}px)`,
                backgroundImage: `repeating-linear-gradient(to bottom, #f0ede8 0, #f0ede8 1px, transparent 1px, transparent ${rowH}px)`,
              }}
            >
              {Array.from({ length: 24 }, (_, h) => (
                <div
                  key={h}
                  className="text-[10px] text-ink-600"
                  style={{
                    gridColumn: 1,
                    gridRow: `${(h * 60) / slotMin + 1} / span ${60 / slotMin}`,
                  }}
                >
                  {h}:00
                </div>
              ))}
              {WORKERS.map((w, wi) => (
                <BusyCells
                  key={w.id}
                  col={wi + 2}
                  busy={busyByWorker[w.id]}
                  rowOf={rowOf}
                  spanOf={spanOf}
                />
              ))}
              {allocation?.map((t) => {
                const wi = WORKERS.findIndex((w) => w.id === t.workerId);
                return (
                  <div
                    key={t.workItemId}
                    className="overflow-hidden rounded-md border border-brand-500 bg-brand-100 p-1 text-[10px] leading-tight text-brand-800"
                    style={{
                      gridColumn: wi + 2,
                      gridRow: `${rowOf(t.startMin)} / span ${spanOf(t.startMin, t.endMin)}`,
                      margin: "1px 0",
                    }}
                  >
                    <b>{t.name}</b>
                    <br />
                    {minToTime(t.startMin)}-{minToTime(t.endMin)}
                  </div>
                );
              })}
            </div>
          </div>
          {!allocation && (
            <p className="pt-2 text-center text-xs font-bold text-note-700">
              この日は全工程を組めません(別の日を選んでください)
            </p>
          )}
        </Card>
      )}

      {/* 日程候補 */}
      <section className="flex flex-col gap-2.5">
        <SectionTitle>組める日程の候補</SectionTitle>
        {candidates.map((c, i) => {
          const selected = c.date === viewDate;
          return (
            <button
              key={c.date}
              type="button"
              onClick={() => setDate(c.date)}
              className={`relative flex flex-col gap-1 rounded-xl border bg-white p-3.5 text-left ${
                selected ? "border-2 border-brand-500" : "border-stone-200"
              }`}
            >
              {i === 0 && (
                <span className="absolute -top-2.5 left-3.5 rounded-full bg-brand-500 px-2.5 py-0.5 text-[11px] font-bold text-white">
                  最短
                </span>
              )}
              <div className="flex items-center justify-between">
                <span
                  className={`text-[15px] font-bold ${selected ? "text-brand-600" : ""}`}
                >
                  {formatDateJa(c.date)} {minToTime(c.startMin)} 〜 {minToTime(c.endMin)}
                </span>
                <span className="text-xs font-bold text-green-700">全担当 確保可能</span>
              </div>
              <span className="text-xs text-ink-600">
                合計{totalMinutes.toLocaleString()}分を空き時間枠に自動割付
              </span>
            </button>
          );
        })}
        {candidates.length === 0 && (
          <p className="text-sm text-ink-600">
            3週間以内に組める日程がありません。工事マスタの所要時間か担当者の予定を確認してください。
          </p>
        )}
      </section>

      {error && (
        <p className="rounded-lg bg-note-100 p-3 text-xs font-bold text-note-700">{error}</p>
      )}

      <div className="flex flex-col gap-2.5">
        <PrimaryButton onClick={reserve} disabled={!allocation || reserving}>
          <IconCalendar width={18} height={18} />
          {reserving ? "仮押さえ中…" : "この日程で仮押さえ → 契約へ"}
        </PrimaryButton>
        <p className="text-center text-xs leading-relaxed text-ink-600">
          仮押さえすると各担当者のGoogleカレンダーに「【仮】」予定が登録され、
          <br />
          契約締結と同時に「【確定】」に更新されます。
        </p>
      </div>
    </div>
  );
}

function BusyCells({
  col,
  busy,
  rowOf,
  spanOf,
}: {
  col: number;
  busy: BusyBlock[];
  rowOf: (min: number) => number;
  spanOf: (start: number, end: number) => number;
}) {
  return (
    <>
      {busy.map((b, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-md bg-stone-300/70 p-1 text-[10px] leading-tight text-ink-700"
          style={{
            gridColumn: col,
            gridRow: `${rowOf(b.startMin)} / span ${spanOf(b.startMin, b.endMin)}`,
            margin: "1px 0",
          }}
        >
          <b>{b.title}</b>
          <br />
          {minToTime(b.startMin)}-{minToTime(b.endMin)}
        </div>
      ))}
    </>
  );
}
