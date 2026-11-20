/*
# Create match_streams table for global stream URL sharing

## Purpose
Stores stream URLs for football matches so that links saved in the /admin panel
are persisted in the database and visible to ALL visitors globally (not just the
browser that saved them). Previously stream URLs were stored in localStorage which
was per-browser only.

## New Table: match_streams
- match_id (text, primary key) — unique identifier for each match (e.g. "premier_league-401879244")
- stream_url (text) — the embed URL for the match stream (YouTube embed, etc.)
- updated_at (timestamptz) — automatically set to now() on every insert/update

## Security
- RLS enabled on match_streams.
- This is a no-auth single-tenant app (the /admin panel uses a client-side PIN,
  no Supabase authentication). All policies target anon + authenticated so the
  anon-key frontend can read and write stream URLs.
- All CRUD operations are intentionally public/shared — any visitor can read
  stream URLs, and the admin panel (using the anon key) can create/update/delete them.

## Grants
- SELECT, INSERT, UPDATE, DELETE granted to anon, authenticated
*/

CREATE TABLE IF NOT EXISTS match_streams (
  match_id text PRIMARY KEY,
  stream_url text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE match_streams ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON match_streams TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_streams" ON match_streams;
CREATE POLICY "anon_select_streams" ON match_streams FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_streams" ON match_streams;
CREATE POLICY "anon_insert_streams" ON match_streams FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_streams" ON match_streams;
CREATE POLICY "anon_update_streams" ON match_streams FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_streams" ON match_streams;
CREATE POLICY "anon_delete_streams" ON match_streams FOR DELETE
  TO anon, authenticated USING (true);
