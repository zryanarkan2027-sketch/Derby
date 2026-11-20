/*
# Add affiliate streaming columns to match_streams table

## Purpose
Support official affiliate streaming links alongside YouTube embeds, with live
click tracking so admins can see how many visitors clicked the "Watch HD on
[platform]" button for each match.

## Changes to existing table: match_streams
Three new columns added (all nullable / have defaults so existing rows remain valid):
- affiliate_url (text) — external link to official streaming platform (DAZN, ESPN+, etc.)
- platform_name (text) — display name of the platform (e.g. "DAZN", "ESPN+")
- click_count (integer, default 0) — incremented by 1 each time a visitor clicks the official watch button

## Security
No changes to existing RLS policies or grants. The table already allows full
anon + authenticated CRUD via existing policies. The new columns are covered by
the existing table-level grants (all columns). click_count is updatable by anon
since visitors need to increment it when they click the watch button.
*/

ALTER TABLE match_streams
  ADD COLUMN IF NOT EXISTS affiliate_url text DEFAULT '',
  ADD COLUMN IF NOT EXISTS platform_name text DEFAULT '',
  ADD COLUMN IF NOT EXISTS click_count integer NOT NULL DEFAULT 0;
