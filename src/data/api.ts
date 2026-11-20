import type { Match, MatchStatus, LeagueId, GoalScorer, MatchStats } from '@/data/matches';
import { iraqiFallbackMatches, allFallbackMatches } from '@/data/matches';

const ESPN_BASE = 'https://site.api.espn.com/apis/site/v2/sports/soccer';

const LEAGUES: { code: string; id: LeagueId; name: string }[] = [
  { code: 'eng.1', id: 'premier_league', name: 'Premier League' },
  { code: 'esp.1', id: 'la_liga', name: 'La Liga' },
  { code: 'uefa.champions', id: 'champions_league', name: 'Champions League' },
  { code: 'ita.1', id: 'serie_a', name: 'Serie A' },
  { code: 'fifa.world', id: 'international', name: 'FIFA World Cup' },
  { code: 'uefa.nations', id: 'international', name: 'UEFA Nations League' },
];

interface ESPNTeam {
  id: string;
  abbreviation: string;
  displayName: string;
  shortDisplayName: string;
  name: string;
  color?: string;
  logo?: string;
}

interface ESPNCompetitor {
  id: string;
  homeAway: 'home' | 'away';
  score: string;
  winner?: boolean;
  team: ESPNTeam;
  statistics?: Array<{ name: string; abbreviation: string; displayValue: string }>;
}

interface ESPNDetail {
  type: { id: string; text: string };
  clock: { value: number; displayValue: string };
  team: { id: string };
  scoreValue: number;
  scoringPlay: boolean;
  penaltyKick: boolean;
  ownGoal: boolean;
  yellowCard: boolean;
  redCard: boolean;
  athletesInvolved?: Array<{ displayName: string; shortName: string }>;
}

interface ESPNCompetition {
  competitors: ESPNCompetitor[];
  details?: ESPNDetail[];
  venue?: { fullName?: string; displayName?: string };
  status: {
    clock: number;
    displayClock: string;
    period: number;
    type: {
      id: string;
      name: string;
      state: string;
      completed: boolean;
      description: string;
      detail: string;
      shortDetail: string;
    };
  };
}

interface ESPNEvent {
  id: string;
  date: string;
  name: string;
  shortName: string;
  competitions: ESPNCompetition[];
  status: ESPNCompetition['status'];
  venue?: { displayName: string };
}

interface ESPNScoreboard {
  events?: ESPNEvent[];
}

function stateToStatus(state: string): MatchStatus {
  switch (state) {
    case 'in':
      return 'live';
    case 'post':
      return 'finished';
    default:
      return 'upcoming';
  }
}

function extractMinute(displayClock: string): number | undefined {
  const match = displayClock.match(/(\d+)'/);
  if (match) return parseInt(match[1], 10);
  const num = parseInt(displayClock.replace(/[^0-9]/g, ''), 10);
  return isNaN(num) ? undefined : num;
}

function formatKickoffTime(dateStr: string): string {
  const d = new Date(dateStr);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

function normalizeColor(color?: string): string {
  if (!color) return '#1e293b';
  if (color.length === 6) return `#${color}`;
  return color;
}

function extractStats(competition: ESPNCompetition): MatchStats | undefined {
  const home = competition.competitors.find((c) => c.homeAway === 'home');
  const away = competition.competitors.find((c) => c.homeAway === 'away');
  if (!home?.statistics || !away?.statistics) return undefined;

  const getStat = (stats: typeof home.statistics, abbr: string): number => {
    const s = stats?.find((st) => st.abbreviation === abbr);
    return s ? parseFloat(s.displayValue) || 0 : 0;
  };

  return {
    possession: [getStat(home.statistics, 'PP'), getStat(away.statistics, 'PP')],
    shots: [getStat(home.statistics, 'SHOT'), getStat(away.statistics, 'SHOT')],
    shotsOnTarget: [getStat(home.statistics, 'SOG'), getStat(away.statistics, 'SOG')],
    corners: [getStat(home.statistics, 'CW'), getStat(away.statistics, 'CW')],
    fouls: [getStat(home.statistics, 'FC'), getStat(away.statistics, 'FC')],
    yellowCards: [0, 0],
    redCards: [0, 0],
    offsides: [0, 0],
  };
}

function extractGoals(competition: ESPNCompetition): GoalScorer[] | undefined {
  if (!competition.details) return undefined;
  const homeId = competition.competitors.find((c) => c.homeAway === 'home')?.id;
  const awayId = competition.competitors.find((c) => c.homeAway === 'away')?.id;

  const goals: GoalScorer[] = [];
  for (const d of competition.details) {
    if (!d.scoringPlay) continue;
    const athlete = d.athletesInvolved?.[0];
    if (!athlete) continue;
    const minuteMatch = d.clock.displayValue.match(/(\d+)/);
    const minute = minuteMatch ? parseInt(minuteMatch[1], 10) : 0;
    goals.push({
      name: athlete.displayName,
      minute,
      team: d.team.id === homeId ? 'home' : d.team.id === awayId ? 'away' : 'home',
      penalty: d.penaltyKick,
    });
  }
  return goals.length > 0 ? goals : undefined;
}

function extractCards(competition: ESPNCompetition): [number, number] {
  if (!competition.details) return [0, 0];
  const homeId = competition.competitors.find((c) => c.homeAway === 'home')?.id;
  const awayId = competition.competitors.find((c) => c.homeAway === 'away')?.id;
  let home = 0, away = 0;
  for (const d of competition.details) {
    if (d.yellowCard) {
      if (d.team.id === homeId) home++;
      else if (d.team.id === awayId) away++;
    }
  }
  return [home, away];
}

function transformEvent(event: ESPNEvent, leagueId: LeagueId, leagueName: string): Match {
  const comp = event.competitions[0];
  const homeComp = comp.competitors.find((c) => c.homeAway === 'home');
  const awayComp = comp.competitors.find((c) => c.homeAway === 'away');

  if (!homeComp || !awayComp) {
    return {
      id: `${leagueId}-${event.id}`,
      leagueId,
      leagueName,
      homeTeam: { name: 'TBD', shortName: 'TBD', logoColor: '#1e293b', logoText: '?' },
      awayTeam: { name: 'TBD', shortName: 'TBD', logoColor: '#1e293b', logoText: '?' },
      status: 'upcoming',
      kickoffTime: formatKickoffTime(event.date),
      kickoffDate: event.date,
    };
  }

  const status = stateToStatus(comp.status.type.state);
  const homeTeam = homeComp.team;
  const awayTeam = awayComp.team;
  const venue = comp.venue?.fullName || comp.venue?.displayName || event.venue?.displayName;

  const baseStats = extractStats(comp);
  const goals = extractGoals(comp);
  const [yellowHome, yellowAway] = extractCards(comp);

  const stats: MatchStats | undefined = baseStats
    ? { ...baseStats, yellowCards: [yellowHome, yellowAway] }
    : undefined;

  return {
    id: `${leagueId}-${event.id}`,
    leagueId,
    leagueName,
    homeTeam: {
      name: homeTeam.displayName,
      shortName: homeTeam.abbreviation || homeTeam.shortDisplayName,
      logoColor: normalizeColor(homeTeam.color),
      logoText: homeTeam.abbreviation || homeTeam.shortDisplayName.substring(0, 3).toUpperCase(),
      crest: homeTeam.logo,
    },
    awayTeam: {
      name: awayTeam.displayName,
      shortName: awayTeam.abbreviation || awayTeam.shortDisplayName,
      logoColor: normalizeColor(awayTeam.color),
      logoText: awayTeam.abbreviation || awayTeam.shortDisplayName.substring(0, 3).toUpperCase(),
      crest: awayTeam.logo,
    },
    status,
    kickoffTime: formatKickoffTime(event.date),
    kickoffDate: event.date,
    liveMinute: status === 'live' ? extractMinute(comp.status.displayClock) : undefined,
    homeScore: status === 'upcoming' ? undefined : parseInt(homeComp.score, 10) || 0,
    awayScore: status === 'upcoming' ? undefined : parseInt(awayComp.score, 10) || 0,
    streamUrl: '',
    venue,
    goals,
    stats,
  };
}

async function fetchLeagueScoreboard(
  code: string
): Promise<ESPNEvent[]> {
  const url = `${ESPN_BASE}/${code}/scoreboard`;
  const resp = await fetch(url);

  if (!resp.ok) {
    throw new Error(`${code} ESPN ${resp.status}`);
  }

  const json: ESPNScoreboard = await resp.json();
  return json.events || [];
}

export async function fetchMatches(): Promise<{
  matches: Match[];
  usingFallback: boolean;
  error: string | null;
}> {
  const allMatches: Match[] = [];
  let hadError = false;
  let errorMsg: string | null = null;
  const seenIds = new Set<string>();

  for (const { code, id, name } of LEAGUES) {
    try {
      const events = await fetchLeagueScoreboard(code);
      for (const event of events) {
        const matchId = `${id}-${event.id}`;
        if (seenIds.has(matchId)) continue;
        seenIds.add(matchId);
        allMatches.push(transformEvent(event, id, name));
      }
    } catch (err) {
      hadError = true;
      errorMsg = err instanceof Error ? err.message : 'هەڵەیەک ڕوویدا';
    }
  }

  if (hadError && allMatches.length === 0) {
    return {
      matches: allFallbackMatches,
      usingFallback: true,
      error: errorMsg,
    };
  }

  if (allMatches.length === 0) {
    return {
      matches: allFallbackMatches,
      usingFallback: true,
      error: 'هیچ یارییەک بەردەست نەبوو بۆ ئەم ڕۆژانە، پیشاندانی داتای نموونە',
    };
  }

  const merged = [...allMatches, ...iraqiFallbackMatches];
  return {
    matches: merged,
    usingFallback: hadError,
    error: hadError ? 'هەندێک خول لەسەر یەک نەگەیشتن — بەشێک لە داتا لەسەر بنکەیەکە' : null,
  };
}
