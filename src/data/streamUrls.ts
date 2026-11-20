const SUPABASE_URL = 'https://oojnshatzltixdbvkheg.supabase.co/rest/v1';
const SUPABASE_ANON_KEY = 'sb_publishable_zhC3cWCxc7hOHbeD1_ZahA_34Ut2hpx';

export interface StreamData {
  stream_url: string;
  affiliate_url: string;
  platform_name: string;
  click_count: number;
}

interface StreamRow {
  match_id: string;
  stream_url: string;
  affiliate_url?: string;
  platform_name?: string;
  click_count?: number;
}

export class StreamError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'StreamError';
  }
}

function extractYouTubeId(input: string): string | null {
  const cleaned = input
    .replace(/['"`<>]/g, '')
    .replace(/&amp;/g, '&')
    .trim();

  const srcMatch = cleaned.match(/src=["']?([^"'\s>]+)/);
  const candidate = srcMatch ? srcMatch[1] : cleaned;

  const idMatch = candidate.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/))([a-zA-Z0-9_-]{11})/
  );
  return idMatch ? idMatch[1] : null;
}

export function convertToEmbedUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';

  const ytId = extractYouTubeId(trimmed);
  if (ytId) {
    return `https://www.youtube.com/embed/${ytId}`;
  }

  const srcMatch = trimmed.match(/src=["']?([^"'\s>]+)/);
  if (srcMatch) {
    const url = srcMatch[1].replace(/['"`<>]/g, '').trim();
    if (url) return url;
  }

  return trimmed.replace(/['"`<>]/g, '').trim();
}

async function supabaseFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers: Record<string, string> = {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    ...((options.headers as Record<string, string>) || {}),
  };

  const resp = await fetch(`${SUPABASE_URL}${path}`, { ...options, headers });

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
  return {
    stream_url: (row.stream_url || '').trim(),
    affiliate_url: (row.affiliate_url || '').trim(),
    platform_name: (row.platform_name || '').trim(),
    click_count: row.click_count || 0,
  };
}

export async function getAllStreamData(): Promise<Record<string, StreamData>> {
  const resp = await supabaseFetch(
    '/match_streams?select=match_id,stream_url,affiliate_url,platform_name,click_count'
  );
  const rows: StreamRow[] = await resp.json();
  const map: Record<string, StreamData> = {};
  for (const row of rows) {
    map[row.match_id] = cleanRow(row);
  }
  return map;
}

export async function getStreamData(matchId: string): Promise<StreamData | undefined> {
  const resp = await supabaseFetch(
    `/match_streams?match_id=eq.${encodeURIComponent(matchId)}&select=stream_url,affiliate_url,platform_name,click_count`
  );
  const rows: StreamRow[] = await resp.json();
  if (rows.length === 0) return undefined;
  return cleanRow(rows[0]);
}

export interface StreamUpdate {
  stream_url: string;
  affiliate_url: string;
  platform_name: string;
}

export async function setStreamData(
  matchId: string,
  data: StreamUpdate
): Promise<void> {
  const streamUrl = data.stream_url.trim();
  const affiliateUrl = data.affiliate_url.trim();
  const platformName = data.platform_name.trim();

  const hasAny = streamUrl.length > 0 || affiliateUrl.length > 0;

  if (!hasAny && platformName.length === 0) {
    await supabaseFetch(
      `/match_streams?match_id=eq.${encodeURIComponent(matchId)}`,
      { method: 'DELETE' }
    );
    return;
  }

  await supabaseFetch('/match_streams', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify({
      match_id: matchId,
      stream_url: streamUrl,
      affiliate_url: affiliateUrl,
      platform_name: platformName,
      updated_at: new Date().toISOString(),
    }),
  });
}

export async function incrementClickCount(matchId: string): Promise<void> {
  // Use PostgREST RPC-style increment via PATCH with a computed value.
  // PostgREST doesn't support atomic increment directly, so we read-then-write.
  // This is acceptable for click tracking — occasional race conditions just mean
  // a click might not be counted in edge cases.
  try {
    const resp = await supabaseFetch(
      `/match_streams?match_id=eq.${encodeURIComponent(matchId)}&select=click_count`
    );
    const rows: StreamRow[] = await resp.json();
    const current = rows.length > 0 ? (rows[0].click_count || 0) : 0;

    await supabaseFetch(
      `/match_streams?match_id=eq.${encodeURIComponent(matchId)}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ click_count: current + 1 }),
      }
    );
  } catch (err) {
    console.error('Failed to increment click count:', err);
  }
}
