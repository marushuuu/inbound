import type { PastEstimate, Project } from "./types";

/** 工事タイトルから工事種別を推定 */
export function inferWorkType(workTitle: string): string | null {
  if (workTitle.includes("浴室") || workTitle.includes("風呂")) return "浴室・洗面";
  if (workTitle.includes("キッチン")) return "キッチン";
  if (workTitle.includes("洗面")) return "洗面";
  if (workTitle.includes("トイレ") || workTitle.includes("給湯")) return "水回り複合";
  return null;
}

/** 「築28年 木造」のような文字列から築年数帯を推定 */
export function inferBuiltAge(meta: string): string | null {
  const m = meta.match(/築(\d+)年/);
  if (!m) return null;
  const age = Number(m[1]);
  if (age <= 10) return "築〜10年";
  if (age <= 20) return "築11〜20年";
  if (age <= 30) return "築21〜30年";
  return "築31年〜";
}

/** ヒアリングの予算(円)と過去見積の金額が近いか(予算の70%〜130%以内) */
function budgetMatches(budget: number | null, total: number): boolean {
  if (!budget || budget <= 0) return false;
  const ratio = total / budget;
  return ratio >= 0.7 && ratio <= 1.3;
}

export interface SimilarityResult {
  score: number;
  reasons: string[];
}

/**
 * 類似度スコア(MVP版): 案件のヒアリング・物件情報と過去見積の属性一致を重み付きで加点。
 * 工事種別 +3 / 築年数帯 +2 / 予算帯 +2 / 構造 +1(満点8)
 * 将来はここを見積明細・ヒアリング文のベクトル類似検索(pgvector)に置き換える。
 */
export function scoreSimilarity(
  project: Project,
  estimate: PastEstimate,
): SimilarityResult {
  let score = 0;
  const reasons: string[] = [];

  const workType = inferWorkType(project.workTitle);
  if (workType && estimate.workType === workType) {
    score += 3;
    reasons.push("工事種別が一致");
  }

  const builtAge = inferBuiltAge(project.meta);
  if (builtAge && estimate.builtAge === builtAge) {
    score += 2;
    reasons.push("築年数帯が一致");
  }

  if (budgetMatches(project.hearing.budget, estimate.total)) {
    score += 2;
    reasons.push("予算と金額が近い");
  }

  if (project.meta.includes("木造") && estimate.structure === "木造") {
    score += 1;
    reasons.push("構造が一致");
  }

  return { score, reasons };
}

export const SIMILARITY_MAX_SCORE = 8;
