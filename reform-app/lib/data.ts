import type {
  EquipmentCategory,
  PastEstimate,
  PatternKey,
  Product,
  Project,
  WorkLine,
} from "./types";

/** 商品マスタ(カテゴリ内でグレード系列を構成) */
export const PRODUCTS: Product[] = [
  {
    id: "ub-basic",
    category: "bath",
    maker: "汎用",
    name: "スタンダードユニットバス",
    model: "SB-1616",
    price: 328000,
    gradeRank: 1,
    gradeLabel: "スタンダード",
    features: ["1616サイズ", "基本機能"],
  },
  {
    id: "ub-oflora",
    category: "bath",
    maker: "Panasonic",
    name: "オフローラ",
    model: "1616 / WAAKCA",
    price: 421060,
    gradeRank: 2,
    gradeLabel: "ミドル",
    features: ["1616サイズ", "保温浴槽", "カビシャット暖房換気乾燥機"],
  },
  {
    id: "ub-lclass",
    category: "bath",
    maker: "Panasonic",
    name: "Lクラス バスルーム",
    model: "1616 / BVL-16",
    price: 638000,
    gradeRank: 3,
    gradeLabel: "ハイグレード",
    features: ["1616サイズ", "酸素美泡湯", "肩湯・腰湯", "美光色LED照明"],
  },
  {
    id: "vn-basic",
    category: "vanity",
    maker: "汎用",
    name: "洗面化粧台 750幅",
    model: "SV-750",
    price: 98000,
    gradeRank: 1,
    gradeLabel: "スタンダード",
    features: ["750幅", "三面鏡"],
  },
  {
    id: "vn-fancio",
    category: "vanity",
    maker: "Panasonic",
    name: "FANCIO(ファンシオ) 750幅",
    model: "M-753NFNE ほか",
    price: 180290,
    gradeRank: 2,
    gradeLabel: "ミドル",
    features: ["750幅", "サイドキャビネット付", "くもりシャット三面鏡"],
  },
  {
    id: "vn-utsukushiiz",
    category: "vanity",
    maker: "Panasonic",
    name: "ウツクシーズ 750幅",
    model: "XGQC75D5S ほか",
    price: 286000,
    gradeRank: 3,
    gradeLabel: "ハイグレード",
    features: ["750幅", "ウツクシ洗面ボウル", "タッチレス水栓", "美ルック照明"],
  },
];

export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export function gradeSeries(category: EquipmentCategory): Product[] {
  return PRODUCTS.filter((p) => p.category === category).sort(
    (a, b) => a.gradeRank - b.gradeRank,
  );
}

/** 見積書サンプルPDF(浴室・洗面改装工事)由来の工事明細 */
export const WORK_LINES: WorkLine[] = [
  { section: "共通工事", name: "養生・清掃費", amount: 15000 },
  { section: "共通工事", name: "工事発生廃材処分費", spec: "分別処理", amount: 15000 },
  { section: "共通工事", name: "改装箇所美装工事", spec: "簡易清掃", amount: 15000 },
  { section: "解体・撤去工事", name: "既存浴室解体・撤去", amount: 75000 },
  { section: "解体・撤去工事", name: "洗面室解体・撤去", spec: "壁一部・床", amount: 35000 },
  { section: "解体・撤去工事", name: "基礎一部解体・撤去", amount: 35000 },
  { section: "解体・撤去工事", name: "上記発生廃材処分費", spec: "分別処理", amount: 60000 },
  { section: "基礎工事", name: "間仕切り基礎", spec: "CB積み 約1.8m", amount: 37000 },
  { section: "基礎工事", name: "ユニットバス用基礎", spec: "コンクリートベタ打ち", amount: 48000 },
  { section: "大工工事", name: "ユニットバス入口壁造作等", amount: 30000 },
  { section: "大工工事", name: "洗面壁・天井造作", spec: "床・壁下地・開口", amount: 40000 },
  { section: "大工工事", name: "下地材・造作材ほか", spec: "合板・ボード・開口枠等", amount: 108124 },
  { section: "内装工事", name: "洗面室クロス貼替え", spec: "天井・壁", amount: 35000 },
  { section: "内装工事", name: "洗面室床クッションフロア", spec: "材工", amount: 20000 },
  { section: "内装工事", name: "廊下一部壁聚楽仕上げ", amount: 36000 },
  { section: "内装工事", name: "既存内装材めくり・下地処理等", amount: 15000 },
  { section: "電気工事", name: "配線改修・専用配線・換気扇ほか", spec: "浴室暖房乾燥機用含む", amount: 134600 },
  { section: "電気工事", name: "分電盤新調", amount: 60000 },
  { section: "水道工事", name: "給水・給湯・排水配管工事", spec: "浴室材工", amount: 155000 },
  { section: "水道工事", name: "接続・取付・雑材ほか", amount: 75000 },
  { section: "住宅設備工事", name: "ユニットバス組立施工費", spec: "メーカー施工", amount: 80000 },
];

/** パターンごとの既定設備 */
export const PATTERN_DEFAULTS: Record<
  PatternKey,
  { label: string; sub: string; equipment: Record<EquipmentCategory, string> }
> = {
  matsu: {
    label: "松",
    sub: "ハイグレード",
    equipment: { bath: "ub-lclass", vanity: "vn-utsukushiiz" },
  },
  take: {
    label: "竹",
    sub: "スタンダード＋",
    equipment: { bath: "ub-oflora", vanity: "vn-fancio" },
  },
  ume: {
    label: "梅",
    sub: "最小限",
    equipment: { bath: "ub-basic", vanity: "vn-basic" },
  },
};

export const PATTERN_ORDER: PatternKey[] = ["matsu", "take", "ume"];

export const SEED_PROJECTS: Project[] = [
  {
    id: "p-tanaka",
    customer: "田中様邸",
    workTitle: "浴室・洗面改装工事",
    meta: "築28年 木造",
    status: "presented",
    nextAction: "次アポ 9/2(火) 13:30 見積提示",
    hearing: {
      triggers: ["設備の故障", "寒さ対策"],
      budget: 2200000,
      timingFrom: "2026-10-01",
      timingTo: "2026-10-15",
      history: [
        {
          id: "h-tanaka-1",
          yearMonth: "2018-06",
          description: "給湯器交換(他社施工)",
          source: "manual",
        },
      ],
      riskMemo:
        "土台の腐食が見つかった場合、最大 +15万円の可能性あり。お客様へ口頭説明済み。",
    },
    selectedPattern: "take",
    equipmentChoice: {},
    taskIds: ["removal", "vanity-install", "cloth-repair"],
    schedule: null,
    contract: { checks: [false, false, false], signature: null, contractorSignature: null, contractedAt: null },
  },
  {
    id: "p-sato",
    customer: "佐藤様邸",
    workTitle: "キッチン交換＋内装",
    meta: "築31年 木造",
    status: "hearing",
    nextAction: "見積提出期限 9/4(木)",
    hearing: {
      triggers: ["老朽化"],
      budget: 2800000,
      timingFrom: null,
      timingTo: "2026-12-31",
      history: [],
      riskMemo: "",
    },
    selectedPattern: "take",
    equipmentChoice: {},
    taskIds: ["removal", "vanity-install", "cloth-repair"],
    schedule: null,
    contract: { checks: [false, false, false], signature: null, contractorSignature: null, contractedAt: null },
  },
  {
    id: "p-suzuki",
    customer: "鈴木様邸",
    workTitle: "トイレ・給湯器交換",
    meta: "築15年",
    status: "contracted",
    nextAction: "着工予定 9/16(火)",
    hearing: {
      triggers: ["設備の故障"],
      budget: 700000,
      timingFrom: null,
      timingTo: null,
      history: [],
      riskMemo: "",
    },
    selectedPattern: "ume",
    equipmentChoice: {},
    taskIds: ["removal", "vanity-install", "cloth-repair"],
    schedule: null,
    contract: {
      checks: [true, true, true],
      signature: null,
      contractorSignature: null,
      contractedAt: "2026-08-24",
    },
  },
  {
    id: "p-takahashi",
    customer: "高橋様邸",
    workTitle: "洗面台交換",
    meta: "Web問い合わせ",
    status: "new",
    nextAction: "要架電 訪問日調整",
    hearing: {
      triggers: [],
      budget: null,
      timingFrom: null,
      timingTo: null,
      history: [],
      riskMemo: "",
    },
    selectedPattern: "take",
    equipmentChoice: {},
    taskIds: ["removal", "vanity-install", "cloth-repair"],
    schedule: null,
    contract: { checks: [false, false, false], signature: null, contractorSignature: null, contractedAt: null },
  },
];

export const PAST_ESTIMATES: PastEstimate[] = [
  {
    id: "e-2301",
    title: "浴室・洗面改装工事(在来→UB)",
    workType: "浴室・洗面",
    builtAge: "築21〜30年",
    structure: "木造",
    total: 1903000,
    year: "2025",
    highlights: "オフローラ1616 / 土台補修リスク明記 / 竹プランで成約",
  },
  {
    id: "e-2302",
    title: "浴室改装工事(UB→UB)",
    workType: "浴室・洗面",
    builtAge: "築11〜20年",
    structure: "木造",
    total: 1180000,
    year: "2025",
    highlights: "解体範囲が小さくリードタイム3日で提示",
  },
  {
    id: "e-2303",
    title: "浴室・洗面・トイレ 水回り3点",
    workType: "水回り複合",
    builtAge: "築21〜30年",
    structure: "木造",
    total: 2860000,
    year: "2024",
    highlights: "3点パック価格 / 松プランで成約",
  },
  {
    id: "e-2304",
    title: "キッチン交換＋LDK内装",
    workType: "キッチン",
    builtAge: "築31年〜",
    structure: "木造",
    total: 2450000,
    year: "2025",
    highlights: "キッチン交換に床貼替を複合提案",
  },
  {
    id: "e-2305",
    title: "洗面台交換＋内装",
    workType: "洗面",
    builtAge: "築11〜20年",
    structure: "マンション",
    total: 384000,
    year: "2026",
    highlights: "その場概算→即日成約",
  },
  {
    id: "e-2306",
    title: "浴室改装＋窓断熱",
    workType: "浴室・洗面",
    builtAge: "築21〜30年",
    structure: "木造",
    total: 2140000,
    year: "2026",
    highlights: "寒さ対策要望に内窓を複合提案(補助金活用)",
  },
];

export const TRIGGER_OPTIONS = [
  "設備の故障",
  "老朽化",
  "カビ・汚れ",
  "寒さ対策",
  "バリアフリー",
  "イメージ一新",
];
