# TODOS

All items completed.

---

## Completed

### Migrate waitlist to persistent database
Moved waitlist storage from Vercel KV (ephemeral) to Vercel Postgres (persistent). New `lib/db.ts` handles waitlist CRUD with auto-migration (CREATE TABLE IF NOT EXISTS). Scan cache remains in KV (appropriate for ephemeral 24h TTL data). Falls back to in-memory Map in local dev when POSTGRES_URL is not set. PR #4.

### Add structured logging
Replaced all `console.log`/`console.error` in app code with pino structured logger (`lib/logger.ts`). JSON output to stdout for Vercel's log viewer to parse, filter, and alert on. PR #4.

### E2E tests for critical user flows
Added 18 Playwright E2E tests covering: homepage rendering + scanner validation, full scan-to-results flow, waitlist email signup, 404 error pages, cached results loading from share URLs. PR #2 merged.
