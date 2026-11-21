
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
          ? `Save Error (${err.status}): ${err.message}`
          : 'Failed to save link'
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
              <p className="text-xs text-slatey-400 mt-1">Enter PIN Code</p>
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
              <p className="text-xs text-live-400 text-center">Invalid PIN</p>
            )}
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-accent-500 hover:bg-accent-600 text-white font-bold text-sm transition-colors"
            >
              Login
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
      return <span className="px-2 py-0.5 rounded-full bg-slatey-600/30 text-slatey-400 text-[10px] font-bold">FT</span>;
    return <span className="px-2 py-0.5 rounded-full bg-accent-500/10 text-accent-400 text-[10px] font-bold">UPCOMING</span>;
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
              Back
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h2 className="text-lg font-bold text-white mb-1">Stream Links Management</h2>
        <p className="text-xs text-slatey-400 mb-4">
          Add YouTube Embed and Official Affiliate links for matches
        </p>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="glass-card p-4 border border-accent-500/20 text-center">
            <p className="text-xs text-slatey-400 mb-1">Total Website Visitors</p>
            <p className="text-2xl font-bold text-accent-400">
              {streamDataMap['__SITE_STATS__']?.click_count || 0}
            </p>
          </div>
          <div className="glass-card p-4 border border-white/10 text-center">
            <p className="text-xs text-slatey-400 mb-1">Total Link Clicks</p>
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
                Dismiss
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

No matches found

) : (

{filtered.map((match) => {
const data = streamDataMap[match.id];
const hasYouTube = !!data?.stream_url && data.stream_url.length > 0;
const hasAffiliate = !!data?.affiliate_url && data.affiliate_url.length > 0;
const hasAny = hasYouTube || hasAffiliate;
const clickCount = data?.click_count || 0;
const isEditing = editingId === match.id;
const justSaved = savedId === match.id;
return (



{matchStatusBadge(match.status)}
{match.leagueName}

{match.homeTeam.name} vs {match.awayTeam.name}





Clicks: {clickCount}

{hasAny && !isEditing && (


Active

)}

{isEditing ? (

YouTube Embed URL
<input
type="text"
value={editState.streamUrl}
onChange={(e) => setEditState((s) => ({ ...s, streamUrl: e.target.value }))}
placeholder="youtube.com..."
className="w-full bg-bg-600 border border-white/5 rounded-lg pr-10 pl-4 py-2 text-sm text-white"
dir="ltr"
/>

                      <div>
                        <label className="block text-xs text-slatey-400 mb-1.5">
                          Affiliate URL
                        </label>
                        <input
                          type="text"
                          value={editState.affiliateUrl}
                          onChange={(e) => setEditState((s) => ({ ...s, affiliateUrl: e.target.value }))}
                          placeholder="https://..."
                          className="w-full bg-bg-600 border border-white/5 rounded-lg px-4 py-2 text-sm text-white"
                          dir="ltr"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-slatey-400 mb-1.5">
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
<button
onClick={() => handleSave(match.id)}
disabled={saving}
className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent-500 hover:bg-accent-600 text-white text-sm font-medium"
>

Save


Cancel



) : (


{hasYouTube && (

YouTube

)}
{hasAffiliate && (

{data?.platform_name || 'Affiliate'}

)}
{!hasAny && No link set}

<button
onClick={() => startEdit(match.id)}
className="px-3 py-1.5 rounded-lg bg-bg-600 hover:bg-bg-500 text-xs text-white shrink-0"
>
{justSaved ? 'Saved' : hasAny ? 'Edit' : 'Add Link'}


)}

);
})}

)}


);
}

4. لە گۆشەی سەرەوەی لای ڕاست کلیک لە دوگمە سەوزەکەی **`Commit changes...`** بکە -> دواتر **`Commit changes`**.
5. یەکسەر **Netlify** بەبێ هیچ هەڵەیەک دەبێتە سەوز (**`Live`**) و هەموو تایبەتمەندییەکان کار دەکەن!

<FollowUp>
ئەم کۆدە ڕاستەوخۆ لەناو **GitHub** (`src/components/AdminPanel.tsx`) پاشەکەوت بکە (**Commit changes**)؛ پاشان سەیری **Netlify** بکە و پێم بڵێ کاتێک بوو بە سەوز (**`Live`**)!
</FollowUp>
