import type { WorkItem } from "./types";

/**
 * 工事マスタ(所要時間は分単位)。
 * ユーザーが /works で編集した値は localStorage 側が優先される。
 */
export const WORK_ITEMS: WorkItem[] = [
  // Fast系(住設交換)の既定タスクセット
  { id: "removal", name: "既存設備の撤去・養生", category: "解体・撤去工事", trade: "多能工", durationMinutes: 60 },
  { id: "vanity-install", name: "洗面化粧台取付", category: "住宅設備工事", trade: "設備", durationMinutes: 120 },
  { id: "cloth-repair", name: "クロス補修", category: "内装工事", trade: "内装", durationMinutes: 60 },
  // その他のマスタ項目
  { id: "bath-demolition", name: "既存浴室解体・撤去", category: "解体・撤去工事", trade: "多能工", durationMinutes: 240 },
  { id: "ub-foundation", name: "ユニットバス用基礎", category: "基礎工事", trade: "多能工", durationMinutes: 270 },
  { id: "plumbing", name: "給水・給湯・排水配管", category: "水道工事", trade: "設備", durationMinutes: 300 },
  { id: "ub-assembly", name: "ユニットバス組立(メーカー施工)", category: "住宅設備工事", trade: "設備", durationMinutes: 480 },
  { id: "electric-panel", name: "配線改修・分電盤新調", category: "電気工事", trade: "電気", durationMinutes: 240 },
  { id: "cloth-replace", name: "クロス貼替え(洗面室)", category: "内装工事", trade: "内装", durationMinutes: 180 },
  { id: "cf-floor", name: "床クッションフロア貼り", category: "内装工事", trade: "内装", durationMinutes: 90 },
];

/** Fast系案件の既定タスク(合計240分 = 4時間) */
export const DEFAULT_TASK_IDS = ["removal", "vanity-install", "cloth-repair"];
