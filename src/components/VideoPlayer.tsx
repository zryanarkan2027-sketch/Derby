import { ShieldCheck, Radio, Trophy, Sparkles } from 'lucide-react';

interface VideoPlayerProps {
  streamUrl?: string;
  matchTitle: string;
}

function formatYouTubeEmbedUrl(url?: string): string | null {
  if (!url || !url.trim()) return null;
  const cleanUrl = url.trim();

  if (cleanUrl.includes('://youtube.com')) {
    return cleanUrl;
  }

  const watchMatch = cleanUrl.match(/(?:youtube\.com\/(?:watch\?v=|live\/|shorts\/))([a-zA-Z0-9_-]{11})/);
  if (watchMatch && watchMatch) {
    return `https://www.://youtube.com${watchMatch}?autoplay=1&rel=0`;
  }

  const shortMatch = cleanUrl.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch && shortMatch) {
    return `https://www.://youtube.com${shortMatch}?autoplay=1&rel=0`;
  }

  return cleanUrl;
}

export default function VideoPlayer({ streamUrl, matchTitle }: VideoPlayerProps) {
  const embedUrl = formatYouTubeEmbedUrl(streamUrl);
  const hasStream = Boolean(embedUrl);

  return (
    <div className="mb-3">
      {/* Official stream label */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-accent-400" />
          <span className="text-sm font-medium text-accent-400">
            ناوەندی پەخش و ڕووماڵی ڕاستەوخۆ
          </span>
        </div>
        {hasStream && (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 px-2.5 py-0.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            پەخشی فەرمی چالاکە
          </span>
        )}
      </div>

      {/* 16:9 video / stadium graphic container */}
      <div
        className="relative w-full overflow-hidden rounded-xl border border-white/10 bg-bg-900 shadow-2xl"
        style={{ aspectRatio: '16/9' }}
      >
        {hasStream && embedUrl ? (
          <iframe
            src={embedUrl}
            title={matchTitle}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            frameBorder="0"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 overflow-hidden bg-gradient-to-br from-[#0a192f] via-[#0d2137] to-[#06101e]">
            {/* Football Pitch SVG Lines Background */}
            <svg
              className="absolute inset-0 w-full h-full opacity-15 pointer-events-none"
              viewBox="0 0 800 450"
              fill="none"
              xmlns="http://w3.org"
            >
              <rect x="30" y="25" width="740" height="400" rx="8" stroke="#10b981" strokeWidth="3" />
              <line x1="400" y1="25" x2="400" y2="425" stroke="#10b981" strokeWidth="3" />
              <circle cx="400" cy="225" r="65" stroke="#10b981" strokeWidth="3" />
              <circle cx="400" cy="225" r="6" fill="#10b981" />
              <rect x="30" y="115" width="110" height="220" stroke="#10b981" strokeWidth="3" />
              <rect x="660" y="115" width="110" height="220" stroke="#10b981" strokeWidth="3" />
              <rect x="30" y="165" width="45" height="120" stroke="#10b981" strokeWidth="3" />
              <rect x="725" y="165" width="45" height="120" stroke="#10b981" strokeWidth="3" />
            </svg>

            {/* Glowing Center Stadium Card */}
            <div className="relative z-10 flex flex-col items-center text-center max-w-md gap-3">
              <div className="relative">
                <div className="absolute -inset-2 rounded-full bg-accent-500/20 blur-md animate-pulse" />
                <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-accent-600 to-emerald-400 flex items-center justify-center shadow-lg border border-white/20">
                  <Radio className="w-7 h-7 text-white animate-pulse" />
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-emerald-300">
                <Sparkles className="w-3.5 h-3.5" />
                ڕووماڵی ڕاستەوخۆی یاریگا • Match Center
              </div>

              <h3 className="text-white font-bold text-base sm:text-lg tracking-wide">
                {matchTitle}
              </h3>

              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                بۆ سەیرکردنی پەخشی ڕاستەوخۆ بە کوالێتی HD دوگمەی خوارەوە دابگرە، یان لێرەوە چاودێری ئەنجام و ئامارە ڕاستەوخۆکان بکە.
              </p>

              <div className="flex items-center gap-4 mt-1 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  ئاماری ڕاستەوخۆ
                </span>
                <span>•</span>
                <span>پێکهاتەی یانەکان</span>
                <span>•</span>
                <span>پەخشی فەرمی</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
