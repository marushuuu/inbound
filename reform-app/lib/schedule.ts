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

export function workerForTrade(trade: Trade): Worker | undefined {
  return WORKERS.find((w) => w.trades.includes(trade));
}

function overlaps(start: number, end: number, busy: BusyBlock[]): boolean {
  return busy.some((b) => start < b.endMin && end > b.startMin);
}

/**
 * 工事項目を工程順に、担当者の空き時間へ15分単位で直列に割り付ける。
 * startMin(既定 8:00)から開始し、その日の営業時間(〜18:00)に収まらなければ null。
 */
export function allocateDay(
  tasks: WorkItem[],
  busyByWorker: Record<string, BusyBlock[]>,
  startMin: number = DAY_START,
): ScheduledTask[] | null {
  const result: ScheduledTask[] = [];
  let cursor = startMin;
  for (const task of tasks) {
    const worker = workerForTrade(task.trade);
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

