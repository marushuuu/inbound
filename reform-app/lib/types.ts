export type ProjectStatus =
  | "new"
  | "hearing"
  | "estimating"
  | "presented"
  | "contracted"
  | "lost";

export type PatternKey = "matsu" | "take" | "ume";

export type EquipmentCategory = "bath" | "vanity";

export interface Product {
  id: string;
  category: EquipmentCategory;
  maker: string;
  name: string;
  model: string;
  price: number;
  /** 同一カテゴリ内のグレード順位(大きいほど上位) */
  gradeRank: number;
  gradeLabel: string;
  features: string[];
}

/** 工事種別ごとの明細行(設備以外) */
export interface WorkLine {
  section: string;
  name: string;
  spec?: string;
  amount: number;
}

export interface Hearing {
  triggers: string[];
  budget: string | null;
  budgetCeiling: string;
  timing: string;
  history: string;
  keymanTogether: boolean;
  riskMemo: string;
}

export interface ContractState {
  checks: [boolean, boolean, boolean];
  signature: string | null;
  contractedAt: string | null;
}

/** 職種(担当者と工事項目のマッピングに使う) */
export type Trade = "多能工" | "設備" | "内装" | "電気";

/** 工事マスタの1項目(所要時間は分単位) */
export interface WorkItem {
  id: string;
  name: string;
  category: string;
  trade: Trade;
  durationMinutes: number;
}

export interface Worker {
  id: string;
  name: string;
  trades: Trade[];
  company: string;
}

/** 担当者の予定(その日の分単位オフセット) */
export interface BusyBlock {
  startMin: number;
  endMin: number;
  title: string;
}

export interface ScheduledTask {
  workItemId: string;
  name: string;
  trade: Trade;
  workerId: string;
  startMin: number;
  endMin: number;
}

export interface ScheduleState {
  /** YYYY-MM-DD */
  date: string;
  startMin: number;
  endMin: number;
  tasks: ScheduledTask[];
  reservedAt: string | null;
  /** Googleカレンダーに登録した仮予定のイベントID(workerId -> eventId) */
  calendarEventIds: Record<string, string> | null;
}

export interface Project {
  id: string;
  customer: string;
  workTitle: string;
  meta: string;
  status: ProjectStatus;
  nextAction: string;
  hearing: Hearing;
  /** 選択中の見積パターン */
  selectedPattern: PatternKey;
  /** パターンごとの設備の差し替え(カテゴリ -> 商品ID) */
  equipmentChoice: Partial<Record<`${PatternKey}:${EquipmentCategory}`, string>>;
  /** この案件で実施する工事項目(工事マスタ参照) */
  taskIds: string[];
  schedule: ScheduleState | null;
  contract: ContractState;
}

export interface PastEstimate {
  id: string;
  title: string;
  workType: string;
  builtAge: string;
  structure: string;
  total: number;
  year: string;
  highlights: string;
}
