/*
# Create API cache table for football-data.org responses

1. New Tables
- `api_cache`
  - `id` (uuid, primary key)
  - `cache_key` (text, unique — identifies the API endpoint, e.g. "matches:PL")
  - `data` (jsonb — the raw API response body)
  - `fetched_at` (timestamptz — when the cache row was written)

2. Security
- Enable RLS on `api_cache`.
- Grant SELECT and INSERT to `anon, authenticated` so the edge function
  (running as service_role) can read/write, and the anon-key client can read.
- Allow anon + authenticated to read all cache rows (intentionally public, no user data).
- Allow anon + authenticated to insert/update cache rows (the edge function writes these).
*/

CREATE TABLE IF NOT EXISTS api_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key text UNIQUE NOT NULL,
  data jsonb NOT NULL,
  fetched_at timestamptz DEFAULT now()
);

ALTER TABLE api_cache ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON api_cache TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON api_cache TO service_role;

DROP POLICY IF EXISTS "anon_select_api_cache" ON api_cache;
CREATE POLICY "anon_select_api_cache"
ON api_cache FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_api_cache" ON api_cache;
CREATE POLICY "anon_insert_api_cache"
ON api_cache FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_api_cache" ON api_cache;
CREATE POLICY "anon_update_api_cache"
ON api_cache FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);
