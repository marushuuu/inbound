import type { BusyBlock, Worker } from "./types";

export const WORKERS: Worker[] = [
  { id: "w-yamamoto", name: "山本", trades: ["多能工", "電気"], company: "自社" },
  { id: "w-taguchi", name: "田口設備", trades: ["設備"], company: "協力業者" },
  { id: "w-kawai", name: "川井内装", trades: ["内装"], company: "協力業者" },
];

const H = (h: number, m = 0) => h * 60 + m;

/**
 * デモ用の既存予定。Googleカレンダー連携(FreeBusy)が有効な場合は
 * 連携済み担当者ぶんが実データで上書きされる。曜日パターンで決定的に生成する。
 */
export function demoBusyFor(workerId: string, date: string): BusyBlock[] {
  const day = new Date(`${date}T00:00:00`).getDay(); // 0=日
  if (day === 0) {
    return [{ startMin: 0, endMin: 24 * 60, title: "休" }];
  }
  switch (workerId) {
    case "w-yamamoto":
      if (day === 3) return [{ startMin: H(9), endMin: H(15), title: "鈴木様邸" }];
      if (day === 6) return [{ startMin: H(13), endMin: H(24), title: "休" }];
      return [];
    case "w-taguchi":
      if (day === 1 || day === 4)
        return [{ startMin: H(13), endMin: H(14, 30), title: "鈴木様邸" }];
      if (day === 2) return [{ startMin: H(9), endMin: H(12), title: "定期点検" }];
      return [];
    case "w-kawai":
      if (day === 1 || day === 2)
        return [{ startMin: H(13), endMin: H(17), title: "他現場" }];
      if (day === 5) return [{ startMin: H(9), endMin: H(12), title: "他現場" }];
      return [];
    default:
      return [];
  }
}
