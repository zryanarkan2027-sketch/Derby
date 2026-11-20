export type MatchStatus = 'live' | 'upcoming' | 'finished';

export type LeagueId =
  | 'all'
  | 'premier_league'
  | 'la_liga'
  | 'champions_league'
  | 'serie_a'
  | 'international'
  | 'iraqi_stars';

export interface Team {
  name: string;
  shortName: string;
  logoColor: string;
  logoText: string;
  crest?: string;
}

export interface MatchStats {
  possession: [number, number];
  shots: [number, number];
  shotsOnTarget: [number, number];
  corners: [number, number];
  fouls: [number, number];
  yellowCards: [number, number];
  redCards: [number, number];
  offsides: [number, number];
}

export interface MatchInfo {
  stadium: string;
  referee: string;
  channel: string;
  attendance: string;
  weather: string;
}

export interface LineupPlayer {
  number: number;
  name: string;
  position: string;
}

export interface Lineup {
  formation: string;
  players: LineupPlayer[];
}

export interface GoalScorer {
  name: string;
  minute: number;
  team: 'home' | 'away';
  penalty?: boolean;
}

export interface Match {
  id: string;
  leagueId: LeagueId;
  leagueName: string;
  homeTeam: Team;
  awayTeam: Team;
  status: MatchStatus;
  kickoffTime: string;
  liveMinute?: number;
  homeScore?: number;
  awayScore?: number;
  streamUrl?: string;
  affiliateUrl?: string;
  platformName?: string;
  clickCount?: number;
  kickoffDate?: string;
  venue?: string;
  referee?: string;
  goals?: GoalScorer[];
  stats?: MatchStats;
  info?: MatchInfo;
  homeLineup?: Lineup;
  awayLineup?: Lineup;
}

export interface League {
  id: LeagueId;
  name: string;
  icon: string;
}

export const leagues: League[] = [
  { id: 'all', name: 'هەمووان', icon: '⚽' },
  { id: 'premier_league', name: 'Premier League', icon: '🦁' },
  { id: 'la_liga', name: 'La Liga', icon: '🇪🇸' },
  { id: 'champions_league', name: 'Champions League', icon: '🏆' },
  { id: 'serie_a', name: 'Serie A', icon: '🇮🇹' },
  { id: 'international', name: 'نێودەوڵەتی', icon: '🌍' },
  { id: 'iraqi_stars', name: 'خولی ئەستێرەکانی عێراق', icon: '🇮🇶' },
];

export const mockMatches: Match[] = [
  {
    id: 'm1',
    leagueId: 'la_liga',
    leagueName: 'La Liga',
    homeTeam: {
      name: 'ڕیال مەدرید',
      shortName: 'RMA',
      logoColor: '#ffffff',
      logoText: 'RM',
    },
    awayTeam: {
      name: 'بارسێلۆنا',
      shortName: 'BAR',
      logoColor: '#a50044',
      logoText: 'FCB',
    },
    status: 'live',
    kickoffTime: '22:00',
    liveMinute: 67,
    homeScore: 2,
    awayScore: 1,
    streamUrl: 'https://www.youtube.com/embed/fqjAAGR1YmY',
    goals: [
      { name: 'ڤینیسیۆس جونیۆر', minute: 12, team: 'home' },
      { name: 'ڕۆبەرت لێڤاندۆڤسکی', minute: 34, team: 'away' },
      { name: 'جود بێلینگهام', minute: 58, team: 'home' },
    ],
    stats: {
      possession: [58, 42],
      shots: [14, 9],
      shotsOnTarget: [6, 3],
      corners: [7, 4],
      fouls: [8, 11],
      yellowCards: [2, 3],
      redCards: [0, 0],
      offsides: [2, 1],
    },
    info: {
      stadium: 'سانتیاگۆ بێرنابێو',
      referee: 'ئەنتۆنیۆ ماتیۆ لاهۆز',
      channel: 'beIN Sports 1',
      attendance: '٨١٬٠٤٤',
      weather: '١٨°C - بەرزی ڕوون',
    },
    homeLineup: {
      formation: '4-3-3',
      players: [
        { number: 1, name: 'کۆرتوا', position: 'گۆڵپارێز' },
        { number: 2, name: 'کارڤاژال', position: 'بەرگری ڕاست' },
        { number: 3, name: 'میلیتاو', position: 'بەرگری ناوەڕاست' },
        { number: 6, name: 'ناچۆ', position: 'بەرگری ناوەڕاست' },
        { number: 23, name: 'مێندی', position: 'بەرگری چەپ' },
        { number: 15, name: 'فێدێریکۆ ڤاڵڤێردێ', position: 'ناوەڕاست' },
        { number: 8, name: 'تۆنی کرۆس', position: 'ناوەڕاست' },
        { number: 5, name: 'جود بێلینگهام', position: 'ناوەڕاست' },
        { number: 7, name: 'ڤینیسیۆس جونیۆر', position: 'هێرشبەر' },
        { number: 9, name: 'جۆسیلۆ', position: 'هێرشبەر' },
        { number: 11, name: 'ڕۆدریگۆ', position: 'هێرشبەر' },
      ],
    },
    awayLineup: {
      formation: '4-3-3',
      players: [
        { number: 1, name: 'تێر شتێگن', position: 'گۆڵپارێز' },
        { number: 4, name: 'ئاراوخۆ', position: 'بەرگری ڕاست' },
        { number: 5, name: 'کوبارسی', position: 'بەرگری ناوەڕاست' },
        { number: 14, name: 'کریستێنسن', position: 'بەرگری ناوەڕاست' },
        { number: 3, name: 'بالێدێ', position: 'بەرگری چەپ' },
        { number: 21, name: 'دێ یۆنگ', position: 'ناوەڕاست' },
        { number: 8, name: 'پێدری', position: 'ناوەڕاست' },
        { number: 22, name: 'گاڤی', position: 'ناوەڕاست' },
        { number: 10, name: 'لەمینە یاماڵ', position: 'هێرشبەر' },
        { number: 9, name: 'ڕۆبەرت لێڤاندۆڤسکی', position: 'هێرشبەر' },
        { number: 11, name: 'ڕافینیا', position: 'هێرشبەر' },
      ],
    },
  },
  {
    id: 'm2',
    leagueId: 'premier_league',
    leagueName: 'Premier League',
    homeTeam: {
      name: 'ئارسناڵ',
      shortName: 'ARS',
      logoColor: '#ef0107',
      logoText: 'AFC',
    },
    awayTeam: {
      name: 'لیڤەرپوول',
      shortName: 'LIV',
      logoColor: '#c8102e',
      logoText: 'LFC',
    },
    status: 'live',
    kickoffTime: '20:30',
    liveMinute: 34,
    homeScore: 1,
    awayScore: 1,
    streamUrl: 'https://www.youtube.com/embed/fqjAAGR1YmY',
    goals: [
      { name: 'بوکایۆ ساکا', minute: 18, team: 'home' },
      { name: 'محمد سەلاح', minute: 27, team: 'away' },
    ],
    stats: {
      possession: [52, 48],
      shots: [8, 6],
      shotsOnTarget: [3, 2],
      corners: [4, 3],
      fouls: [5, 7],
      yellowCards: [1, 1],
      redCards: [0, 0],
      offsides: [1, 0],
    },
    info: {
      stadium: 'ئیمارات ستادیۆم',
      referee: 'مایکڵ ئۆلیڤەر',
      channel: 'beIN Sports 2',
      attendance: '٦٠٬٢٧٠',
      weather: '١٢°C - ئاسایی',
    },
    homeLineup: {
      formation: '4-3-3',
      players: [
        { number: 1, name: 'ڕایا', position: 'گۆڵپارێز' },
        { number: 4, name: 'وایتی', position: 'بەرگری ڕاست' },
        { number: 6, name: 'گابریێل مەگالیس', position: 'بەرگری ناوەڕاست' },
        { number: 2, name: 'سەلیبا', position: 'بەرگیری ناوەڕاست' },
        { number: 12, name: 'زینچێنکۆ', position: 'بەرگری چەپ' },
        { number: 41, name: 'ڕایس', position: 'ناوەڕاست' },
        { number: 29, name: 'هاڤێرتز', position: 'ناوەڕاست' },
        { number: 8, name: 'ئۆدێگارد', position: 'ناوەڕاست' },
        { number: 7, name: 'ساکا', position: 'هێرشبەر' },
        { number: 9, name: 'گابریێل جێزۆس', position: 'هێرشبەر' },
        { number: 11, name: 'مارتنێلی', position: 'هێرشبەر' },
      ],
    },
    awayLineup: {
      formation: '4-3-3',
      players: [
        { number: 1, name: 'ئالیسۆن', position: 'گۆڵپارێز' },
        { number: 66, name: 'ئەلیکساندەر-ئارنۆلد', position: 'بەرگری ڕاست' },
        { number: 4, name: 'ڤان دایک', position: 'بەرگری ناوەڕاست' },
        { number: 5, name: 'کۆناتی', position: 'بەرگری ناوەڕاست' },
        { number: 26, name: 'ڕۆبەرتسۆن', position: 'بەرگری چەپ' },
        { number: 3, name: 'ڤاینالدۆم', position: 'ناوەڕاست' },
        { number: 14, name: 'ھێندێرسۆن', position: 'ناوەڕاست' },
        { number: 8, name: 'سۆبۆسلای', position: 'ناوەڕاست' },
        { number: 11, name: 'محمد سەلاح', position: 'هێرشبەر' },
        { number: 9, name: 'نونێز', position: 'هێرشبەر' },
        { number: 20, name: 'دیاز', position: 'هێرشبەر' },
      ],
    },
  },
  {
    id: 'm3',
    leagueId: 'iraqi_stars',
    leagueName: 'خولی ئەستێرەکانی عێراق',
    homeTeam: {
      name: 'ئەربیل SC',
      shortName: 'ERB',
      logoColor: '#1d4ed8',
      logoText: 'ERB',
    },
    awayTeam: {
      name: 'ئەلشۆرتە',
      shortName: 'SHO',
      logoColor: '#15803d',
      logoText: 'SHO',
    },
    status: 'live',
    kickoffTime: '19:00',
    liveMinute: 23,
    homeScore: 0,
    awayScore: 0,
    streamUrl: '',
    stats: {
      possession: [45, 55],
      shots: [3, 5],
      shotsOnTarget: [1, 2],
      corners: [1, 2],
      fouls: [4, 3],
      yellowCards: [0, 1],
      redCards: [0, 0],
      offsides: [0, 1],
    },
    info: {
      stadium: 'ئەربیل ئینتەرناسیۆناڵ ستادیۆم',
      referee: 'محمد سەعید',
      channel: 'کوردستان سپۆرت',
      attendance: '١٢٬٥٠٠',
      weather: '٢٢°C - ئاسایی',
    },
    homeLineup: {
      formation: '4-4-2',
      players: [
        { number: 1, name: 'هیوا', position: 'گۆڵپارێز' },
        { number: 2, name: 'ئەحمەد', position: 'بەرگری ڕاست' },
        { number: 4, name: 'کاروان', position: 'بەرگری ناوەڕاست' },
        { number: 5, name: 'شەروان', position: 'بەرگری ناوەڕاست' },
        { number: 3, name: 'ڕەسوڵ', position: 'بەرگری چەپ' },
        { number: 7, name: 'زانیار', position: 'ناوەڕاست ڕاست' },
        { number: 8, name: 'هاوار', position: 'ناوەڕاست' },
        { number: 10, name: 'بەختیار', position: 'ناوەڕاست' },
        { number: 11, name: 'ئاسۆ', position: 'ناوەڕاست چەپ' },
        { number: 9, name: 'مەزھەر', position: 'هێرشبەر' },
        { number: 17, name: 'ئاکام', position: 'هێرشبەر' },
      ],
    },
    awayLineup: {
      formation: '4-4-2',
      players: [
        { number: 1, name: 'موستەفا', position: 'گۆڵپارێز' },
        { number: 2, name: 'عەلی', position: 'بەرگری ڕاست' },
        { number: 4, name: 'حوسێن', position: 'بەرگری ناوەڕاست' },
        { number: 5, name: 'ئومێد', position: 'بەرگری ناوەڕاست' },
        { number: 3, name: 'سەرکەر', position: 'بەرگیری چەپ' },
        { number: 7, name: 'زان', position: 'ناوەڕاست ڕاست' },
        { number: 8, name: 'بەهایەدین', position: 'ناوەڕاست' },
        { number: 10, name: 'ئەیوب', position: 'ناوەڕاست' },
        { number: 11, name: 'ڕەنگین', position: 'ناوەڕاست چەپ' },
        { number: 9, name: 'ئەلان', position: 'هێرشبەر' },
        { number: 17, name: 'ماڕۆوان', position: 'هێرشبەر' },
      ],
    },
  },
  {
    id: 'm4',
    leagueId: 'premier_league',
    leagueName: 'Premier League',
    homeTeam: {
      name: 'مانچێستەر سیتی',
      shortName: 'MCI',
      logoColor: '#6cabdd',
      logoText: 'MCFC',
    },
    awayTeam: {
      name: 'چێڵسی',
      shortName: 'CHE',
      logoColor: '#034694',
      logoText: 'CFC',
    },
    status: 'upcoming',
    kickoffTime: '22:00',
    streamUrl: '',
    info: {
      stadium: 'ئیتihad ستادیۆم',
      referee: 'پۆڵ تیرنی',
      channel: 'beIN Sports 3',
      attendance: '—',
      weather: '١٤°C - ئاسایی',
    },
    homeLineup: {
      formation: '4-3-3',
      players: [
        { number: 31, name: 'ئێدێرسۆن', position: 'گۆڵپارێز' },
        { number: 2, name: 'واڵکەر', position: 'بەرگری ڕاست' },
        { number: 5, name: 'ستۆونز', position: 'بەرگیری ناوەڕاست' },
        { number: 3, name: 'ڕوبێن دیاز', position: 'بەرگیری ناوەڕاست' },
        { number: 6, name: 'ئاکی', position: 'بەرگری چەپ' },
        { number: 17, name: 'دێ بروینێ', position: 'ناوەڕاست' },
        { number: 16, name: 'ڕۆدری', position: 'ناوەڕاست' },
        { number: 20, name: 'بێرناردۆ سیلڤا', position: 'ناوەڕاست' },
        { number: 47, name: 'فۆدێن', position: 'هێرشبەر' },
        { number: 19, name: 'ئەلڤارێز', position: 'هێرشبەر' },
        { number: 11, name: 'درایز', position: 'هێرشبەر' },
      ],
    },
    awayLineup: {
      formation: '4-2-3-1',
      players: [
        { number: 1, name: 'سانچێز', position: 'گۆڵپارێز' },
        { number: 28, name: 'جاکسۆن', position: 'بەرگری ڕاست' },
        { number: 6, name: 'تێری', position: 'بەرگری ناوەڕاست' },
        { number: 14, name: 'ئادارابیۆیۆ', position: 'بەرگری ناوەڕاست' },
        { number: 3, name: 'کۆڵوێل', position: 'بەرگری چەپ' },
        { number: 8, name: 'فێرناندێز', position: 'ناوەڕاست' },
        { number: 25, name: 'کایسێدۆ', position: 'ناوەڕاست' },
        { number: 10, name: 'مادۆێک', position: 'هێرشبەر' },
        { number: 7, name: 'ستەرلینگ', position: 'هێرشبەر' },
        { number: 11, name: 'نیکۆلا جاکسۆن', position: 'هێرشبەر' },
        { number: 9, name: 'نیاستۆر', position: 'هێرشبەر' },
      ],
    },
  },
  {
    id: 'm5',
    leagueId: 'champions_league',
    leagueName: 'Champions League',
    homeTeam: {
      name: 'بایەرن میونشن',
      shortName: 'BAY',
      logoColor: '#dc052d',
      logoText: 'FCB',
    },
    awayTeam: {
      name: 'پاریس سان جێرمان',
      shortName: 'PSG',
      logoColor: '#004170',
      logoText: 'PSG',
    },
    status: 'upcoming',
    kickoffTime: '23:00',
    streamUrl: 'https://www.youtube.com/embed/fqjAAGR1YmY',
    info: {
      stadium: 'ئەلیانز ئارێنا',
      referee: 'دانیێلێ ئۆرساتۆ',
      channel: 'beIN Sports 1',
      attendance: '—',
      weather: '٨°C - سارد',
    },
  },
  {
    id: 'm6',
    leagueId: 'serie_a',
    leagueName: 'Serie A',
    homeTeam: {
      name: 'ئینتەر میلان',
      shortName: 'INT',
      logoColor: '#0068a8',
      logoText: 'INT',
    },
    awayTeam: {
      name: 'یوڤێنتوس',
      shortName: 'JUV',
      logoColor: '#000000',
      logoText: 'JUV',
    },
    status: 'finished',
    kickoffTime: '20:45',
    homeScore: 3,
    awayScore: 1,
    streamUrl: '',
    goals: [
      { name: 'لاوتارۆ مارتینێز', minute: 15, team: 'home' },
      { name: 'ڤلاهۆڤیچ', minute: 33, team: 'away' },
      { name: 'مارکۆس تورام', minute: 52, team: 'home' },
      { name: 'هەلکار', minute: 78, team: 'home' },
    ],
    stats: {
      possession: [55, 45],
      shots: [16, 10],
      shotsOnTarget: [7, 4],
      corners: [6, 5],
      fouls: [9, 12],
      yellowCards: [1, 2],
      redCards: [0, 0],
      offsides: [1, 2],
    },
    info: {
      stadium: 'سان سیرۆ',
      referee: 'دانیێلێ دۆڤێرسی',
      channel: 'beIN Sports 4',
      attendance: '٧٥٬٩٢٣',
      weather: '١٥°C - ئاسایی',
    },
  },
  {
    id: 'm7',
    leagueId: 'champions_league',
    leagueName: 'Champions League',
    homeTeam: {
      name: 'بۆرۆسیا دۆرتمۆند',
      shortName: 'DOR',
      logoColor: '#fde100',
      logoText: 'BVB',
    },
    awayTeam: {
      name: 'ئەتلەتیکۆ مەدرید',
      shortName: 'ATM',
      logoColor: '#cb3524',
      logoText: 'ATM',
    },
    status: 'finished',
    kickoffTime: '22:00',
    homeScore: 0,
    awayScore: 2,
    streamUrl: '',
    goals: [
      { name: 'گرێزمان', minute: 41, team: 'away' },
      { name: 'مۆڕاتا', minute: 67, team: 'away' },
    ],
    stats: {
      possession: [48, 52],
      shots: [11, 13],
      shotsOnTarget: [2, 5],
      corners: [5, 6],
      fouls: [10, 8],
      yellowCards: [3, 2],
      redCards: [0, 0],
      offsides: [2, 1],
    },
    info: {
      stadium: 'سیگناڵ ئیدونا پارک',
      referee: 'سلاڤکۆ چینچیچ',
      channel: 'beIN Sports 5',
      attendance: '٨١٬٣٦٥',
      weather: '١٠°C - ئاسایی',
    },
  },
  {
    id: 'm8',
    leagueId: 'la_liga',
    leagueName: 'La Liga',
    homeTeam: {
      name: 'ئەتلەتیک بیلباو',
      shortName: 'ATH',
      logoColor: '#ee2523',
      logoText: 'ATH',
    },
    awayTeam: {
      name: 'سێڤییا',
      shortName: 'SEV',
      logoColor: '#d8111d',
      logoText: 'SEV',
    },
    status: 'upcoming',
    kickoffTime: '21:00',
    streamUrl: '',
    info: {
      stadium: 'سان مامێس',
      referee: 'خێسۆس گیل مانزانۆ',
      channel: 'beIN Sports 6',
      attendance: '—',
      weather: '١٦°C - ئاسایی',
    },
  },
  {
    id: 'm9',
    leagueId: 'iraqi_stars',
    leagueName: 'خولی ئەستێرەکانی عێراق',
    homeTeam: {
      name: 'دهۆک SC',
      shortName: 'DHK',
      logoColor: '#059669',
      logoText: 'DHK',
    },
    awayTeam: {
      name: 'ئەلزەورا',
      shortName: 'ZAW',
      logoColor: '#7c3aed',
      logoText: 'ZAW',
    },
    status: 'finished',
    kickoffTime: '17:30',
    homeScore: 2,
    awayScore: 2,
    streamUrl: '',
    goals: [
      { name: 'ئەحمەد', minute: 22, team: 'home' },
      { name: 'عەلی', minute: 45, team: 'away' },
      { name: 'هیوا', minute: 61, team: 'home' },
      { name: 'حوسێن', minute: 88, team: 'away' },
    ],
    stats: {
      possession: [50, 50],
      shots: [12, 10],
      shotsOnTarget: [4, 4],
      corners: [4, 3],
      fouls: [7, 6],
      yellowCards: [2, 1],
      redCards: [0, 0],
      offsides: [1, 0],
    },
    info: {
      stadium: 'دهۆک ستادیۆم',
      referee: 'کەریم عەبدوڵڵا',
      channel: 'کوردستان سپۆرت',
      attendance: '٨٬٢٠٠',
      weather: '٢٤°C - ئاسایی',
    },
  },
  {
    id: 'm10',
    leagueId: 'serie_a',
    leagueName: 'Serie A',
    homeTeam: {
      name: 'ناپۆلی',
      shortName: 'NAP',
      logoColor: '#1999d8',
      logoText: 'NAP',
    },
    awayTeam: {
      name: 'ڕۆما',
      shortName: 'ROM',
      logoColor: '#8e1f2f',
      logoText: 'ROM',
    },
    status: 'upcoming',
    kickoffTime: '22:45',
    streamUrl: '',
    info: {
      stadium: 'دێگۆ ئارماندۆ مارادۆنا',
      referee: 'ماورۆ دێ لۆکا',
      channel: 'beIN Sports 4',
      attendance: '—',
      weather: '١٧°C - ئاسایی',
    },
  },
  {
    id: 'm11',
    leagueId: 'premier_league',
    leagueName: 'Premier League',
    homeTeam: {
      name: 'تۆتنهام',
      shortName: 'TOT',
      logoColor: '#132257',
      logoText: 'THFC',
    },
    awayTeam: {
      name: 'مانچێستەر یونایتد',
      shortName: 'MUN',
      logoColor: '#da291c',
      logoText: 'MUFC',
    },
    status: 'finished',
    kickoffTime: '18:30',
    homeScore: 2,
    awayScore: 0,
    streamUrl: '',
    goals: [
      { name: 'سۆن هیۆنگ-مین', minute: 29, team: 'home' },
      { name: 'مادیسۆن', minute: 73, team: 'home' },
    ],
    stats: {
      possession: [47, 53],
      shots: [13, 8],
      shotsOnTarget: [5, 2],
      corners: [5, 4],
      fouls: [6, 9],
      yellowCards: [1, 2],
      redCards: [0, 0],
      offsides: [2, 3],
    },
    info: {
      stadium: 'تۆتنهام هۆتسپێر ستادیۆم',
      referee: 'ئەنتۆنی تەیلۆر',
      channel: 'beIN Sports 2',
      attendance: '٦٢٬٨٥٠',
      weather: '١١°C - ئاسایی',
    },
  },
  {
    id: 'm12',
    leagueId: 'la_liga',
    leagueName: 'La Liga',
    homeTeam: {
      name: 'ڤالێنسیا',
      shortName: 'VAL',
      logoColor: '#ee3524',
      logoText: 'VCF',
    },
    awayTeam: {
      name: 'ڕیال سۆسیداد',
      shortName: 'RSO',
      logoColor: '#143c8b',
      logoText: 'RSO',
    },
    status: 'finished',
    kickoffTime: '16:00',
    homeScore: 1,
    awayScore: 1,
    streamUrl: '',
    goals: [
      { name: 'هۆسێ گایا', minute: 55, team: 'home' },
      { name: 'میکێلۆیارزاباڵ', minute: 82, team: 'away' },
    ],
    stats: {
      possession: [44, 56],
      shots: [9, 14],
      shotsOnTarget: [3, 5],
      corners: [3, 7],
      fouls: [11, 8],
      yellowCards: [3, 1],
      redCards: [0, 0],
      offsides: [1, 2],
    },
    info: {
      stadium: 'مێستایا',
      referee: 'خاوێر ئەستڕادا',
      channel: 'beIN Sports 6',
      attendance: '٤٥٬٠٠٠',
      weather: '١٨°C - ئاسایی',
    },
  },
];

export const iraqiFallbackMatches: Match[] = mockMatches.filter(
  (m) => m.leagueId === 'iraqi_stars'
);

export const allFallbackMatches: Match[] = mockMatches;
