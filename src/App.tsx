import { useState, useMemo, useEffect, useCallback } from 'react';
import { type Match, type LeagueId } from '@/data/matches';
import { fetchMatches } from '@/data/api';
import { getStreamData, recordSiteVisit } from '@/data/streamUrls';
import Header from '@/components/Header';
import FilterTabs, { type FilterTab } from '@/components/FilterTabs';
import LeagueFilterBar from '@/components/LeagueFilterBar';
import MatchList from '@/components/MatchList';
import MatchDetails from '@/components/MatchDetails';
import AdminPanel from '@/components/AdminPanel';
import { Loader2, AlertCircle, RefreshCw, Tv } from 'lucide-react';

export default function App() {
  const path = window.location.pathname;
  if (path === '/admin') {
    return <AdminPanel />;
  }
  return <MainApp />;
}

type Page = 'home' | 'leagues' | 'live';

function MainApp() {
  const [page, setPage] = useState<Page>('home');
  useEffect(() => {
    recordSiteVisit();
  }, []);

  const [filterTab, setFilterTab] = useState<FilterTab>('today');
  const [leagueFilter, setLeagueFilter] = useState<LeagueId | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [beinNewsUrl, setBeinNewsUrl] = useState<string>(
    'https://youtube.com'
  );

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

  const handleNavigate = (target: Page) => {
    setPage(target);
    setSelectedMatch(null);
    if (target === 'live') {
      setFilterTab('live');
    } else if (target === 'home') {
      setFilterTab('today');
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
    const today = matches.length;
    const live = matches.filter((m) => m.status === 'live').length;
    const upcoming = matches.filter((m) => m.status === 'upcoming').length;
    const finished = matches.filter((m) => m.status === 'finished').length;
    return { today, live, upcoming, finished };
  }, [matches]);

  if (selectedMatch) {
    return (
      <div className="min-h-screen bg-bg-900">
        <Header
          onNavigate={handleNavigate}
          onSearch={setSearchQuery}
          searchQuery={searchQuery}
        />
        <MatchDetails match={selectedMatch} onBack={handleBack} />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-900">
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
              'radial-gradient(circle at 20% 50%, #10b981 0%, transparent 50%), radial-gradient(circle at 80% 50%, #ef4444 0%, transparent 50%)',
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
            ئەنجامی ڕاستەوخۆ و پەخشی فەرمی
          </h1>
          <p className="text-slatey-400 text-sm sm:text-base">
            هەموو یارییەکان لە یەک شوێندا — خولە جیاوازەکان، ئامار، و پێکهاتە
          </p>
          {usingFallback && !loading && (
            <div className="mt-3 flex items-center gap-2 text-xs text-warning-400 bg-warning-500/10 rounded-lg px-3 py-2 inline-flex">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>داتای ڕاستەقینە بەردەست نییە — پیشاندانی داتای نموونە</span>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 24/7 beIN SPORTS NEWS Live Box */}
        <div className="glass-card overflow-hidden mb-6 border border-white/10">
          <div className="flex items-center justify-between px-4 py-3 bg-bg-800/80 border-b border-white/5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-live-500 animate-pulse" />
              <Tv className="w-4 h-4 text-accent-400" />
              <span className="text-sm font-bold text-white" dir="ltr">
                پەخشی تایبەت و ڕاستەوخۆ
              </span>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-live-500/15 text-live-400">
              24/7 LIVE
            </span>
          </div>
          <div className="relative w-full aspect-video max-h-[460px] bg-black">
            <iframe
              src={beinNewsUrl}
              title="beIN SPORTS NEWS Live"
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>

        {/* Filter tabs */}
        <FilterTabs
          active={filterTab}
          onChange={setFilterTab}
          counts={counts}
        />

        {/* League filter */}
        <div className="mt-4">
          <LeagueFilterBar active={leagueFilter} onChange={setLeagueFilter} />
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
      </main>

      <Footer />
    </div>
  );
}

function Footer() {
  return (
    <footer className="mt-12 border-t border-white/5 bg-bg-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">DB</span>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-white font-bold text-sm">Derby</span>
              <span className="text-accent-400 text-[10px]">derby-live</span>
            </div>
          </div>
          <p className="text-xs text-slatey-500 text-center">
            © ٢٠٢٦ Derby — ئەنجامی ڕاستەوخۆ و پەخشی وەرزشی
          </p>
        </div>
      </div>
    </footer>
  );
}
