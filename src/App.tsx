import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { type Match, type LeagueFilter, isTodayInBaghdad } from '@/data/matches';
import { fetchMatches } from '@/data/api';
import { getStreamData, recordSiteVisit, type StreamLink } from '@/data/streamUrls';
import Header from '@/components/Header';
import FilterTabs, { type FilterTab } from '@/components/FilterTabs';
import LeagueFilterBar from '@/components/LeagueFilterBar';
import MatchList from '@/components/MatchList';
import ResultsTicker from '@/components/ResultsTicker';
import MatchDetails from '@/components/MatchDetails';
import AdminPanel from '@/components/AdminPanel';
import FeaturedStream from '@/components/FeaturedStream';
import {
  leaguePageById,
  leaguePageByPath,
  applyHead,
  type LeaguePage,
} from '@/data/leaguePages';
import InfoPage, { SiteFooter, type InfoPageId } from '@/components/InfoPages';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

const INFO_ROUTES: Record<string, InfoPageId> = {
  '/about': 'about',
  '/privacy': 'privacy',
  '/contact': 'contact',
};

export default function App() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  const hash = window.location.hash;
  const search = window.location.search;
  if (path === '/admin' || hash === '#admin' || search.includes('admin')) {
    return <AdminPanel />;
  }
  const infoPage = INFO_ROUTES[path];
  if (infoPage) {
    return <InfoPage page={infoPage} />;
  }
  return <MainApp leaguePage={leaguePageByPath(path)} />;
}

type Page = 'home' | 'leagues' | 'live';

function MainApp({ leaguePage }: { leaguePage?: LeaguePage }) {
  const [page, setPage] = useState<Page>('home');
  useEffect(() => {
    recordSiteVisit();
  }, []);

  const [filterTab, setFilterTab] = useState<FilterTab>('today');
  const [leagueFilter, setLeagueFilter] = useState<LeagueFilter>(leaguePage?.id ?? 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMatch, setSelectedMatch] = useState<(Match & { streams?: StreamLink[]; affiliates?: StreamLink[] }) | null>(null);

  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [beinNewsUrl, setBeinNewsUrl] = useState<string | null>(null);

  // ---- Goal toast (silent) ----
  const [goalToast, setGoalToast] = useState<{ team: string; line: string } | null>(null);
  const prevScores = useRef<Map<string, { h: number; a: number }>>(new Map());
  const toastTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    const prev = prevScores.current;
    const next = new Map<string, { h: number; a: number }>();
    const goals: { team: string; line: string }[] = [];

    for (const m of matches) {
      const h = Number(m.homeScore) || 0;
      const aw = Number(m.awayScore) || 0;
      next.set(m.id, { h, a: aw });
      if (m.status !== 'live') continue;
      const p = prev.get(m.id);
      if (!p) continue; // first time we see this match: not a new goal
      const line = `${m.homeTeam.name} ${h} - ${aw} ${m.awayTeam.name}`;
      if (h > p.h) goals.push({ team: m.homeTeam.name, line });
      if (aw > p.a) goals.push({ team: m.awayTeam.name, line });
    }

    const firstLoad = prev.size === 0;
    prevScores.current = next;
    if (firstLoad || goals.length === 0) return;

    setGoalToast(goals[0]);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setGoalToast(null), 7000);
  }, [matches]);

  useEffect(() => {
    getStreamData('__BEIN_NEWS__')
      .then((data) => {
        if (data?.stream_url) {
          setBeinNewsUrl(data.stream_url);
        }
      })
      .catch(() => {});
  }, []);

  const loadMatches = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    const result = await fetchMatches();
    setMatches(result.matches);
    setUsingFallback(result.usingFallback);
    if (result.error) {
      setErrorMsg(result.error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  useEffect(() => {
    const interval = setInterval(() => {
      loadMatches();
    }, 60000);
    return () => clearInterval(interval);
  }, [loadMatches]);

  // Switching league also changes the URL (/premier-league ...) and the page title,
  // so every league has its own address that search engines can index.
  const handleLeagueChange = (id: LeagueFilter) => {
    setLeagueFilter(id);
    setSelectedMatch(null);
    const page = leaguePageById(id);
    const target = page ? `/${page.slug}` : '/';
    if (window.location.pathname.replace(/\/+$/, '') !== target.replace(/\/+$/, '')) {
      window.history.pushState({}, '', target);
    }
    applyHead(page);
  };

  useEffect(() => {
    applyHead(leaguePage);
    const onPop = () => {
      const p = leaguePageByPath(window.location.pathname);
      setLeagueFilter(p ? p.id : 'all');
      setSelectedMatch(null);
      applyHead(p);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [leaguePage]);

  const handleNavigate = (target: Page) => {
    setPage(target);
    setSelectedMatch(null);
    if (target === 'live') {
      setFilterTab('live');
    } else if (target === 'home') {
      setFilterTab('today');
      handleLeagueChange('all');
    }
  };

  const handleMatchClick = async (match: Match) => {
    setSelectedMatch(match);
    try {
      const data = await getStreamData(match.id);
      if (data) {
        setSelectedMatch((prev) =>
          prev && prev.id === match.id
            ? {
                ...prev,
                streamUrl: data.stream_url || undefined,
                affiliateUrl: data.affiliate_url || undefined,
                platformName: data.platform_name || undefined,
                clickCount: data.click_count,
                streams: data.streams,
                affiliates: data.affiliates,
              }
            : prev
        );
      }
    } catch (err) {
      console.error('Failed to load stream data:', err);
    }
  };

  const handleBack = () => {
    setSelectedMatch(null);
  };

  const counts = useMemo(() => {
    const now = new Date();
    const today = matches.filter((m) => isTodayInBaghdad(m.kickoffDate, now)).length;
    const live = matches.filter((m) => m.status === 'live').length;
    const upcoming = matches.filter((m) => m.status === 'upcoming').length;
    const finished = matches.filter((m) => m.status === 'finished').length;
    return { today, live, upcoming, finished };
  }, [matches]);

  const currentPage = leaguePageById(leagueFilter);

  if (selectedMatch) {
    return (
      <div className="min-h-screen bg-bg-900">
      {goalToast && (
        <div
          className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] w-[92%] max-w-md animate-fade-in"
          role="status"
        >
          <div className="glass-card border-accent-500/40 px-4 py-3 flex items-center gap-3 shadow-2xl accent-glow">
            <span className="text-2xl">⚽</span>
            <div className="min-w-0">
              <p className="text-accent-400 font-bold text-sm">گۆڵ! {goalToast.team}</p>
              <p className="text-white text-sm truncate" dir="ltr">
                {goalToast.line}
              </p>
            </div>
            <button
              onClick={() => setGoalToast(null)}
              className="ms-auto text-slatey-400 hover:text-white text-xs shrink-0"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>
      )}

        <Header
          onNavigate={handleNavigate}
          onSearch={setSearchQuery}
          searchQuery={searchQuery}
        />
        <MatchDetails match={selectedMatch} onBack={handleBack} />
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-900">
      {goalToast && (
        <div
          className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] w-[92%] max-w-md animate-fade-in"
          role="status"
        >
          <div className="glass-card border-accent-500/40 px-4 py-3 flex items-center gap-3 shadow-2xl accent-glow">
            <span className="text-2xl">⚽</span>
            <div className="min-w-0">
              <p className="text-accent-400 font-bold text-sm">گۆڵ! {goalToast.team}</p>
              <p className="text-white text-sm truncate" dir="ltr">
                {goalToast.line}
              </p>
            </div>
            <button
              onClick={() => setGoalToast(null)}
              className="ms-auto text-slatey-400 hover:text-white text-xs shrink-0"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <Header
        onNavigate={handleNavigate}
        onSearch={setSearchQuery}
        searchQuery={searchQuery}
      />

      {/* Hero banner */}
      <div className="relative overflow-hidden bg-gradient-to-l from-bg-800 via-bg-800 to-bg-700 border-b border-white/5">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 50%, #C6F432 0%, transparent 50%), radial-gradient(circle at 80% 50%, #ef4444 0%, transparent 50%)',
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-live-500 animate-pulse-dot" />
            <span className="text-sm font-bold text-live-400">
              {loading ? 'چاوەڕێی بکە...' : `${counts.live} یاری ڕاستەوخۆ لە ئێستادا`}
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2">
            {currentPage ? currentPage.h1 : 'یاری ڕاستەوخۆ و ئەنجامی یارییەکان'}
          </h1>
          <p className="text-slatey-400 text-sm sm:text-base">
            {currentPage
              ? 'یارییەکانی ئەمڕۆ و سبەی، ئەنجامی ڕاستەوخۆ، و پەخشی فەرمی'
              : 'هەموو یارییەکان لە یەک شوێندا — خولە جیاوازەکان، ئامار، و پێکهاتە'}
          </p>
          {usingFallback && !loading && (
            <div className="mt-3 flex items-center gap-2 text-xs text-warning-400 bg-warning-500/10 rounded-lg px-3 py-2 inline-flex">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>داتای ڕاستەقینە بەردەست نییە — پیشاندانی داتای نموونە</span>
            </div>
          )}
        </div>
      </div>

      {/* Live scores & results ticker */}
      <ResultsTicker matches={matches} onMatchClick={handleMatchClick} />

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 24/7 featured stream (loads after the visitor taps play) */}
        <FeaturedStream url={beinNewsUrl} />

        {/* Filter tabs */}
        <FilterTabs
          active={filterTab}
          onChange={setFilterTab}
          counts={counts}
        />

        {/* League filter */}
        <div className="mt-4">
          <LeagueFilterBar active={leagueFilter} onChange={handleLeagueChange} />
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 text-accent-400 animate-spin" />
            <p className="text-slatey-400 text-sm">دەرهێنانی یارییەکان...</p>
          </div>
        ) : (
          <>
            {errorMsg && (
              <div className="mt-4 flex items-center justify-between gap-3 glass-card p-3">
                <div className="flex items-center gap-2 text-xs text-slatey-400">
                  <AlertCircle className="w-4 h-4 text-warning-400 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
                <button
                  onClick={loadMatches}
                  className="flex items-center gap-1.5 text-xs text-accent-400 hover:text-accent-300 font-medium shrink-0"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  هەوڵدانەوە
                </button>
              </div>
            )}
            <div className="mt-6">
              <MatchList
                filterTab={filterTab}
                leagueFilter={leagueFilter}
                searchQuery={searchQuery}
                onMatchClick={handleMatchClick}
                matches={matches}
              />
            </div>
          </>
        )}

        {currentPage && (
          <section className="glass-card p-5 sm:p-6 mt-10">
            <h2 className="text-lg font-bold text-white mb-2">{currentPage.h1}: ئەنجام و یارییەکان</h2>
            <p className="text-sm leading-7 text-slatey-300">{currentPage.intro}</p>
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                handleLeagueChange('all');
              }}
              className="inline-block mt-3 text-sm text-accent-400 hover:text-accent-300 underline"
            >
              بینینی هەموو یارییەکان
            </a>
          </section>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
