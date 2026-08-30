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
