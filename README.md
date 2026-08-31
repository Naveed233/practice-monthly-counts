# practice-monthly-counts（Geoscope PR #178 演習）

自主練習タスク1: プロジェクトごとの月別チケット数 API。
sensy-geoscope PR #178 を題材に、業務と同じ技術構成で、LLM にコード実装を
頼らずに行った練習タスク。

Live: https://practice-monthly-counts.vercel.app

## 課題

**ゴール:** 1リクエストあたりの取得上限を超える行数を持つプロジェクトでも、
正しい月別集計値を返す Next.js アプリをデプロイする。

**要件:**
1. テーブル `tickets`（id / project_id / created_at / prediction_executed_at nullable）。
   1プロジェクトに 2,500 行以上、他2プロジェクトに数百行を6か月以上に分散投入。
   投入方法は再現可能であること（SQL ファイルをリポジトリに含める）
2. `GET /api/monthly-ticket-counts?projectId=...` が `[{ month, count }, ...]` を返す。
   集計キーは `prediction_executed_at`、null 行は除外（#178 の学びの適用）。
   PostgREST の既定の取得上限（1,000行）を考慮した実装
3. プロジェクトを選択し集計結果をテーブル表示する最小限のページ
4. 取得上限対応を外した場合に失敗するテストを最低1つ
5. Vercel にデプロイ。環境変数はダッシュボードで設定しコミットしない

**完了条件:** デプロイ済み URL が3プロジェクトで正しい値を返す（SQL 集計と突き合わせ）／
null 除外を確認できる／取得上限対応を外すとテストが失敗する／README と作業ログを含む

## 実装内容

Next.js（Pages Router）+ TypeScript + Supabase（@supabase/supabase-js）+ Vercel。
- `prediction_executed_at` で集計し、null 行は除外
- `.range()` による 1,000 行単位のページングで取得上限に対応
  — project_1（非 null 2,340 行）でも正しい合計を返す

## ローカルでの実行方法

1. `npm install`
2. `.env.local` を作成:

```
NEXT_PUBLIC_SUPABASE_URL=<Supabase プロジェクトの URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<publishable キー>
```

3. `npm run dev` → http://localhost:3000

## シードデータ

`lib/supabase/migrations/20260826164430_seed.sql` を Supabase の SQL エディタで実行。
3プロジェクト・6か月分を生成: project_1 = 2,600 行（約10%が
prediction_executed_at null）、project_2 = 400 行、project_3 = 600 行。
`tickets` テーブルには anon ロール向けの RLS SELECT ポリシーが必要。

## テスト

開発サーバーを起動した状態で `npm test`。

統合テスト1件: project_1 の月別カウントの合計が 2,340 であることを検証する。
ページング処理を外すと合計が約 1,000 に落ち、テストが失敗する:

（← ここに既存のスクリーンショット2枚の img タグをそのまま残す）

## 検証

API の出力が Supabase ダッシュボードの SQL GROUP BY と月ごとに一致
（project_1: 394 / 391 / 389 / 389 / 389 / 388）:

（← 既存の SQL / Browser 比較ブロックをそのまま残す）

## 作業ログ

試行錯誤と学びの記録: 
English [journal.md](./journal.md)
日本語 [journalーjp.md](./journal-jp.md)
