import type { WorkItem } from "./types";

/**
 * 工事マスタ(所要時間は分単位、単価は円)。
 * ユーザーが /works で編集した値は localStorage 側が優先される。
 * 単価・単位・仕様は見積書サンプルの明細構成に合わせている。
 */
export const WORK_ITEMS: WorkItem[] = [
  // 共通工事
  { id: "protect-clean", name: "養生・清掃費", category: "共通工事", trade: "多能工", durationMinutes: 60, unitPrice: 15000, unit: "式" },
  { id: "waste", name: "工事発生廃材処分費", category: "共通工事", trade: "多能工", durationMinutes: 30, unitPrice: 15000, unit: "式", spec: "分別処理" },
  // 解体・撤去工事
  { id: "removal", name: "既存設備の撤去・養生", category: "解体・撤去工事", trade: "多能工", durationMinutes: 60, unitPrice: 35000, unit: "式" },
  { id: "bath-demolition", name: "既存浴室解体・撤去", category: "解体・撤去工事", trade: "多能工", durationMinutes: 240, unitPrice: 75000, unit: "式" },
  { id: "vanity-demolition", name: "洗面室解体・撤去", category: "解体・撤去工事", trade: "多能工", durationMinutes: 120, unitPrice: 35000, unit: "式", spec: "壁一部・床" },
  // 基礎工事
  { id: "ub-foundation", name: "ユニットバス用基礎", category: "基礎工事", trade: "多能工", durationMinutes: 270, unitPrice: 48000, unit: "式", spec: "コンクリートベタ打ち" },
  { id: "partition-foundation", name: "間仕切り基礎", category: "基礎工事", trade: "多能工", durationMinutes: 180, unitPrice: 37000, unit: "式", spec: "CB積み 約1.8m" },
  // 大工工事
  { id: "carpentry-wall", name: "洗面壁・天井造作", category: "大工工事", trade: "多能工", durationMinutes: 240, unitPrice: 40000, unit: "式", spec: "床・壁下地・開口" },
  { id: "ub-entrance", name: "ユニットバス入口壁造作等", category: "大工工事", trade: "多能工", durationMinutes: 180, unitPrice: 30000, unit: "式" },
  // 内装工事
  { id: "cloth-repair", name: "クロス補修", category: "内装工事", trade: "内装", durationMinutes: 60, unitPrice: 18000, unit: "式" },
  { id: "cloth-replace", name: "クロス貼替え(洗面室)", category: "内装工事", trade: "内装", durationMinutes: 180, unitPrice: 35000, unit: "式", spec: "天井・壁" },
  { id: "cf-floor", name: "床クッションフロア貼り", category: "内装工事", trade: "内装", durationMinutes: 90, unitPrice: 20000, unit: "式", spec: "材工" },
  // 電気工事
  { id: "electric-panel", name: "配線改修・分電盤新調", category: "電気工事", trade: "電気", durationMinutes: 240, unitPrice: 60000, unit: "式" },
  { id: "electric-vent", name: "換気扇改修工事", category: "電気工事", trade: "電気", durationMinutes: 120, unitPrice: 18000, unit: "ヵ所", spec: "ダクト配管・外部フード取付" },
  // 水道工事
  { id: "plumbing", name: "給水・給湯・排水配管", category: "水道工事", trade: "設備", durationMinutes: 300, unitPrice: 18000, unit: "ヵ所", spec: "材工" },
  { id: "plumbing-connect", name: "接続・取付・雑材ほか", category: "水道工事", trade: "設備", durationMinutes: 120, unitPrice: 75000, unit: "式" },
  // 住宅設備工事
  { id: "vanity-install", name: "洗面化粧台取付", category: "住宅設備工事", trade: "設備", durationMinutes: 120, unitPrice: 35000, unit: "式" },
  { id: "ub-assembly", name: "ユニットバス組立(メーカー施工)", category: "住宅設備工事", trade: "設備", durationMinutes: 480, unitPrice: 80000, unit: "式" },
];

/** Fast系案件の既定タスク(合計240分 = 4時間) */
export const DEFAULT_TASK_IDS = ["removal", "vanity-install", "cloth-repair"];

/** 見積書の工事種別セクションの並び順(サンプル見積書に準拠) */
export const SECTION_ORDER = [
  "共通工事",
  "解体・撤去工事",
  "基礎工事",
  "大工工事",
  "内装工事",
  "電気工事",
  "水道工事",
  "住宅設備工事",
];

export const UNIT_OPTIONS = ["式", "ヵ所", "枚", "本", "台", "セット", "m", "m2", "人工"];
