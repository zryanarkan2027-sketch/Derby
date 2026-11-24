import { useState, useEffect, useCallback, useMemo } from 'react';
import { type Match, getBaghdadDateKey } from '@/data/matches';
import { fetchMatches } from '@/data/api';
import {
  getAllStreamData,
  setStreamData,
  convertToEmbedUrl,
  StreamError,
  type StreamData,
} from '@/data/streamUrls';
import { signIn, signOut, getAccessToken } from '@/data/adminAuth';
import Logo from '@/components/Logo';
import {
  Lock, Save, Search, Loader2, CheckCircle, ArrowRight,
  AlertCircle, MousePointerClick, Youtube, LogOut, Plus, Trash2, Link2,
} from 'lucide-react';

interface LinkRow {
  name: string;
  url: string;
}

interface EditState {
  streams: LinkRow[];
  affiliates: LinkRow[];
}

type ListKind = 'streams' | 'affiliates';
type DayTab = 'today' | 'tomorrow' | 'yesterday' | 'all';

const MAX_LINKS = 6;
const EMPTY_LINK: LinkRow = { name: '', url: '' };
const DAY_MS = 24 * 60 * 60 * 1000;

const DAY_TABS: { id: DayTab; label: string }[] = [
  { id: 'today', label: 'ئەمڕۆ' },
  { id: 'tomorrow', label: 'سبەی' },
  { id: 'yesterday', label: 'دوێنێ' },
  { id: 'all', label: 'هەموو' },
];

function safeDayKey(iso: string): string {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return getBaghdadDateKey(d);
  } catch {
    return '';
  }
}

export default function AdminPanel() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dayTab, setDayTab] = useState<DayTab>('today');
  const [leagueFilter, setLeagueFilter] = useState<string>('all');
  const [streamDataMap, setStreamDataMap] = useState<Record<string, StreamData>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editState, setEditState] = useState<EditState>({
    streams: [{ ...EMPTY_LINK }],
    affiliates: [{ ...EMPTY_LINK }],
  });
  const [savedId, setSavedId] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Restore an existing session on page load
  useEffect(() => {
    getAccessToken().then((token) => {
      if (token) setAuthenticated(true);
      setCheckingSession(false);
    });
  }, []);

  const loadMatches = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const result = await fetchMatches();
      setMatches(result.matches);
      const data = await getAllStreamData();
      setStreamDataMap(data);
    } catch (err) {
      setLoadError(
        err instanceof StreamError
          ? `Database Error (${err.status}): ${err.message}`
          : 'Failed to load links'
      );
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (authenticated) {
      loadMatches();
    }
  }, [authenticated, loadMatches]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError(null);
    try {
      await signIn(emailInput, passwordInput);
      setPasswordInput('');
      setAuthenticated(true);
    } catch {
      setLoginError('Invalid email or password');
      setPasswordInput('');
    }
    setLoggingIn(false);
  };

  const handleLogout = () => {
    signOut();
    setAuthenticated(false);
    setMatches([]);
    setStreamDataMap({});
  };

  // ---------- link editing ----------
  const updateRow = (kind: ListKind, index: number, field: keyof LinkRow, value: string) => {
    setEditState((s) => ({
      ...s,
      [kind]: s[kind].map((l, i) => (i === index ? { ...l, [field]: value } : l)),
    }));
  };

  const addRow = (kind: ListKind, max: number) => {
    setEditState((s) =>
      s[kind].length >= max ? s : { ...s, [kind]: [...s[kind], { ...EMPTY_LINK }] }
    );
  };

  const removeRow = (kind: ListKind, index: number) => {
    setEditState((s) => ({
      ...s,
      [kind]: s[kind].length <= 1 ? [{ ...EMPTY_LINK }] : s[kind].filter((_, i) => i !== index),
    }));
  };

  const startEdit = (matchId: string) => {
    const existing = streamDataMap[matchId];
    const streams: LinkRow[] =
      existing?.streams && existing.streams.length > 0
        ? existing.streams.map((s) => ({ name: s.name, url: s.url }))
        : [{ ...EMPTY_LINK }];
    const affiliates: LinkRow[] =
      existing?.affiliates && existing.affiliates.length > 0
        ? existing.affiliates.map((s) => ({ name: s.name, url: s.url }))
        : [{ ...EMPTY_LINK }];
    setEditingId(matchId);
    setEditState({ streams, affiliates });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditState({ streams: [{ ...EMPTY_LINK }], affiliates: [{ ...EMPTY_LINK }] });
  };

  const handleSave = async (matchId: string) => {
    setSaving(true);
    setSaveError(null);

    const isFeatured = matchId === '__BEIN_NEWS__';

    const streams = editState.streams
      .map((l) => ({ name: l.name.trim(), url: convertToEmbedUrl(l.url) }))
      .filter((l) => l.url.length > 0)
      .map((l, i) => ({ name: l.name || `لینکی ${i + 1}`, url: l.url }));

    const affiliates = isFeatured
      ? []
      : editState.affiliates
          .map((l) => ({ name: l.name.trim(), url: l.url.trim() }))
          .filter((l) => l.url.length > 0)
          .map((l) => ({ name: l.name || 'پلاتفۆرمی فەرمی', url: l.url }));

    if ([...streams, ...affiliates].some((l) => !/^https?:\/\//i.test(l.url))) {
      setSaveError('Every link must start with https://');
      setSaving(false);
      return;
    }

    try {
      await setStreamData(matchId, { streams, affiliates });
      setStreamDataMap((prev) => ({
        ...prev,
        [matchId]: {
          stream_url: streams[0]?.url ?? '',
          streams,
          affiliate_url: affiliates[0]?.url ?? '',
          platform_name: affiliates[0]?.name ?? '',
          affiliates,
          click_count: prev[matchId]?.click_count || 0,
        },
      }));
      setEditingId(null);
      setSavedId(matchId);
      setTimeout(() => setSavedId(null), 2000);
    } catch (err) {
      setSaveError(
        err instanceof StreamError
          ? `Save Error (${err.status}): ${err.message}`
          : 'Failed to save link'
      );
    }
    setSaving(false);
  };

  const goHome = () => {
    window.location.href = '/';
  };

  // ---------- statistics ----------
  const stats = useMemo(() => {
    const now = new Date();
    const key = (offsetDays: number) => getBaghdadDateKey(new Date(now.getTime() - offsetDays * DAY_MS));

    const visitorsByDay = new Map<string, number>();
    let linkClicks = 0;
    for (const [id, data] of Object.entries(streamDataMap)) {
      if (id.startsWith('__DAY_')) {
        visitorsByDay.set(id.slice(6, -2), data.click_count || 0);
      } else if (!id.startsWith('__')) {
        linkClicks += data.click_count || 0;
      }
    }

    const last7 = Array.from({ length: 7 }, (_, i) => {
      const k = key(6 - i);
      return { key: k, label: k.slice(5), n: visitorsByDay.get(k) || 0 };
    });

    let total = 0;
    visitorsByDay.forEach((n) => (total += n));

    return {
      today: visitorsByDay.get(key(0)) || 0,
      week: last7.reduce((sum, d) => sum + d.n, 0),
      total,
      last7,
      maxDay: Math.max(1, ...last7.map((d) => d.n)),
      linkClicks,
      featuredViews: streamDataMap['__BEIN_NEWS__']?.click_count || 0,
    };
  }, [streamDataMap]);

  // ---------- match list (day + league + search) ----------
  const dayKeys = useMemo(() => {
    const now = new Date();
    return {
      today: getBaghdadDateKey(now),
      tomorrow: getBaghdadDateKey(new Date(now.getTime() + DAY_MS)),
      yesterday: getBaghdadDateKey(new Date(now.getTime() - DAY_MS)),
    };
  }, []);

  const matchesForDay = useMemo(() => {
    const list = matches.filter((m) => {
      if (dayTab === 'all') return true;
      return safeDayKey(m.kickoffDate) === dayKeys[dayTab];
    });
    return list.sort((a, b) => a.kickoffDate.localeCompare(b.kickoffDate));
  }, [matches, dayTab, dayKeys]);

  const dayCounts = useMemo(() => {
    const counts: Record<DayTab, number> = { today: 0, tomorrow: 0, yesterday: 0, all: matches.length };
    for (const m of matches) {
      const k = safeDayKey(m.kickoffDate);
      if (k === dayKeys.today) counts.today++;
      else if (k === dayKeys.tomorrow) counts.tomorrow++;
      else if (k === dayKeys.yesterday) counts.yesterday++;
    }
    return counts;
  }, [matches, dayKeys]);

  const leagueChips = useMemo(() => {
    const map = new Map<string, number>();
    for (const m of matchesForDay) map.set(m.leagueName, (map.get(m.leagueName) || 0) + 1);
    return Array.from(map.entries());
  }, [matchesForDay]);

  const activeLeague = leagueChips.some(([name]) => name === leagueFilter) ? leagueFilter : 'all';

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return matchesForDay.filter((m) => {
      if (activeLeague !== 'all' && m.leagueName !== activeLeague) return false;
      if (!q) return true;
      return (
        m.homeTeam.name.toLowerCase().includes(q) ||
        m.awayTeam.name.toLowerCase().includes(q) ||
        m.leagueName.toLowerCase().includes(q)
      );
    });
  }, [matchesForDay, activeLeague, searchQuery]);

  // ---------- small UI helpers ----------
  const renderLinksEditor = (kind: ListKind, max: number, showNames: boolean) => (
    <div className="space-y-2">
      {editState[kind].map((link, i) => (
        <div key={i} className="flex items-center gap-2">
          {showNames && (
            <input
              type="text"
              value={link.name}
              onChange={(e) => updateRow(kind, i, 'name', e.target.value)}
              placeholder={kind === 'streams' ? `ناو (لینکی ${i + 1})` : 'ناو (DAZN, beIN...)'}
              className="w-28 sm:w-40 shrink-0 bg-bg-600 border border-white/5 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slatey-400"
            />
          )}
          <input
            type="text"
            value={link.url}
            onChange={(e) => updateRow(kind, i, 'url', e.target.value)}
            placeholder={kind === 'streams' ? 'https://youtube.com/...' : 'https://...'}
            className="flex-1 min-w-0 bg-bg-600 border border-white/5 rounded-lg px-4 py-2 text-sm text-white"
            dir="ltr"
          />
          {showNames && (
            <button
              type="button"
              onClick={() => removeRow(kind, i)}
              aria-label="Remove link"
              className="shrink-0 w-9 h-9 flex items-center justify-center rounded-lg bg-bg-600 hover:bg-live-500/20 text-slatey-300 hover:text-live-400 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ))}
      {showNames && editState[kind].length < max && (
        <button
          type="button"
          onClick={() => addRow(kind, max)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-600 hover:bg-bg-500 text-xs text-slatey-300 hover:text-white transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add another link
        </button>
      )}
    </div>
  );

  const matchStatusBadge = (status: string) => {
    if (status === 'live')
      return <span className="px-2 py-0.5 rounded-full bg-live-500/15 text-live-400 text-[10px] font-bold">LIVE</span>;
    if (status === 'finished')
      return <span className="px-2 py-0.5 rounded-full bg-slatey-600/30 text-slatey-400 text-[10px] font-bold">FT</span>;
    return <span className="px-2 py-0.5 rounded-full bg-accent-500/10 text-accent-400 text-[10px] font-bold">UPCOMING</span>;
  };

  const chipClass = (active: boolean) =>
    active
      ? 'px-4 py-1.5 rounded-full text-xs font-bold bg-accent-500 whitespace-nowrap'
      : 'px-4 py-1.5 rounded-full text-xs font-medium bg-bg-600 text-slatey-300 hover:bg-bg-500 hover:text-white transition-colors whitespace-nowrap';

  // ---------- screens ----------
  if (checkingSession) {
    return (
      <div className="min-h-screen bg-bg-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-accent-400 animate-spin" />
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-bg-900 flex items-center justify-center px-4">
        <div className="glass-card p-8 w-full max-w-sm">
          <div className="flex flex-col items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center accent-glow">
              <Lock className="w-7 h-7 text-white" />
            </div>
            <div className="text-center">
              <h1 className="text-xl font-bold text-white">Derby Admin</h1>
              <p className="text-xs text-slatey-400 mt-1">Sign in</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-3">
            <input
              type="email"
              autoComplete="username"
              value={emailInput}
              onChange={(e) => {
                setEmailInput(e.target.value);
                setLoginError(null);
              }}
              placeholder="Email"
              autoFocus
              dir="ltr"
              className="w-full bg-bg-600 border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slatey-600 focus:outline-none focus:border-accent-500/50 transition-colors"
            />
            <input
              type="password"
              autoComplete="current-password"
              value={passwordInput}
              onChange={(e) => {
                setPasswordInput(e.target.value);
                setLoginError(null);
              }}
              placeholder="Password"
              dir="ltr"
              className={`w-full bg-bg-600 border rounded-xl px-4 py-3 text-sm text-white placeholder:text-slatey-600 focus:outline-none transition-colors ${
                loginError ? 'border-live-500' : 'border-white/5 focus:border-accent-500/50'
              }`}
            />
            {loginError && (
              <p className="text-xs text-live-400 text-center">{loginError}</p>
            )}
            <button
              type="submit"
              disabled={loggingIn || !emailInput || !passwordInput}
              className="w-full py-3 rounded-xl bg-accent-500 hover:bg-accent-600 disabled:opacity-50 text-white font-bold text-sm transition-colors"
            >
              {loggingIn ? 'Signing in...' : 'Login'}
            </button>
          </form>

          <button
            onClick={goHome}
            className="mt-4 w-full flex items-center justify-center gap-1.5 text-xs text-slatey-400 hover:text-white transition-colors"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            Back Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-900">
      <div className="sticky top-0 z-50 bg-bg-800/95 backdrop-blur-md border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Logo height={32} />
              <span className="text-accent-400 text-[11px] font-medium border-r border-white/10 pr-3">Admin Panel</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-xs text-slatey-300 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
              <button
                onClick={goHome}
                className="flex items-center gap-1.5 text-xs text-slatey-300 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
                Back
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h2 className="text-lg font-bold text-white mb-1">Stream Links Management</h2>
        <p className="text-xs text-slatey-400 mb-4">
          Add stream links and official affiliate links for matches
        </p>

        {/* Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-3">
          <div className="glass-card p-4 border border-accent-500/20 text-center">
            <p className="text-xs text-slatey-400 mb-1">Visitors today</p>
            <p className="text-2xl font-bold text-accent-400">{stats.today}</p>
          </div>
          <div className="glass-card p-4 border border-accent-500/20 text-center">
            <p className="text-xs text-slatey-400 mb-1">Visitors, last 7 days</p>
            <p className="text-2xl font-bold text-accent-400">{stats.week}</p>
          </div>
          <div className="glass-card p-4 border border-white/10 text-center">
            <p className="text-xs text-slatey-400 mb-1">Visitors, total</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="glass-card p-4 border border-white/10 text-center">
            <p className="text-xs text-slatey-400 mb-1">Featured stream views</p>
            <p className="text-2xl font-bold text-white">{stats.featuredViews}</p>
          </div>
          <div className="glass-card p-4 border border-white/10 text-center col-span-2 sm:col-span-1">
            <p className="text-xs text-slatey-400 mb-1">Match link clicks</p>
            <p className="text-2xl font-bold text-white">{stats.linkClicks}</p>
          </div>
        </div>

        <div className="glass-card p-4 mb-2">
          <div className="flex items-end justify-between gap-2" dir="ltr">
            {stats.last7.map((d) => (
              <div key={d.key} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-slatey-300">{d.n}</span>
                <div
                  className="w-full max-w-[36px] rounded-t bg-accent-500/70"
                  style={{ height: `${Math.max(4, (d.n / stats.maxDay) * 48)}px` }}
                />
                <span className="text-[9px] text-slatey-400">{d.label}</span>
              </div>
            ))}
          </div>
        </div>
        <p dir="ltr" className="text-[11px] text-slatey-400 mb-5">
          A visitor is counted once per day (Baghdad time). The admin, bots and automated browsers are not counted.
          Counting started when the new version went live.
        </p>

        {(loadError || saveError) && (
          <div className="mb-4 flex items-start gap-2 text-xs text-live-400 bg-live-500/10 rounded-lg px-3 py-3">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p>{loadError || saveError}</p>
              <button
                onClick={() => { setLoadError(null); setSaveError(null); }}
                className="text-slatey-400 hover:text-white mt-1 underline"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Featured stream */}
        <div className="glass-card p-4 mb-5 border border-live-500/30">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded-full bg-live-500/15 text-live-400 text-[10px] font-bold">24/7 LIVE</span>
              <span className="text-sm font-bold text-white">Featured Stream</span>
              <span className="flex items-center gap-1 text-[10px] text-slatey-400 bg-bg-600/50 rounded-full px-2 py-0.5">
                <MousePointerClick className="w-3 h-3" />
                Views: {stats.featuredViews}
              </span>
            </div>
            {editingId !== '__BEIN_NEWS__' && (
              <button
                onClick={() => startEdit('__BEIN_NEWS__')}
                className="px-3 py-1.5 rounded-lg bg-accent-500 hover:bg-accent-600 text-xs text-white font-medium shrink-0"
              >
                {savedId === '__BEIN_NEWS__' ? 'Saved' : 'Update Link'}
              </button>
            )}
          </div>
          {editingId === '__BEIN_NEWS__' && (
            <div className="space-y-2 pt-2">
              {renderLinksEditor('streams', 1, false)}
              <div className="flex gap-2">
                <button
                  onClick={() => handleSave('__BEIN_NEWS__')}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-accent-500 hover:bg-accent-600 text-white text-xs font-medium"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save
                </button>
                <button
                  onClick={cancelEdit}
                  className="px-3 py-1.5 rounded-lg bg-bg-600 hover:bg-bg-500 text-slatey-300 text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Day tabs */}
        <div className="flex items-center gap-2 mb-3 overflow-x-auto no-scrollbar">
          {DAY_TABS.map((t) => (
            <button key={t.id} onClick={() => setDayTab(t.id)} className={chipClass(dayTab === t.id)}>
              {t.label} ({dayCounts[t.id]})
            </button>
          ))}
        </div>

        {/* League chips (only leagues that have matches on the selected day) */}
        {leagueChips.length > 1 && (
          <div className="flex items-center gap-2 mb-3 overflow-x-auto no-scrollbar">
            <button onClick={() => setLeagueFilter('all')} className={chipClass(activeLeague === 'all')}>
              All leagues ({matchesForDay.length})
            </button>
            {leagueChips.map(([name, count]) => (
              <button key={name} onClick={() => setLeagueFilter(name)} className={chipClass(activeLeague === name)}>
                {name} ({count})
              </button>
            ))}
          </div>
        )}

        <div className="relative mb-4">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slatey-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search matches..."
            className="w-full bg-bg-600 border border-white/5 rounded-lg pr-10 pl-4 py-2.5 text-sm text-white placeholder:text-slatey-400 focus:outline-none focus:border-accent-500/50 transition-colors"
          />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 text-accent-400 animate-spin" />
            <p className="text-slatey-400 text-sm">Loading matches...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <p className="text-slatey-400">
              No matches {dayTab === 'all' ? '' : 'for this day'}.
              {dayTab !== 'all' && ' Try another day above.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((match) => {
              const data = streamDataMap[match.id];
              const streamCount = data?.streams?.length || 0;
              const affiliateList = data?.affiliates || [];
              const hasAny = streamCount > 0 || affiliateList.length > 0;
              const clickCount = data?.click_count || 0;
              const isEditing = editingId === match.id;
              const justSaved = savedId === match.id;
              return (
                <div key={match.id} className="glass-card p-4">
                  <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {matchStatusBadge(match.status)}
                      <span className="text-xs text-slatey-400 shrink-0">{match.leagueName}</span>
                      <span className="text-sm text-white truncate">
                        {match.homeTeam.name} vs {match.awayTeam.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] text-slatey-400" dir="ltr">{match.kickoffTime}</span>
                      <span className="flex items-center gap-1 text-[10px] text-slatey-400 bg-bg-600/50 rounded-full px-2 py-0.5">
                        <MousePointerClick className="w-3 h-3" />
                        Clicks: {clickCount}
                      </span>
                      {hasAny && !isEditing && (
                        <span className="flex items-center gap-1 text-[10px] text-accent-400">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Active
                        </span>
                      )}
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <label className="flex items-center gap-1.5 text-xs text-slatey-400 mb-1.5">
                          <Youtube className="w-3.5 h-3.5 text-live-400" />
                          Stream links (first one opens by default)
                        </label>
                        {renderLinksEditor('streams', MAX_LINKS, true)}
                      </div>

                      <div>
                        <label className="flex items-center gap-1.5 text-xs text-slatey-400 mb-1.5">
                          <Link2 className="w-3.5 h-3.5 text-accent-400" />
                          Affiliate links (each one becomes a watch button)
                        </label>
                        {renderLinksEditor('affiliates', MAX_LINKS, true)}
                      </div>

                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => handleSave(match.id)}
                          disabled={saving}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent-500 hover:bg-accent-600 text-white text-sm font-medium"
                        >
                          <Save className="w-4 h-4" />
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-3 py-2 rounded-lg bg-bg-600 hover:bg-bg-500 text-slatey-300 text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <div className="flex flex-wrap gap-2 text-xs text-slatey-400">
                        {streamCount > 0 && (
                          <span className="bg-bg-600/60 px-2 py-1 rounded text-live-400">
                            Stream ×{streamCount}
                          </span>
                        )}
                        {affiliateList.map((a, i) => (
                          <span key={`${a.url}-${i}`} className="bg-bg-600/60 px-2 py-1 rounded text-accent-400">
                            {a.name || 'Affiliate'}
                          </span>
                        ))}
                        {!hasAny && <span>No link set</span>}
                      </div>
                      <button
                        onClick={() => startEdit(match.id)}
                        className="px-3 py-1.5 rounded-lg bg-bg-600 hover:bg-bg-500 text-xs text-white shrink-0"
                      >
                        {justSaved ? 'Saved' : hasAny ? 'Edit' : 'Add Link'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
