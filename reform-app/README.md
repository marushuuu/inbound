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
| `/projects/[id]/schedule` | 施工日時の調整(担当者×時間枠のタイムグリッド・日程候補の自動割付・仮押さえ) |
| `/projects/[id]/contract` | 契約(施工日時入り・説明チェック・手書きサイン・締結) |
| `/projects/[id]/estimate/print` | 見積書帳票(ブラウザ印刷でPDF保存) |
| `/projects/[id]/contract/print` | 工事請負契約書帳票 |
| `/search` | 過去見積の検索(類似度スコア順) |
| `/catalog` | 商品マスタ(グレード系列) |
| `/works` | 工事マスタ(所要時間を分単位で設定) |

## Googleカレンダー連携

`.env.example` を `.env.local` にコピーして `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` を設定すると有効になります(未設定の間はデモの空き状況データで動作)。

- 施工日時画面で担当者ごとに「Googleカレンダーを連携する」→ OAuth同意すると、その担当者の空き(FreeBusy)が実データになります
- 「仮押さえ」で各担当者のカレンダーに **【仮】** 予定が登録され、契約締結で **【確定】** に更新されます
- 連携トークンはDB導入までの暫定として `.data/google-tokens.json` に保存されます
