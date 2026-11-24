import { useState } from 'react';
import { Tv, Play } from 'lucide-react';
import { incrementClickCount } from '@/data/streamUrls';

function withAutoplay(url: string): string {
  if (!/youtube\.com\/embed\//.test(url)) return url;
  return url.includes('?') ? `${url}&autoplay=1` : `${url}?autoplay=1`;
}

/**
 * The 24/7 featured stream. It loads only after the visitor taps "play",
 * which also lets us count how many people actually watch it.
 */
export default function FeaturedStream({ url }: { url: string | null }) {
  const [started, setStarted] = useState(false);
  const embed = url && /^https?:\/\//i.test(url.trim()) ? url.trim() : null;

  const start = () => {
    if (!embed) return;
    incrementClickCount('__BEIN_NEWS__');
    setStarted(true);
  };

  return (
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
        {started && embed ? (
          <iframe
            src={withAutoplay(embed)}
            title="Derby Live"
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-4 bg-gradient-to-br from-bg-800 via-bg-900 to-bg-900">
            <svg
              className="absolute inset-0 w-full h-full opacity-[0.07] pointer-events-none"
              viewBox="0 0 800 450"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="xMidYMid slice"
            >
              <rect x="30" y="25" width="740" height="400" rx="8" stroke="#C6F432" strokeWidth="3" />
              <line x1="400" y1="25" x2="400" y2="425" stroke="#C6F432" strokeWidth="3" />
              <circle cx="400" cy="225" r="65" stroke="#C6F432" strokeWidth="3" />
              <circle cx="400" cy="225" r="6" fill="#C6F432" />
            </svg>

            <div className="relative z-10 flex flex-col items-center gap-3 text-center">
              <p className="text-white font-bold text-base sm:text-lg">پەخشی ڕاستەوخۆی ٢٤ کاتژمێر</p>
              {embed ? (
                <button
                  onClick={start}
                  className="flex items-center gap-3 px-6 py-3 rounded-full bg-accent-500 hover:bg-accent-400 font-bold text-sm sm:text-base accent-glow transition-colors"
                >
                  <Play className="w-5 h-5 fill-current" />
                  پەخش بکە
                </button>
              ) : (
                <p className="text-slatey-300 text-xs sm:text-sm">هێشتا لینکی پەخش دانەنراوە.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
