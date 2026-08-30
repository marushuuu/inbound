import { PATTERN_DEFAULTS, WORK_LINES, getProduct } from "./data";
import { SECTION_ORDER } from "./workmaster";
import type {
  EquipmentCategory,
  EstimateLine,
  PatternKey,
  Project,
  WorkLine,
} from "./types";

export const OVERHEAD_RATE = 0.05;
export const TAX_RATE = 0.1;

export function yen(n: number): string {
  return "¥" + n.toLocaleString("ja-JP");
}

export function lineAmount(line: EstimateLine): number {
  return Math.round(line.quantity * line.unitPrice);
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

/** セクションをサンプル見積書の並び順に整える(未知のセクションは末尾) */
function sortSections<T extends { section: string }>(rows: T[]): T[] {
  return [...rows].sort((a, b) => {
    const ai = SECTION_ORDER.indexOf(a.section);
    const bi = SECTION_ORDER.indexOf(b.section);
    return (ai < 0 ? SECTION_ORDER.length : ai) - (bi < 0 ? SECTION_ORDER.length : bi);
  });
}

export interface EstimateTotals {
  sections: { section: string; amount: number }[];
  /** 工事種別ごとの明細行(帳票の内訳明細に使う) */
  detail: { section: string; lines: WorkLine[] }[];
  worksSubtotal: number;
  equipment: { category: EquipmentCategory; productId: string; amount: number }[];
  overhead: number;
  discount: number;
  taxable: number;
  tax: number;
  total: number;
  /** 自作見積の明細を使ったか(false ならサンプル見積) */
  custom: boolean;
}

export function calcPattern(project: Project, pattern: PatternKey): EstimateTotals {
  const custom = Boolean(project.estimateLines && project.estimateLines.length > 0);

  // 明細行を組み立てる。自作見積があればそれを、無ければサンプル見積を使う。
  const baseLines: WorkLine[] = custom
    ? project.estimateLines!.map((l) => ({
        section: l.section,
        name: l.name,
        spec: l.spec || undefined,
        amount: lineAmount(l),
        quantity: l.quantity,
        unit: l.unit,
        unitPrice: l.unitPrice,
      }))
    : WORK_LINES;

  // 設備は松竹梅で差し替わるため、住宅設備工事セクションに合流させる
  const equipment = (["bath", "vanity"] as EquipmentCategory[]).map((category) => {
    const productId = resolveEquipment(project, pattern, category);
    return { category, productId, amount: getProduct(productId)?.price ?? 0 };
  });

  const equipmentLines: WorkLine[] = equipment.map((e) => {
    const product = getProduct(e.productId);
    return {
      section: "住宅設備工事",
      name: product ? `${product.maker} ${product.name}` : "住宅設備",
      spec: product?.model,
      amount: e.amount,
      quantity: 1,
      unit: "式",
      unitPrice: e.amount,
    };
  });

  const allLines = [...baseLines, ...equipmentLines];

  const grouped = new Map<string, WorkLine[]>();
  for (const line of allLines) {
    const list = grouped.get(line.section) ?? [];
    list.push(line);
    grouped.set(line.section, list);
  }

  const detail = sortSections(
    [...grouped.entries()].map(([section, lines]) => ({ section, lines })),
  );
  const sections = detail.map(({ section, lines }) => ({
    section,
    amount: lines.reduce((s, l) => s + l.amount, 0),
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
    detail,
    worksSubtotal,
    equipment,
    overhead,
    discount,
    taxable,
    tax,
    total: taxable + tax,
    custom,
  };
}
