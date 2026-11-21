import { useState, useEffect, useCallback } from 'react';
import { type Match } from '@/data/matches';
import { fetchMatches } from '@/data/api';
import {
  getAllStreamData,
  setStreamData,
  convertToEmbedUrl,
  StreamError,
  type StreamData,
} from '@/data/streamUrls';
import {
  Lock, Save, Search, Loader2, CheckCircle, Link2, ArrowRight,
  AlertCircle, MousePointerClick, Youtube, ExternalLink,
} from 'lucide-react';

const ADMIN_PIN = '1234';

interface EditState {
  streamUrl: string;
  affiliateUrl: string;
  platformName: string;
}

export default function AdminPanel() {
  const [authenticated, setAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [streamDataMap, setStreamDataMap] = useState<Record<string, StreamData>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editState, setEditState] = useState<EditState>({ streamUrl: '', affiliateUrl: '', platformName: '' });
  const [savedId, setSavedId] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

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
          ? `هەڵەی داتابەیس (${err.status}): ${err.message}`
          : 'نەتوانرا لینکەکان لە داتابەیس بهێنرێن'
      );
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (authenticated) {
      loadMatches();
    }
  }, [authenticated, loadMatches]);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === ADMIN_PIN) {
      setAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
      setPinInput('');
    }
  };

  const handleSave = async (matchId: string) => {
    setSaving(true);
    setSaveError(null);
    const embedUrl = convertToEmbedUrl(editState.streamUrl);
    try {
      await setStreamData(matchId, {
        stream_url: embedUrl,
        affiliate_url: editState.affiliateUrl,
        platform_name: editState.platformName,
      });
      setStreamDataMap((prev) => ({
        ...prev,
        [matchId]: {
          stream_url: embedUrl,
          affiliate_url: editState.affiliateUrl.trim(),
          platform_name: editState.platformName.trim(),
          click_count: prev[matchId]?.click_count || 0,
        },
      }));
      setEditingId(null);
      setSavedId(matchId);
      setTimeout(() => setSavedId(null), 2000);
    } catch (err) {
      setSaveError(
        err instanceof StreamError
          ? `هەڵەی پاشەکەوت (${err.status}): ${err.message}`
          : 'نەتوانرا لینک پاشەکەوت بکرێت'
      );
    }
    setSaving(false);
  };

  const startEdit = (matchId: string) => {
    const existing = streamDataMap[matchId];
    setEditingId(matchId);
    setEditState({
      streamUrl: existing?.stream_url || '',
      affiliateUrl: existing?.affiliate_url || '',
      platformName: existing?.platform_name || '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditState({ streamUrl: '', affiliateUrl: '', platformName: '' });
  };

  const goHome = () => {
    window.location.href = '/';
  };

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
              <p className="text-xs text-slatey-400 mt-1">تکایە کۆدی ژمارەی نهێنی بنووسە</p>
            </div>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <input
              type="password"
              inputMode="numeric"
              value={pinInput}
              onChange={(e) => {
                setPinInput(e.target.value);
                setPinError(false);
              }}
              placeholder="• • • •"
              maxLength={4}
              autoFocus
              className={`w-full text-center text-2xl tracking-[0.5em] bg-bg-600 border rounded-xl py-3 text-white placeholder:text-slatey-600 focus:outline-none transition-colors ${
                pinError ? 'border-live-500' : 'border-white/5 focus:border-accent-500/50'
              }`}
            />
            {pinError && (
              <p className="text-xs text-live-400 text-center">کۆدی هەڵەیە</p>
            )}
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-accent-500 hover:bg-accent-600 text-white font-bold text-sm transition-colors"
            >
              چوونەژوورەوە
            </button>
          </form>

          <button
            onClick={goHome}
            className="mt-4 w-full flex items-center justify-center gap-1.5 text-xs text-slatey-400 hover:text-white transition-colors"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            گەڕانەوە بۆ ماڵەوە
          </button>
        </div>
      </div>
    );
  }

  let filtered = matches;
  if (searchQuery.trim()) {
    const q = searchQuery.trim();
    filtered = matches.filter(
      (m) =>
        m.homeTeam.name.includes(q) ||
        m.awayTeam.name.includes(q) ||
        m.leagueName.includes(q)
    );
  }

  const matchStatusBadge = (status: string) => {
    if (status === 'live')
      return <span className="px-2 py-0.5 rounded-full bg-live-500/15 text-live-400 text-[10px] font-bold">LIVE</span>;
    if (status === 'finished')
      return <span className="px-2 py-0.5 rounded-full bg-slatey-600/30 text-slatey-400 text-[10px] font-bold">کۆتایی</span>;
    return <span className="px-2 py-0.5 rounded-full bg-accent-500/10 text-accent-400 text-[10px] font-bold">داهاتوو</span>;
  };

  return (
    <div className="min-h-screen bg-bg-900">
      <div className="sticky top-0 z-50 bg-bg-800/95 backdrop-blur-md border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">DB</span>
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-white font-bold text-sm">Derby</span>
                <span className="text-accent-400 text-[10px]">Admin Panel</span>
              </div>
            </div>
            <button
              onClick={goHome}
              className="flex items-center gap-1.5 text-xs text-slatey-300 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
              گەڕانەوە
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h2 className="text-lg font-bold text-white mb-1">بەڕێوەبردنی لینکی پەخش</h2>
        <p className="text-xs text-slatey-400 mb-4">
          لینکی YouTube Embed و پلاتفۆرمی فەرمی (Affiliate) بۆ هەر یارییەک دابنێ
        </p>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="glass-card p-4 border border-accent-500/20 text-center">
            <p className="text-xs text-slatey-400 mb-1">کۆی گشتی سەردانکەرانی وێبسایت</p>
            <p className="text-2xl font-bold text-accent-400">
              {streamDataMap['__SITE_STATS__']?.click_count || 0}
            </p>
          </div>
          <div className="glass-card p-4 border border-white/10 text-center">
            <p className="text-xs text-slatey-400 mb-1">کۆی گشتی کلیک لە لینکەکان</p>
            <p className="text-2xl font-bold text-white">
              {Object.entries(streamDataMap)
                .filter(([key]) => key !== '__SITE_STATS__')
                .reduce((sum, [, val]) => sum + (val.click_count || 0), 0)}
            </p>
          </div>
        </div>

        {(loadError || saveError) && (
          <div className="mb-4 flex items-start gap-2 text-xs text-live-400 bg-live-500/10 rounded-lg px-3 py-3">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p>{loadError || saveError}</p>
              <button
                onClick={() => { setLoadError(null); setSaveError(null); }}
                className="text-slatey-400 hover:text-white mt-1 underline"
              >
                داخستن
              </button>
            </div>
          </div>
        )}

        <div className="relative mb-4">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slatey-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="گەڕان بۆ یاری..."
className="w-full bg-bg-600 border border-white/5 rounded-lg pr-10 pl-4 py-2.5 text-sm text-white placeholder:text-slatey-400 focus:outline-none focus:border-accent-500/50 transition-colors"
/>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 text-accent-400 animate-spin" />
            <p className="text-slatey-400 text-sm">Loading matches...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <p className="text-slatey-400">No matches found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((match) => {

const data = streamDataMap[match.id];
const hasYouTube = !!data?.stream_url && data.stream_url.length > 0;
const hasAffiliate = !!data?.affiliate_url && data.affiliate_url.length > 0;
const hasAny = hasYouTube || hasAffiliate;
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
                    <div className="space-y-3">
                      <div>
                        <label className="flex items-center gap-1.5 text-xs text-slatey-400 mb-1.5">
                          <Youtube className="w-3.5 h-3.5 text-live-400" />
                          YouTube Embed URL
                        </label>
                        <div className="relative">
                          <Link2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slatey-400" />
                          <input
                            type="text"
                            value={editState.streamUrl}
                            onChange={(e) => setEditState((s) => ({ ...s, streamUrl: e.target.value }))}
                            placeholder="https://youtube.com..."
                            className="w-full bg-bg-600 border border-white/5 rounded-lg pr-10 pl-4 py-2 text-sm text-white"
                            dir="ltr"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="flex items-center gap-1.5 text-xs text-slatey-400 mb-1.5">
                          <ExternalLink className="w-3.5 h-3.5 text-accent-400" />
                          Affiliate URL
                        </label>
                        <div className="relative">
                          <Link2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slatey-400" />
                          <input
                            type="text"
                            value={editState.affiliateUrl}
                            onChange={(e) => setEditState((s) => ({ ...s, affiliateUrl: e.target.value }))}
                            placeholder="https://..."
                            className="w-full bg-bg-600 border border-white/5 rounded-lg pr-10 pl-4 py-2 text-sm text-white"
                            dir="ltr"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="flex items-center gap-1.5 text-xs text-slatey-400 mb-1.5">
                          <ExternalLink className="w-3.5 h-3.5 text-accent-400" />
                          Platform Name
                        </label>
                        <input
                          type="text"
                          value={editState.platformName}
                          onChange={(e) => setEditState((s) => ({ ...s, platformName: e.target.value }))}
                          placeholder="DAZN, TurboVPN..."
                          className="w-full bg-bg-600 border border-white/5 rounded-lg px-4 py-2 text-sm text-white"
                          dir="ltr"
                        />
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
                      <div className="flex flex-wrap gap-2 text-xs text-slatey-400 truncate">
                        {hasYouTube && (
                          <span className="bg-bg-600/60 px-2 py-1 rounded text-live-400">
                            YouTube
                          </span>
                        )}
                        {hasAffiliate && (
                          <span className="bg-bg-600/60 px-2 py-1 rounded text-accent-400">
                            {data?.platform_name || 'Affiliate'}
                          </span>
                        )}
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
