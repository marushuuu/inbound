import type { BusyBlock, ScheduledTask, Trade, WorkItem, Worker } from "./types";
import { WORKERS } from "./workers";

export const DAY_START = 8 * 60;
export const DAY_END = 18 * 60;
export const GRANULARITY = 15;

export function minToTime(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}:${String(m).padStart(2, "0")}`;
}

export function formatDateJa(date: string): string {
  const d = new Date(`${date}T00:00:00`);
  const youbi = ["日", "月", "火", "水", "木", "金", "土"][d.getDay()];
  return `${d.getMonth() + 1}/${d.getDate()}(${youbi})`;
}

/** "YYYY-MM-DD" -> "YYYY年M月D日"。null は「未定」 */
export function formatFullDateJa(date: string | null): string {
  if (!date) return "未定";
  const d = new Date(`${date}T00:00:00`);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/** その職種を本来担当する担当者(推奨順)。該当が無ければ空配列 */
export function workersForTrade(trade: Trade): Worker[] {
  return WORKERS.filter((w) => w.trades.includes(trade));
}

/**
 * 工事項目の割り当て候補を「推奨(職種一致)→その他」の順に並べて返す。
 * 職種が一致しない担当者も選べるようにするため、全員を候補に含める。
 */
export function workerCandidates(trade: Trade): { worker: Worker; recommended: boolean }[] {
  const recommendedIds = new Set(workersForTrade(trade).map((w) => w.id));
  return [...WORKERS]
    .sort(
      (a, b) => Number(recommendedIds.has(b.id)) - Number(recommendedIds.has(a.id)),
    )
    .map((worker) => ({ worker, recommended: recommendedIds.has(worker.id) }));
}

export function workerForTrade(trade: Trade): Worker | undefined {
  return workersForTrade(trade)[0];
}

function overlaps(start: number, end: number, busy: BusyBlock[]): boolean {
  return busy.some((b) => start < b.endMin && end > b.startMin);
}

/**
 * 工事項目を工程順に、担当者の空き時間へ15分単位で直列に割り付ける。
 * 担当者は assignments の指定があればそれを、無ければ職種から既定の担当者を使う。
 * startMin(既定 8:00)から開始し、その日の営業時間(〜18:00)に収まらなければ null。
 */
export function allocateDay(
  tasks: WorkItem[],
  busyByWorker: Record<string, BusyBlock[]>,
  startMin: number = DAY_START,
  /** 工事項目ID -> 担当者ID。指定があれば職種の既定より優先する */
  assignments: Record<string, string> = {},
): ScheduledTask[] | null {
  const result: ScheduledTask[] = [];
  let cursor = startMin;
  for (const task of tasks) {
    const worker =
      WORKERS.find((w) => w.id === assignments[task.id]) ?? workerForTrade(task.trade);
    if (!worker) return null;
    const busy = busyByWorker[worker.id] ?? [];
    let start = cursor;
    while (
      start + task.durationMinutes <= DAY_END &&
      overlaps(start, start + task.durationMinutes, busy)
    ) {
      start += GRANULARITY;
    }
    const end = start + task.durationMinutes;
    if (end > DAY_END) return null;
    result.push({
      workItemId: task.id,
      name: task.name,
      trade: task.trade,
      workerId: worker.id,
      startMin: start,
      endMin: end,
    });
    cursor = end;
  }
  return result;
}

