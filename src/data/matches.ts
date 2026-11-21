export type LeagueId =
  | 'iraq_stars'
  | 'premier_league'
  | 'la_liga'
  | 'champions_league'
  | 'serie_a'
  | 'international';

export const leagues: { id: LeagueId | 'all'; name: string; nameKu: string }[] = Array.of(
  { id: 'all', name: 'All', nameKu: 'هەموو' },
  { id: 'iraq_stars', name: 'Iraq Stars League', nameKu: 'خولی عێراق' },
  { id: 'premier_league', name: 'Premier League', nameKu: 'پریمەرلیگ' },
  { id: 'la_liga', name: 'La Liga', nameKu: 'لالیگا' },
  { id: 'champions_league', name: 'Champions League', nameKu: 'چامپیۆنزلیگ' },
  { id: 'serie_a', name: 'Serie A', nameKu: 'سێریا ئەی' },
  { id: 'international', name: 'International', nameKu: 'نێودەوڵەتی' }
);

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

export const iraqiFallbackMatches: Match[] = Array.of(
  {
    id: 'iraq-stars-101',
    leagueId: 'iraq_stars',
    leagueName: 'خولی ئەستێرەکانی عێراق',
    homeTeam: {
      name: 'یانەی هەولێر',
      shortName: 'ERB',
      logoColor: '#eab308',
      logoText: 'ERB',
      crest: 'https://football-logos.cc',
    },
    awayTeam: {
      name: 'یانەی شورتە',
      shortName: 'SHO',
      logoColor: '#16a34a',
      logoText: 'SHO',
      crest: 'https://football-logos.cc',
    },
    status: 'upcoming',
    kickoffTime: '19:30',
    kickoffDate: getRelativeIsoDate(1, 19, 30),
    venue: 'یاریگای شەهید فەڕەنسۆ هەریری - هەولێر',
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
      name: 'یانەی زاخۆ',
      shortName: 'ZAK',
      logoColor: '#dc2626',
      logoText: 'ZAK',
      crest: 'https://football-logos.cc',
    },
    awayTeam: {
      name: 'یانەی دهۆک',
      shortName: 'DUH',
      logoColor: '#facc15',
      logoText: 'DUH',
      crest: 'https://football-logos.cc',
    },
    status: 'upcoming',
    kickoffTime: '20:00',
    kickoffDate: getRelativeIsoDate(1, 20, 0),
    venue: 'یاریگای نێودەوڵەتی زاخۆ',
    lineups: {
      home: Array.of('عەلی کازم', 'ئەمجەد وەلید', 'محەمەد عەلی عەبود', 'زێدان عەبدولجەبار', 'ئەحمەد ئیبراهیم', 'یوسف ئالۆسی', 'ناسر محەمەدۆ', 'فەرحان شکور', 'هێمن فەرەج', 'سەردار محەمەد', 'ئەحمەد زێرۆ'),
      away: Array.of('محەمەد ساڵح', 'سیابەند عەگید', 'هێران ئازاد', 'پەشەنگ عەبدوڵڵا', 'زیاد ئەحمەد', 'هارون ئەحمەد', 'یانیس حەمەد', 'ئەمیر ئیسماعیل', 'مەسعود تەها', 'شڤان جەمیل', 'دڵشاد حەمەد'),
    },
  },
  {
    id: 'iraq-stars-103',
    leagueId: 'iraq_stars',
    leagueName: 'خولی ئەستێرەکانی عێراق',
    homeTeam: {
      name: 'قوە جەوییە',
      shortName: 'QWJ',
      logoColor: '#2563eb',
      logoText: 'QWJ',
      crest: 'https://football-logos.cc',
    },
    awayTeam: {
      name: 'یانەی زەورا',
      shortName: 'ZWR',
      logoColor: '#f8fafc',
      logoText: 'ZWR',
      crest: 'https://football-logos.cc',
    },
    status: 'upcoming',
    kickoffTime: '21:30',
    kickoffDate: getRelativeIsoDate(2, 21, 30),
    venue: 'یاریگای نێودەوڵەتی شەعب - بەغدا',
    lineups: {
      home: Array.of('محەمەد حەمید', 'ئیبراهیم بایش', 'سەعد عەبدولئەمیر', 'حەمادی ئەحمەد', 'شەریف عەبدولکازم', 'عەلی جاسم', 'مستەفا سەعدون', 'ڕەسلان حەنون', 'حەسەن رائید', 'ئەیمەن حوسێن', 'موهەنەد عەبدولڕەحیم'),
      away: Array.of('جەلال حەسەن', 'عەلی فایز', 'مەیسەم جەبار', 'حوسێن فەلاح', 'مورتەزا هەدیب', 'لۆی عانی', 'حەسەن عەبدولکەریم', 'کەرار نەبیل', 'مراد محەمەد', 'ئەحمەد فەرحان', 'عەلا عەباس'),
    },
  },
  {
    id: 'iraq-stars-104',
    leagueId: 'iraq_stars',
    leagueName: 'خولی ئەستێرەکانی عێراق',
    homeTeam: {
      name: 'یانەی نەورۆز',
      shortName: 'NEW',
      logoColor: '#ea580c',
      logoText: 'NEW',
      crest: 'https://football-logos.cc',
    },
    awayTeam: {
      name: 'یانەی تەڵەبە',
      shortName: 'TAL',
      logoColor: '#0284c7',
      logoText: 'TAL',
      crest: 'https://football-logos.cc',
    },
    status: 'upcoming',
    kickoffTime: '17:00',
    kickoffDate: getRelativeIsoDate(2, 17, 0),
    venue: 'یاریگای نەورۆز - سلێمانی',
  }
);

export const allFallbackMatches: Match[] = Array.of(...iraqiFallbackMatches);
