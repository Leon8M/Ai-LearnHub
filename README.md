# Kamusi AI

**AI course generator: describe a topic, get a structured course with lessons, quizzes and videos, in English, Kiswahili and more.**

[**Live: kamusi.denex.co.ke**](https://kamusi.denex.co.ke) · Next.js · PostgreSQL (Neon) · Drizzle · Clerk · Paystack · Groq / Gemini / OpenRouter

![Kamusi AI landing page](docs/screenshots/landing.png)

## What it does

- **Course outlines from a prompt.** Pick a topic, level, chapter count and language; the AI designs a progressive outline.
- **Full lessons, generated live.** Chapters are written in parallel and stream into the UI as each one finishes. Failed chapters can be retried for free.
- **Quizzes.** Every chapter ends with multiple-choice questions, instant feedback and explanations.
- **Public, shareable course pages.** `/c/<id>` is server-rendered and indexable, so anyone can read a course without signing up.
- **Tokens and payments.** Generating a course costs a token. New users get 3, plus 3 free each week, and can buy more with Paystack (M-Pesa and cards).
- **Learning progress, Explore, print/PDF export and an MDX blog.**

![Public course page with quiz](docs/screenshots/course.png)

## Architecture

```mermaid
flowchart LR
    U[Browser] -->|Clerk session| N[Next.js App Router on Vercel]
    N --> API[Route handlers<br/>Zod-validated]
    API --> AI[AI provider chain<br/>Groq → Gemini → OpenRouter]
    API --> DB[(Neon Postgres<br/>Drizzle ORM)]
    API --> YT[YouTube Data API]
    P[Paystack] -->|signed webhook| API
    API -->|verify transaction| P
    N -->|SSR public pages| C["/c/:id · sitemap.xml"]
```

## Engineering decisions

**Money is handled atomically.** Token spends, credits, refunds and weekly claims are each a *single SQL statement* (data-modifying CTEs). The balance check, the balance change and the ledger row commit together, so concurrent requests can't double-spend. Every credit carries a unique `reference`, so a Paystack webhook retried ten times credits once. Both properties are covered by concurrency tests against a real Postgres.

**Payments are verified, never trusted.** The webhook checks the HMAC signature in constant time, re-verifies the transaction with Paystack, and checks the amount and currency actually collected against the server-side price list, since checkout metadata can be forged. When a buyer returns from checkout, the same idempotent settle function credits them immediately, without waiting for the webhook.

**AI with fallback.** `lib/ai` tries providers in order (`AI_PROVIDERS`). Each provider accepts up to 4 keys, rotates past rate-limited keys (respecting `Retry-After`), and falls through to the next provider on errors or invalid output. Models return JSON via structured output, and the result is validated again with Zod before it's stored. This replaced a regex "JSON repair" parser.

**Untrusted AI output.** Lesson HTML is model-generated and courses are public, so it's sanitised with an allow-list (`lib/sanitize.js`) before it's stored and again when it's served.

**Serverless-friendly database.** Neon is queried over HTTP (`@neondatabase/serverless`), one round trip per query and no connection pool to exhaust. Local development and CI use plain Postgres over TCP with the same code.

**Identity comes from the session.** Every route reads the user from Clerk on the server; ids and emails in request bodies are ignored. Course access is checked against ownership or `is_public`.

## Running locally

```bash
cp .env.example .env.local        # fill in Clerk + at least one AI provider key
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=dev -e POSTGRES_DB=kamusi postgres:17-alpine
npm install
npm run db:migrate
npm run dev
```

## Tests

Integration tests run against a real, disposable Postgres. They cover concurrent token spending, idempotent payment crediting, forged payments, course ownership, account deletion, the AI fallback chain and HTML sanitising.

```bash
docker run -d -p 55432:5432 -e POSTGRES_PASSWORD=test -e POSTGRES_DB=kamusi postgres:17-alpine
TEST_DATABASE_URL=postgres://postgres:test@localhost:55432/kamusi npm test
```

CI (GitHub Actions) runs lint, the migrations, the test suite and a production build on every push.

## Deploying on Vercel with Neon

1. **Storage → Create Database → Neon**, and connect it to the project. This injects `DATABASE_URL` and `DATABASE_URL_UNPOOLED`.
2. Add the remaining variables from `.env.example`: Clerk, AI provider keys, `PAYSTACK_SECRET_KEY`, `NEXT_PUBLIC_APP_URL`.
3. Deploy. On production deployments `vercel-build` runs `next build` and then `drizzle-kit migrate` (all pending migrations in one transaction; if it fails, the deployment fails and production is untouched). Preview deployments skip migrations unless `RUN_MIGRATIONS=1` is set (do that when previews use their own Neon branch), so a preview can never migrate the production database early.
4. In the Paystack dashboard, set the webhook URL to `https://<your-domain>/api/paystack-webhook`.

## License

MIT, see [LICENSE](LICENSE). Built by [Leon M. Njeru](https://leonosportfolio.vercel.app) · [leonmunene254@gmail.com](mailto:leonmunene254@gmail.com)
