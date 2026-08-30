# リフォーム営業SaaS(MVP)

リフォーム会社の営業向けSaaSのフロントエンドMVP。
**ヒアリング → 類似過去見積検索 → 見積作成(松竹梅・グレード差し替え) → その場で契約サイン** のFast系(水回り)フローが実際に操作できます。

- スマホ / タブレット前提のモバイルファースト(デスクトップはサイドバー付きレイアウト)
- データはブラウザの localStorage に保存(DB・認証は未実装。「デモデータに戻す」でリセット)
- 見積の明細・金額はサンプル見積書(浴室・洗面改装工事)由来
- 企画詳細は `../docs/reform/PLANNING.md`

## 起動

```bash
npm install
npm run dev    # http://localhost:3000
```

### Docker

```bash
docker compose up --build   # http://localhost:3000
```

## 画面

| Path | 内容 |
| --- | --- |
| `/` | 案件一覧(ステータス絞り込み・案件作成) |
| `/projects/[id]` | 案件のステータスに応じたステップへ振り分け |
| `/projects/[id]/hearing` | ヒアリングシート(きっかけ・予算・変動リスクメモ) |
| `/projects/[id]/estimate` | 見積作成(松竹梅パターン、設備グレード差し替え、内訳自動計算) |
| `/projects/[id]/contract` | 契約(説明チェック・手書きサイン・締結) |
| `/search` | 過去見積の検索(工事種別×築年数) |
| `/catalog` | 商品マスタ(グレード系列) |
