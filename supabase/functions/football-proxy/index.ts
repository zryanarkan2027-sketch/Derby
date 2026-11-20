import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const API_KEY = "dbb002c8b6a047aa8b5669143387b9e3";
const API_BASE = "https://api.football-data.org/v4";
const CACHE_TTL_MS = 60 * 1000; // 1 minute — live scores need to be fresh

const LEAGUE_MAP: Record<string, string> = {
  PL: "premier_league",
  PD: "la_liga",
  CL: "champions_league",
  SA: "serie_a",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, serviceRoleKey);

interface FDMatch {
  id: number;
  status: string;
  utcdate: string;
  matchday?: number;
  stage?: string;
  group?: string;
  homeTeam: { id: number; name: string; shortName?: string; tla?: string; crest?: string };
  awayTeam: { id: number; name: string; shortName?: string; tla?: string; crest?: string };
  score?: {
    fullTime: { home: number | null; away: number | null };
    halfTime: { home: number | null; away: number | null };
  };
  venue?: string | null;
  referees?: Array<{ name?: string }>;
}

function statusToMatchStatus(status: string): "live" | "upcoming" | "finished" {
  switch (status) {
    case "IN_PLAY":
    case "PAUSED":
    case "LIVE":
      return "live";
    case "FINISHED":
    case "AWARDED":
    case "CANCELLED":
    case "POSTPONED":
    case "SUSPENDED":
      return "finished";
    default:
      return "upcoming";
  }
}

function computeLiveMinute(utcDate: string): number | undefined {
  const start = new Date(utcDate).getTime();
  const now = Date.now();
  const elapsed = Math.floor((now - start) / 60000);
  if (elapsed < 0) return undefined;
  if (elapsed <= 45) return elapsed;
  if (elapsed <= 60) return 45; // halftime
  if (elapsed <= 105) return elapsed - 15; // subtract ~15 min halftime
  return 90;
}

function formatKickoffTime(utcDate: string): string {
  const d = new Date(utcDate);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

function transformMatch(fm: FDMatch, leagueCode: string, leagueName: string) {
  const status = statusToMatchStatus(fm.status);
  return {
    id: `${leagueCode}-${fm.id}`,
    leagueId: LEAGUE_MAP[leagueCode] ?? leagueCode,
    leagueName,
    homeTeam: {
      name: fm.homeTeam.name,
      shortName: fm.homeTeam.tla || fm.homeTeam.shortName || fm.homeTeam.name.substring(0, 3).toUpperCase(),
      logoColor: "#1e293b",
      logoText: fm.homeTeam.tla || fm.homeTeam.name.substring(0, 3).toUpperCase(),
      crest: fm.homeTeam.crest || undefined,
    },
    awayTeam: {
      name: fm.awayTeam.name,
      shortName: fm.awayTeam.tla || fm.awayTeam.shortName || fm.awayTeam.name.substring(0, 3).toUpperCase(),
      logoColor: "#1e293b",
      logoText: fm.awayTeam.tla || fm.awayTeam.name.substring(0, 3).toUpperCase(),
      crest: fm.awayTeam.crest || undefined,
    },
    status,
    kickoffTime: formatKickoffTime(fm.utcdate),
    kickoffDate: fm.utcdate,
    liveMinute: status === "live" ? computeLiveMinute(fm.utcdate) : undefined,
    homeScore: fm.score?.fullTime?.home ?? (status === "live" ? fm.score?.fullTime?.home ?? 0 : undefined),
    awayScore: fm.score?.fullTime?.away ?? (status === "live" ? fm.score?.fullTime?.away ?? 0 : undefined),
    streamUrl: "",
    venue: fm.venue || undefined,
    referee: fm.referees?.[0]?.name || undefined,
  };
}

async function fetchLeagueMatches(leagueCode: string, dateFrom: string, dateTo: string) {
  const url = `${API_BASE}/competitions/${leagueCode}/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`;
  const resp = await fetch(url, {
    headers: { "X-Auth-Token": API_KEY },
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`API ${leagueCode} ${resp.status}: ${text}`);
  }

  const json = await resp.json();
  return json;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const leagueCode = url.searchParams.get("league") || "all";
    const cacheKey = `matches:${leagueCode}`;

    // Try cache first
    const { data: cached } = await supabase
      .from("api_cache")
      .select("data, fetched_at")
      .eq("cache_key", cacheKey)
      .maybeSingle();

    const now = Date.now();
    const cacheFresh = cached && now - new Date(cached.fetched_at).getTime() < CACHE_TTL_MS;

    let resultData = cached?.data as { matches: unknown[]; fromCache: boolean } | undefined;

    if (!cacheFresh) {
      // Fetch fresh data from football-data.org
      const today = new Date();
      const dateFrom = new Date(today);
      dateFrom.setDate(dateFrom.getDate() - 2);
      const dateTo = new Date(today);
      dateTo.setDate(dateTo.getDate() + 3);

      const fromStr = dateFrom.toISOString().split("T")[0];
      const toStr = dateTo.toISOString().split("T")[0];

      const leagueNames: Record<string, string> = {
        PL: "Premier League",
        PD: "La Liga",
        CL: "Champions League",
        SA: "Serie A",
      };

      const leaguesToFetch = leagueCode === "all" ? ["PL", "PD", "CL", "SA"] : [leagueCode];

      const allMatches: unknown[] = [];

      for (const code of leaguesToFetch) {
        try {
          const json = await fetchLeagueMatches(code, fromStr, toStr);
          const matches = (json.matches || []) as FDMatch[];
          for (const m of matches) {
            allMatches.push(transformMatch(m, code, leagueNames[code] || code));
          }
        } catch (err) {
          console.error(`Failed to fetch ${code}:`, err.message);
          // Continue with other leagues — partial data is better than none
        }
      }

      resultData = { matches: allMatches, fromCache: false, fetchedAt: new Date().toISOString() };

      // Store in cache (upsert)
      await supabase
        .from("api_cache")
        .upsert({ cache_key: cacheKey, data: resultData, fetched_at: new Date().toISOString() }, { onConflict: "cache_key" });
    } else {
      resultData = { ...(cached.data as object), fromCache: true } as { matches: unknown[]; fromCache: boolean };
    }

    return new Response(
      JSON.stringify(resultData),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message, matches: [] }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
