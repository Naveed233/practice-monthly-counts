# practice-monthly-counts (Geoscope ticket#178 copy) 

Practice task: monthly ticket counts per project (mirrors sensy-geoscope PR #178).
Live: https://practice-monthly-counts.vercel.app

## What it does

Next.js (Pages Router) app showing monthly ticket counts per project.
- Counts by `prediction_executed_at`, excluding NULL rows
- Paginates with `.range()` in 1,000-row batches past PostgREST's default
  per-request cap — project_1 (2,340 non-null rows) returns correct totals
- Stack: Next.js / TypeScript / Supabase (@supabase/supabase-js) / Vercel

## Run locally

1. `npm install`
2. Create `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=<your Supabase project URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your publishable key>
```
3. `npm run dev` → http://localhost:3000

## Seed

Run `⟨lib/supabase/migrations/20260826164430_seed.sql⟩` in the Supabase SQL editor.
Creates 3 projects across 6 months: project_1 = 2,600 rows (~10% NULL
prediction_executed_at), project_2 = 400, project_3 = 600.
The `tickets` table needs an RLS SELECT policy for the anon role.

## Test

With the dev server running:
`npm test`

One integration test asserts project_1's monthly counts sum to 2,340.
Removing the paging loop drops the sum to ~1,000 and fails the test:

<img width="363" height="226" alt="image" src="https://github.com/user-attachments/assets/57ea8562-5f9d-425c-a007-458bda6f00eb" >

<img width="353" height="350" alt="image" src="https://github.com/user-attachments/assets/f60b092e-31bb-49cb-ba25-d76bf0ed02b5" >

## Verification

API output matches SQL GROUP BY in the Supabase dashboard, month by month
(project_1: 394 / 391 / 389 / 389 / 389 / 388):

SQL 
| month   | count |
| ------- | ----- |
| 2026-01 | 394   |
| 2026-02 | 391   |
| 2026-03 | 389   |
| 2026-04 | 389   |
| 2026-05 | 389   |
| 2026-06 | 388   |

Browser
[{"month":"2026-01","count":394},{"month":"2026-02","count":391},{"month":"2026-03","count":389},{"month":"2026-04","count":389},{"month":"2026-05","count":389},{"month":"2026-06","count":388}]

## Journal

Work log with mistakes and lessons: [journal.md](./journal.md)
