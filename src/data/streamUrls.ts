import { getAccessToken } from '@/data/adminAuth';

const SUPABASE_URL = 'https://oojnshatzltixdbvkheg.supabase.co/rest/v1';
const SUPABASE_ANON_KEY = 'sb_publishable_zhC3cWCxc7hOHbeD1_ZahA_34Ut2hpx';

export class StreamError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'StreamError';
    this.status = status;
  }
}

export interface StreamLink {
  name: string;
  url: string;
}

interface StreamRow {
  match_id: string;
  stream_url: string | null;
  affiliate_url: string | null;
  platform_name: string | null;
  click_count: number | null;
  streams?: unknown;
}

export interface StreamData {
  stream_url: string;
  affiliate_url: string;
  platform_name: string;
  click_count: number;
  streams: StreamLink[];
}

function parseStreams(raw: unknown, fallbackUrl: string): StreamLink[] {
  const out: StreamLink[] = [];
  if (Array.isArray(raw)) {
    for (const item of raw) {
      if (item && typeof item === 'object') {
        const url = String((item as { url?: unknown }).url ?? '').trim();
        const name = String((item as { name?: unknown }).name ?? '').trim();
        if (url) out.push({ name, url });
      }
    }
  }
  if (out.length === 0 && fallbackUrl) {
    out.push({ name: 'لینکی ١', url: fallbackUrl });
  }
  return out;
}

export function convertToEmbedUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';

  const regExp = /(?:youtube\.com\/(?:watch\?v=|embed\/|live\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = trimmed.match(regExp);

  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}`;
  }

  return trimmed.replace(/['"`<>]/g, '').trim();
}

interface FetchOptions extends RequestInit {
  /** When true, the request is sent with the signed-in admin's token. */
  admin?: boolean;
}

async function supabaseFetch(
  path: string,
  options: FetchOptions = {}
): Promise<Response> {
  const { admin, ...init } = options;

  let bearer = SUPABASE_ANON_KEY;
  if (admin) {
    const token = await getAccessToken();
    if (!token) {
      throw new StreamError('Not signed in. Please log in again.', 401);
    }
    bearer = token;
  }

  const headers: Record<string, string> = {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${bearer}`,
    ...((init.headers as Record<string, string>) || {}),
  };

  const resp = await fetch(`${SUPABASE_URL}${path}`, { ...init, headers });

  if (!resp.ok) {
    let detail = '';
    try {
      const body = await resp.json();
      detail = body?.message || body?.error || '';
    } catch {
      // response had no JSON body
    }
    throw new StreamError(
      detail || `Supabase ${resp.status}`,
      resp.status
    );
  }
  return resp;
}

function cleanRow(row: StreamRow): StreamData {
  const streamUrl = (row.stream_url || '').trim();
  return {
    stream_url: streamUrl,
    affiliate_url: (row.affiliate_url || '').trim(),
    platform_name: (row.platform_name || '').trim(),
    click_count: row.click_count || 0,
    streams: parseStreams(row.streams, streamUrl),
  };
}

export async function getAllStreamData(): Promise<Record<string, StreamData>> {
  let resp: Response;
  try {
    resp = await supabaseFetch(
      '/match_streams?select=match_id,stream_url,affiliate_url,platform_name,click_count,streams'
    );
  } catch (err) {
    // The "streams" column may not exist yet: fall back to the old columns
    if (err instanceof StreamError && err.status === 400) {
      resp = await supabaseFetch(
        '/match_streams?select=match_id,stream_url,affiliate_url,platform_name,click_count'
      );
    } else {
      throw err;
    }
  }
  const rows: StreamRow[] = await resp.json();
  const map: Record<string, StreamData> = {};
  for (const row of rows) {
    map[row.match_id] = cleanRow(row);
  }
  return map;
}

export async function getStreamData(matchId: string): Promise<StreamData | undefined> {
  const base = `/match_streams?match_id=eq.${encodeURIComponent(matchId)}&select=stream_url,affiliate_url,platform_name,click_count`;
  let resp: Response;
  try {
    resp = await supabaseFetch(`${base},streams`);
  } catch (err) {
    if (err instanceof StreamError && err.status === 400) {
      resp = await supabaseFetch(base);
    } else {
      throw err;
    }
  }
  const rows: StreamRow[] = await resp.json();
  if (rows.length === 0) return undefined;
  return cleanRow(rows[0]);
}

export interface StreamUpdate {
  streams: StreamLink[];
  affiliate_url: string;
  platform_name: string;
}

// Admin only (requires a signed-in session)
export async function setStreamData(
  matchId: string,
  data: StreamUpdate
): Promise<void> {
  const streams = data.streams
    .map((l) => ({ name: l.name.trim(), url: l.url.trim() }))
    .filter((l) => l.url.length > 0);
  const affiliateUrl = data.affiliate_url.trim();
  const platformName = data.platform_name.trim();

  const hasAny = streams.length > 0 || affiliateUrl.length > 0;

  if (!hasAny && platformName.length === 0) {
    await supabaseFetch(
      `/match_streams?match_id=eq.${encodeURIComponent(matchId)}`,
      { method: 'DELETE', admin: true }
    );
    return;
  }

  await supabaseFetch('/match_streams', {
    method: 'POST',
    admin: true,
    headers: {
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify({
      match_id: matchId,
      // first link also goes in stream_url (used by the featured stream and older code)
      stream_url: streams[0]?.url ?? '',
      streams,
      affiliate_url: affiliateUrl,
      platform_name: platformName,
      updated_at: new Date().toISOString(),
    }),
  });
}

// Public counters go through SQL functions (bump_click / bump_site_stats),
// so visitors never get direct write access to the table.
export async function incrementClickCount(matchId: string): Promise<void> {
  try {
    await supabaseFetch('/rpc/bump_click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_match_id: matchId }),
    });
  } catch (err) {
    console.error('Failed to increment click count:', err);
  }
}

export async function recordSiteVisit(): Promise<void> {
  try {
    if (typeof window !== 'undefined' && sessionStorage.getItem('derby_visited')) {
      return;
    }
    await supabaseFetch('/rpc/bump_site_stats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    if (typeof window !== 'undefined') {
      sessionStorage.setItem('derby_visited', 'true');
    }
  } catch (err) {
    console.error('Failed to record visit:', err);
  }
}
