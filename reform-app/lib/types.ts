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

/** 工事種別ごとの明細行(帳票表示用の正規化済みデータ) */
export interface WorkLine {
  section: string;
  name: string;
  spec?: string;
  amount: number;
  quantity?: number;
  unit?: string;
  unitPrice?: number;
}

export type HistorySource = "manual" | "andpad";

/**
 * 過去のリフォーム履歴 1件(ANDPAD連携で自動取得したものと手入力の両方を扱う)。
 * 年と月は独立して保持する(片方だけ選んだ中間状態も保存できるようにするため)。
 */
export interface HistoryRecord {
  id: string;
  year: number | null;
  month: number | null;
  description: string;
  source: HistorySource;
}

export interface Hearing {
  triggers: string[];
  /** 円。未入力は null */
  budget: number | null;
  /** YYYY-MM-DD。未定は null */
  timingFrom: string | null;
  timingTo: string | null;
  history: HistoryRecord[];
  riskMemo: string;
}

export interface ContractState {
  checks: [boolean, boolean, boolean];
  /** 発注者(お客様)の署名 */
  signature: string | null;
  /** 締結時点の会社情報のスナップショット(後で会社情報を変えても過去契約は不変) */
  contractorProfile: CompanyProfile | null;
  contractedAt: string | null;
}

/** 職種(担当者と工事項目のマッピングに使う) */
export type Trade = "多能工" | "設備" | "内装" | "電気";

/** 工事マスタの1項目(所要時間は分単位、単価は円) */
export interface WorkItem {
  id: string;
  name: string;
  /** 工事種別(見積書の大項目セクションになる) */
  category: string;
  trade: Trade;
  durationMinutes: number;
  /** 標準単価(円) */
  unitPrice: number;
  /** 単位(式・箇所・枚・本・台・セット など) */
  unit: string;
  /** 標準の仕様(見積明細の「仕様」欄の初期値) */
  spec?: string;
}

/**
 * 自作見積の明細行1件。見積書サンプルの構成
 * (工事種別セクション → 名称・仕様・数量・単位・単価・金額)に合わせている。
 */
export interface EstimateLine {
  id: string;
  /** 工事種別(セクション) */
  section: string;
  name: string;
  spec: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  /** 工事マスタ由来の場合の参照(所要時間の集計に使う) */
  workItemId?: string;
}

/** 請負者(自社)の情報。一度登録すれば全ての契約書に表示される */
export interface CompanyProfile {
  name: string;
  address: string;
  representative: string;
  /** 印鑑画像(社印。data URL) */
  sealImage: string | null;
}

export const EMPTY_COMPANY_PROFILE: CompanyProfile = {
  name: "",
  address: "",
  representative: "",
  sealImage: null,
};

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
  /**
   * 自作見積の明細。null の場合はサンプル見積(WORK_LINES)を使う。
   * 「類似の過去見積が無いので自分で作る」ケースでここに明細を組み立てる。
   */
  estimateLines: EstimateLine[] | null;
  /** 見積書・契約書の表紙項目 */
  siteAddress: string;
  paymentTerms: string;
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
