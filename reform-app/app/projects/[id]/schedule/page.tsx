"use client";

import { useRouter } from "next/navigation";
import { use, useEffect, useMemo, useRef, useState } from "react";
import { IconCalendar } from "@/components/icons";
import { Card, PageHeader, PrimaryButton, StepNav } from "@/components/ui";
import {
  DAY_END,
  DAY_START,
  GRANULARITY,
  addDays,
  allocateDay,
  formatDateJa,
  minToTime,
  todayISO,
  workerCandidates,
  workerForTrade,
} from "@/lib/schedule";
import { WORKERS, demoBusyFor } from "@/lib/workers";
import { useProject, useStore } from "@/lib/store";
import type { BusyBlock, ScheduledTask, WorkItem } from "@/lib/types";

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
  // 初期表示日は翌日。日付は矢印ボタン(◀▶)で前後に動かす。
  const [date, setDate] = useState<string>(() => addDays(todayISO(), 1));
  const [startMin, setStartMin] = useState(DAY_START);
  /** 工事項目ID -> 担当者ID。未指定の項目は職種の既定担当者に割り付ける */
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [dragging, setDragging] = useState(false);
  const [google, setGoogle] = useState<GoogleStatus>({ enabled: false, connected: [] });
  const [liveBusy, setLiveBusy] = useState<{
    date: string;
    busy: Record<string, BusyBlock[]>;
  } | null>(null);
  const [reserving, setReserving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const gridScrollRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  /** ドラッグ開始位置(分)。範囲の先頭を開始時刻にするために保持する */
  const dragAnchor = useRef<number | null>(null);

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

  /**
   * この案件で施工する工事項目。
   * 自作見積があれば見積明細(工事マスタ参照)から、無ければ既定のタスクから導出する。
   */
  const tasks = useMemo<WorkItem[]>(() => {
    if (!project) return [];
    const fromEstimate = (project.estimateLines ?? [])
      .map((l) => l.workItemId)
      .filter((wid): wid is string => Boolean(wid))
      .map((wid) => works.find((w) => w.id === wid))
      .filter((w): w is WorkItem => Boolean(w));
    if (fromEstimate.length > 0) return fromEstimate;
    return project.taskIds
      .map((taskId) => works.find((w) => w.id === taskId))
      .filter((w): w is WorkItem => Boolean(w));
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

  // 表示日の実データ(FreeBusy)を取得
  useEffect(() => {
    if (!google.enabled) return;
    fetch("/api/calendar/freebusy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date }),
    })
      .then((r) => r.json())
      .then((data: { busy: Record<string, BusyBlock[]> }) =>
        setLiveBusy({ date, busy: data.busy ?? {} }),
      )
      .catch(() => {});
  }, [date, google.enabled]);

  const rowH = slotMin === 15 ? 14 : 22;

  // 選択した開始時刻付近まで自動スクロール(ドラッグ中は動かさない)
  useEffect(() => {
    const el = gridScrollRef.current;
    if (!el || dragging) return;
    el.scrollTop = Math.max(0, (startMin - 60) / slotMin) * rowH;
  }, [slotMin, date, startMin, dragging, rowH]);

  if (!ready) return <p className="text-sm text-ink-600">読み込み中…</p>;
  if (!project) return <p className="text-sm text-ink-600">案件が見つかりません。</p>;

  const busyByWorker: Record<string, BusyBlock[]> = {};
  for (const w of WORKERS) busyByWorker[w.id] = busyFor(w.id, date);
  const allocation: ScheduledTask[] | null = allocateDay(
    tasks,
    busyByWorker,
    startMin,
    assignments,
  );

  const rows = (24 * 60) / slotMin;
  const rowOf = (min: number) => Math.floor(min / slotMin) + 1;
  const spanOf = (start: number, end: number) =>
    Math.max(1, Math.ceil(end / slotMin) - Math.floor(start / slotMin));

  /** グリッド上のY座標を15分刻みの時刻(分)に変換する */
  const minutesFromPointer = (clientY: number): number => {
    const el = gridRef.current;
    if (!el) return startMin;
    const rect = el.getBoundingClientRect();
    const raw = ((clientY - rect.top) / rect.height) * 24 * 60;
    const snapped = Math.round(raw / GRANULARITY) * GRANULARITY;
    return Math.min(DAY_END - GRANULARITY, Math.max(0, snapped));
  };

  const onGridPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const at = minutesFromPointer(e.clientY);
    dragAnchor.current = at;
    setDragging(true);
    setStartMin(at);
  };

  const onGridPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging || dragAnchor.current === null) return;
    // ドラッグ範囲の先頭を開始時刻にする(下へ引いても開始は動かない)
    setStartMin(Math.min(dragAnchor.current, minutesFromPointer(e.clientY)));
  };

  const endDrag = () => {
    dragAnchor.current = null;
    setDragging(false);
  };

  const reserve = async () => {
    if (!allocation) return;
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
            date,
            tasks: allocation,
          }),
        });
        const data = (await res.json()) as { eventIds: Record<string, string> };
        eventIds = data.eventIds ?? null;
      } catch {
        setError("Googleカレンダーへの仮予定登録に失敗しました(日程はアプリに保存されます)");
      }
    }
    const allocStart = Math.min(...allocation.map((t) => t.startMin));
    const allocEnd = Math.max(...allocation.map((t) => t.endMin));
    updateProject(id, {
      schedule: {
        date,
        startMin: allocStart,
        endMin: allocEnd,
        tasks: allocation,
        reservedAt: new Date().toISOString(),
        calendarEventIds: eventIds,
      },
      status: "presented",
      nextAction: `施工 ${formatDateJa(date)} ${minToTime(allocStart)}〜`,
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
            {tasks.length > 0
              ? `工事マスタから自動集計｜${tasks.map((t) => t.name).join(" → ")}`
              : "工事項目が未設定です(見積で工事マスタから明細を追加してください)"}
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
      </Card>

      {/* 工事項目ごとの担当者(職種の既定以外も選べる) */}
      {tasks.length > 0 && (
        <Card className="flex flex-col gap-2 py-3">
          <div className="text-[13px] font-bold">担当者の割り当て</div>
          {tasks.map((t) => (
            <div key={t.id} className="flex items-center gap-2">
              <span className="min-w-0 flex-1 truncate text-[13px]">
                {t.name}
                <span className="pl-1.5 text-xs text-ink-600">{t.trade}</span>
              </span>
              <select
                value={assignments[t.id] ?? ""}
                onChange={(e) =>
                  setAssignments((prev) => {
                    const next = { ...prev };
                    if (e.target.value) next[t.id] = e.target.value;
                    else delete next[t.id];
                    return next;
                  })
                }
                className="min-h-11 w-44 rounded-lg border border-stone-300 px-2 text-[13px] focus:border-brand-500 focus:outline-none"
              >
                <option value="">既定({workerForTrade(t.trade)?.name ?? "未割当"})</option>
                {workerCandidates(t.trade).map(({ worker, recommended }) => (
                  <option key={worker.id} value={worker.id}>
                    {worker.name}
                    {recommended ? "(推奨)" : ""}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </Card>
      )}

      {/* タイムグリッド(ドラッグで開始時刻を指定) */}
      <Card className="p-3">
        {/* 施工日の変更は矢印ボタンのみ(日付ピッカーは使わない) */}
        <div className="flex items-center justify-between pb-2">
          <button
            type="button"
            aria-label="前日"
            onClick={() => setDate(addDays(date, -1))}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-stone-300 text-ink-700 hover:border-brand-400"
          >
            ◀
          </button>
          <div className="text-center">
            <div className="text-sm font-bold">{formatDateJa(date)}</div>
            <div className="text-[10px] text-ink-600">矢印で施工日を変更</div>
          </div>
          <button
            type="button"
            aria-label="翌日"
            onClick={() => setDate(addDays(date, 1))}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-stone-300 text-ink-700 hover:border-brand-400"
          >
            ▶
          </button>
        </div>

        <div className="flex items-center justify-between rounded-lg bg-brand-50 px-3 py-2 text-[11px] font-bold text-brand-700">
          <span>グリッドを長押し / ドラッグして開始時刻を指定</span>
          <span>
            {minToTime(startMin)}
            {allocation && ` 〜 ${minToTime(Math.max(...allocation.map((t) => t.endMin)))}`}
          </span>
        </div>

        <div className="flex gap-3 py-2 text-[10px] text-ink-600">
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
            ref={gridRef}
            onPointerDown={onGridPointerDown}
            onPointerMove={onGridPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            className="grid touch-none gap-x-1 select-none"
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
                  className={`pointer-events-none overflow-hidden rounded-md border border-brand-500 bg-brand-100 p-1 text-[10px] leading-tight text-brand-800 ${
                    dragging ? "ring-2 ring-brand-500" : ""
                  }`}
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
            {tasks.length === 0
              ? "工事項目が未設定のため日程を組めません"
              : "この時間帯では全工程を組めません(開始時刻を早めてください)"}
          </p>
        )}
      </Card>

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
          className="pointer-events-none overflow-hidden rounded-md bg-stone-300/70 p-1 text-[10px] leading-tight text-ink-700"
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
