export type LeagueId =
  | 'iraq_stars'
  | 'premier_league'
  | 'la_liga'
  | 'champions_league'
  | 'serie_a'
  | 'international';

export type MatchStatus = 'live' | 'upcoming' | 'finished';

export interface TeamInfo {
  name: string;
  shortName: string;
  logoColor: string;
  logoText: string;
  crest?: string;
}

export interface GoalScorer {
  name: string;
  minute: number;
  team: 'home' | 'away';
  penalty?: boolean;
}

export interface MatchStats {
  possession: Array<number>;
  shots: Array<number>;
  shotsOnTarget: Array<number>;
  corners: Array<number>;
  fouls: Array<number>;
  yellowCards: Array<number>;
  redCards: Array<number>;
  offsides: Array<number>;
}

export interface Match {
  id: string;
  leagueId: LeagueId;
  leagueName: string;
  homeTeam: TeamInfo;
  awayTeam: TeamInfo;
  status: MatchStatus;
  kickoffTime: string;
  kickoffDate: string;
  liveMinute?: number;
  homeScore?: number;
  awayScore?: number;
  streamUrl?: string;
  venue?: string;
  goals?: GoalScorer[];
  stats?: MatchStats;
  lineups?: {
    home: string[];
    away: string[];
  };
}

function getRelativeIsoDate(dayOffset: number, hour: number, minute: number): string {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

export const iraqiFallbackMatches: Match[] = [
  {
    id: 'iraq-stars-101',
    leagueId: 'iraq_stars',
    leagueName: 'خولی ئەستێرەکانی عێراق',
    homeTeam: {
      name: 'یانەی هەولێر (Erbil SC)',
      shortName: 'ERB',
      logoColor: '#eab308',
      logoText: 'ERB',
    },
    awayTeam: {
      name: 'یانەی شورتە (Al-Shorta)',
      shortName: 'SHO',
      logoColor: '#16a34a',
      logoText: 'SHO',
    },
    status: 'live',
    kickoffTime: '18:30',
    kickoffDate: getRelativeIsoDate(0, 18, 30),
    liveMinute: 64,
    homeScore: 1,
    awayScore: 1,
    venue: 'یاریگای شەهید فەڕەنسۆ هەریری - هەولێر',
    goals: [
      { name: 'شێرکۆ کەریم', minute: 22, team: 'home' },
      { name: 'مەهەند عەلی (میمێ)', minute: 51, team: 'away' },
    ],
    stats: {
      possession: Array.of(54, 46),
      shots: Array.of(12, 9),
      shotsOnTarget: Array.of(5, 4),
      corners: Array.of(6, 3),
      fouls: Array.of(11, 14),
      yellowCards: Array.of(2, 3),
      redCards: Array.of(0, 0),
      offsides: Array.of(2, 1),
    },
    lineups: {
      home: Array.of('حسێن عەلی', 'هەردی سیامەند', 'نیاز محەمەد', 'کۆسرەت بایز', 'شێرکۆ کەریم', 'ئاکام هاشم', 'هەڵۆ فایەق', 'محەمەد قاسم', 'ئەمجەد ڕازی', 'بارزان شێرزاد', 'دیار یاخی'),
      away: Array.of('ئەحمەد باسل', 'مەناف یونس', 'سەعد ناتق', 'ئەحمەد یەحیا', 'فەهد یوسف', 'عەبدولڕەزاق قاسم', 'عەلا عەبدولزەهرە', 'مەهەند عەلی', 'حوسێن عەلی', 'ئەمیر سەباح', 'بەسام شاکر'),
    },
  },
  {
    id: 'iraq-stars-102',
    leagueId: 'iraq_stars',
    leagueName: 'خولی ئەستێرەکانی عێراق',
    homeTeam: {
      name: 'قوە جەوییە (Al-Quwa Al-Jawiya)',
      shortName: 'QWJ',
      logoColor: '#2563eb',
      logoText: 'QWJ',
    },
    awayTeam: {
      name: 'یانەی زەورا (Al-Zawraa)',
      shortName: 'ZWR',
      logoColor: '#f8fafc',
      logoText: 'ZWR',
    },
    status: 'upcoming',
    kickoffTime: '21:00',
    kickoffDate: getRelativeIsoDate(0, 21, 0),
    venue: 'یاریگای نێودەوڵەتی شەعب - بەغدا',
    lineups: {
      home: Array.of('محەمەد حەمید', 'ئیبراهیم بایش', 'سەعد عەبدولئەمیر', 'حەمادی ئەحمەد', 'شەریف عەبدولکازم', 'عەلی جاسم', 'مستەفا سەعدون', 'ڕەسلان حەنون', 'حەسەن رائید', 'ئەیمەن حوسێن', 'موهەنەد عەبدولڕەحیم'),
      away: Array.of('جەلال حەسەن', 'عەلی فایز', 'مەیسەم جەبار', 'حوسێن فەلاح', 'مورتەزا هەدیب', 'لۆی عانی', 'حەسەن عەبدولکەریم', 'کەرار نەبیل', 'مراد محەمەد', 'ئەحمەد فەرحان', 'عەلا عەباس'),
    },
  },
  {
    id: 'iraq-stars-103',
    leagueId: 'iraq_stars',
    leagueName: 'خولی ئەستێرەکانی عێراق',
    homeTeam: {
      name: 'یانەی زاخۆ (Zakho SC)',
      shortName: 'ZAK',
      logoColor: '#dc2626',
      logoText: 'ZAK',
    },
    awayTeam: {
      name: 'یانەی دهۆک (Duhok SC)',
      shortName: 'DUH',
      logoColor: '#facc15',
      logoText: 'DUH',
    },
    status: 'upcoming',
    kickoffTime: '19:30',
    kickoffDate: getRelativeIsoDate(1, 19, 30),
    venue: 'یاریگای نێودەوڵەتی زاخۆ',
    lineups: {
      home: Array.of('عەلی کازم', 'ئەمجەد وەلید', 'محەمەد عەلی عەبود', 'زێدان عەبدولجەبار', 'ئەحمەد ئیبراهیم', 'یوسف ئالۆسی', 'ناسر محەمەدۆ', 'فەرحان شکور', 'هێمن فەرەج', 'سەردار محەمەد', 'ئەحمەد زێرۆ'),
      away: Array.of('محەمەد ساڵح', 'سیابەند عەگید', 'هێران ئازاد', 'پەشەنگ عەبدوڵڵا', 'زیاد ئەحمەد', 'هارون ئەحمەد', 'یانیس حەمەد', 'ئەمیر ئیسماعیل', 'مەسعود تەها', 'شڤان جەمیل', 'دڵشاد حەمەد'),
    },
  },
  {
    id: 'iraq-stars-104',
    leagueId: 'iraq_stars',
    leagueName: 'خولی ئەستێرەکانی عێراق',
    homeTeam: {
      name: 'یانەی نەورۆز (Newroz SC)',
      shortName: 'NEW',
      logoColor: '#ea580c',
      logoText: 'NEW',
    },
    awayTeam: {
      name: 'یانەی تەڵەبە (Al-Talaba)',
      shortName: 'TAL',
      logoColor: '#0284c7',
      logoText: 'TAL',
    },
    status: 'finished',
    kickoffTime: '16:00',
    kickoffDate: getRelativeIsoDate(-1, 16, 0),
    homeScore: 2,
    awayScore: 1,
    venue: 'یاریگای نەورۆز - سلێمانی',
    goals: [
      { name: 'ئاسۆ ڕۆستەم', minute: 18, team: 'home' },
      { name: 'وەکاع ڕەمەزان', minute: 44, team: 'away' },
      { name: 'مەروان حوسێن', minute: 79, team: 'home' },
    ],
    stats: {
      possession: Array.of(58, 42),
      shots: Array.of(15, 7),
      shotsOnTarget: Array.of(7, 3),
      corners: Array.of(8, 2),
      fouls: Array.of(9, 13),
      yellowCards: Array.of(1, 2),
      redCards: Array.of(0, 0),
      offsides: Array.of(3, 1),
    },
  },
];

export const allFallbackMatches: Match[] = Array.of(...iraqiFallbackMatches);
