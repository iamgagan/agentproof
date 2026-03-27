// lib/kv.ts
// Re-exports scan result storage from lib/db.ts (Postgres).
// This file exists for backwards-compatibility with existing imports.

export { storeScanResult, getScanResult, getScanResultByUrl } from './db';
