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
  affiliates?: unknown;
  views?: number | null;
}

export interface StreamData {
  stream_url: string;
  affiliate_url: string;
  platform_name: string;
  click_count: number;
  streams: StreamLink[];
  affiliates: StreamLink[];
  /** how many people pressed play on this match */
  views: number;
}

function parseLinks(raw: unknown): StreamLink[] {
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
    throw new StreamError(detail || `Supabase ${resp.status}`, resp.status);
  }
  return resp;
}

function cleanRow(row: StreamRow): StreamData {
  const streamUrl = (row.stream_url || '').trim();
  const affiliateUrl = (row.affiliate_url || '').trim();
  const platformName = (row.platform_name || '').trim();

  let streams = parseLinks(row.streams);
  if (streams.length === 0 && streamUrl) {
    streams = [{ name: 'لینکی ١', url: streamUrl }];
  }
  let affiliates = parseLinks(row.affiliates);
  if (affiliates.length === 0 && affiliateUrl) {
    affiliates = [{ name: platformName || 'پلاتفۆرمی فەرمی', url: affiliateUrl }];
  }

  return {
    stream_url: streamUrl,
    affiliate_url: affiliateUrl,
    platform_name: platformName,
    click_count: row.click_count || 0,
    streams,
    affiliates,
    views: row.views || 0,
  };
}

/** Reads rows. If a newer column does not exist yet it falls back to the older column sets. */
async function fetchRows(filter: string): Promise<StreamRow[]> {
  const base = 'match_id,stream_url,affiliate_url,platform_name,click_count';
  const variants = [
    `${base},streams,affiliates,views`,
    `${base},streams,affiliates`,
    `${base},streams`,
    base,
  ];
  let lastErr: unknown;
  for (const cols of variants) {
    try {
      const resp = await supabaseFetch(`/match_streams?${filter}select=${cols}`);
      return (await resp.json()) as StreamRow[];
    } catch (err) {
      lastErr = err;
      if (err instanceof StreamError && err.status === 400) continue;
      throw err;
    }
  }
  throw lastErr;
}

export async function getAllStreamData(): Promise<Record<string, StreamData>> {
  const rows = await fetchRows('');
  const map: Record<string, StreamData> = {};
  for (const row of rows) {
    map[row.match_id] = cleanRow(row);
  }
  return map;
}

export async function getStreamData(matchId: string): Promise<StreamData | undefined> {
  const rows = await fetchRows(`match_id=eq.${encodeURIComponent(matchId)}&`);
  if (rows.length === 0) return undefined;
  return cleanRow(rows[0]);
}

export interface StreamUpdate {
  streams: StreamLink[];
  affiliates: StreamLink[];
}

// Admin only (requires a signed-in session)
export async function setStreamData(
  matchId: string,
  data: StreamUpdate
): Promise<void> {
  const clean = (list: StreamLink[]) =>
    list
      .map((l) => ({ name: l.name.trim(), url: l.url.trim() }))
      .filter((l) => l.url.length > 0);

  const streams = clean(data.streams);
  const affiliates = clean(data.affiliates);
  const hasAny = streams.length > 0 || affiliates.length > 0;

  // Special rows (featured stream, counters) are never deleted, so their counters survive
  if (!hasAny && !matchId.startsWith('__')) {
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
      // the first link of each list is also kept in the older single columns
      stream_url: streams[0]?.url ?? '',
      streams,
      affiliate_url: affiliates[0]?.url ?? '',
      platform_name: affiliates[0]?.name ?? '',
      affiliates,
      updated_at: new Date().toISOString(),
    }),
  });
}

// Public counters go through SQL functions, so visitors never get direct write access.
function isAdminBrowser(): boolean {
  try {
    return !!localStorage.getItem('derby_admin_session');
  } catch {
    return false;
  }
}

export async function incrementClickCount(matchId: string): Promise<void> {
  try {
    if (isAdminBrowser()) return; // the admin's own tests are not counted
    await supabaseFetch('/rpc/bump_click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_match_id: matchId }),
    });
  } catch (err) {
    console.error('Failed to increment click count:', err);
  }
}

/**
 * Counts a real visitor once per day (Baghdad time).
 * Not counted: the admin, bots and automated browsers.
 */
export async function recordSiteVisit(): Promise<void> {
  try {
    if (typeof window === 'undefined') return;
    if (localStorage.getItem('derby_admin_session')) return;

    const ua = navigator.userAgent || '';
    if (
      (navigator as Navigator & { webdriver?: boolean }).webdriver ||
      /bot|crawl|spider|slurp|headless|lighthouse|preview|facebookexternalhit/i.test(ua)
    ) {
      return;
    }

    const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Baghdad' }).format(new Date());
    if (localStorage.getItem('derby_visit_day') === today) return;

    await supabaseFetch('/rpc/bump_daily_visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    localStorage.setItem('derby_visit_day', today);
  } catch (err) {
    console.error('Failed to record visit:', err);
  }
}

/** Counts one "play" for a match stream (once per match per browser session; not the admin). */
export async function incrementViewCount(matchId: string): Promise<void> {
  try {
    if (isAdminBrowser()) return;
    const key = `derby_viewed_${matchId}`;
    if (sessionStorage.getItem(key)) return;
    await supabaseFetch('/rpc/bump_view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_match_id: matchId }),
    });
    sessionStorage.setItem(key, '1');
  } catch (err) {
    console.error('Failed to count view:', err);
  }
}
