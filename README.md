# Torii Jobs (toriijobs.com)

Torii Jobs は、日本のインバウンド業界(ホテル・旅館・飲食・観光)で働きたい
**外国人求職者**と、多言語人材を採用したい**事業者**をつなぐ求人プラットフォームです。

- 求職者向けUIは英語ベース(ターゲットは外国人ユーザー)
- 事業者向けUIは日本語
- 氏名は First name / Last name に分割して登録
- 言語スキルは「言語 × レベル」の構造化データで登録
  (日本語は JLPT N1–N5 スケール、その他言語は Native/Fluent/Business/Conversational/Basic)

## Tech stack

- [Next.js](https://nextjs.org) (App Router, TypeScript)
- [Tailwind CSS v4](https://tailwindcss.com)

## Development

```bash
npm install
npm run dev    # http://localhost:3000
npm run lint
npm run build
```

## Pages

| Path | 内容 |
| --- | --- |
| `/` | トップ(英語ベース、事業者導線あり) |
| `/jobs` | 求人一覧(キーワード・カテゴリ・日本語レベル・ビザサポートで絞り込み) |
| `/jobs/[id]` | 求人詳細 |
| `/signup` | 会員登録(求職者/事業者タブ切替、`?type=employer` で事業者タブ) |
| `/login` | ログイン |
| `/employers` | 事業者向けLP(日本語) |
| `/terms`, `/privacy` | 規約・ポリシー(プレースホルダー) |

現在はフロントエンドのみのMVPで、求人データは `lib/jobs.ts` のサンプルデータです。
認証・DB・応募機能は未実装です。
