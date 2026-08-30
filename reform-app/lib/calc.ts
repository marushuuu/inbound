import { PATTERN_DEFAULTS, WORK_LINES, getProduct } from "./data";
import type { EquipmentCategory, PatternKey, Project } from "./types";

export const OVERHEAD_RATE = 0.05;
export const TAX_RATE = 0.1;

export function yen(n: number): string {
  return "¥" + n.toLocaleString("ja-JP");
}

/** パターン×案件の設備差し替えを解決して、そのパターンの設備商品IDを返す */
export function resolveEquipment(
  project: Project,
  pattern: PatternKey,
  category: EquipmentCategory,
): string {
  return (
    project.equipmentChoice[`${pattern}:${category}`] ??
    PATTERN_DEFAULTS[pattern].equipment[category]
  );
}

export interface EstimateTotals {
  sections: { section: string; amount: number }[];
  worksSubtotal: number;
  equipment: { category: EquipmentCategory; productId: string; amount: number }[];
  overhead: number;
  discount: number;
  taxable: number;
  tax: number;
  total: number;
}

export function calcPattern(project: Project, pattern: PatternKey): EstimateTotals {
  const sectionMap = new Map<string, number>();
  for (const line of WORK_LINES) {
    sectionMap.set(line.section, (sectionMap.get(line.section) ?? 0) + line.amount);
  }

  const equipment = (["bath", "vanity"] as EquipmentCategory[]).map((category) => {
    const productId = resolveEquipment(project, pattern, category);
    return { category, productId, amount: getProduct(productId)?.price ?? 0 };
  });
  const equipmentTotal = equipment.reduce((s, e) => s + e.amount, 0);
  sectionMap.set("住宅設備工事", (sectionMap.get("住宅設備工事") ?? 0) + equipmentTotal);

  const sections = [...sectionMap.entries()].map(([section, amount]) => ({
    section,
    amount,
  }));
  const worksSubtotal = sections.reduce((s, x) => s + x.amount, 0);
  const overhead = Math.round(worksSubtotal * OVERHEAD_RATE);
  const beforeDiscount = worksSubtotal + overhead;
  // 端数値引き: 万円未満を値引きして提示額を丸める
  const discount = beforeDiscount % 10000;
  const taxable = beforeDiscount - discount;
  const tax = Math.round(taxable * TAX_RATE);
  return {
    sections,
    worksSubtotal,
    equipment,
    overhead,
    discount,
    taxable,
    tax,
    total: taxable + tax,
  };
}
