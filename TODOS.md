# TODOS

## Infrastructure

**Priority:** P2
### Migrate KV to persistent database
Replace Vercel KV (Redis cache with TTL) with a persistent datastore for waitlist entries and scan history. Vercel KV entries expire — waitlist signups should not. Consider Vercel Postgres, Supabase, or PlanetScale.
**Why:** Waitlist entries stored in KV will be lost on eviction. Revenue-critical data needs durable storage.
**Depends on:** Nothing — can be done independently.

---

**Priority:** P3
### Add structured logging
Replace `console.log`/`console.error` calls in `lib/kv.ts` and API routes with a structured logging library (e.g., pino). Include request IDs, timestamps, and context for debugging production issues.
**Why:** Current logging is ad-hoc. Structured logs enable filtering, alerting, and debugging in Vercel's log viewer.
**Depends on:** Nothing.

---

## Testing

**Priority:** P2
### Add E2E tests for critical user flows
Add Playwright E2E tests covering: (1) homepage → enter URL → see results, (2) results page → enter email in concierge CTA → see success state, (3) share URL loads cached results. These flows span multiple components and API routes where unit tests aren't sufficient.
**Why:** Unit tests cover individual functions but not the full scan-to-results-to-waitlist journey.
**Depends on:** Nothing — Playwright can be added independently.

---

## Completed

### E2E tests for critical user flows
Added 18 Playwright E2E tests covering: homepage rendering + scanner validation, full scan-to-results flow, waitlist email signup, 404 error pages, cached results loading from share URLs. PR #2 merged.
