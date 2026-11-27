import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import Hls from 'hls.js';
import type { StreamLink } from '@/data/streamUrls';
import { ShieldCheck, Radio, Play, RefreshCw } from 'lucide-react';

interface VideoPlayerProps {
  streamUrl?: string;
  streams?: StreamLink[];
  matchTitle: string;
  homeName?: string;
  awayName?: string;
  homeLogo?: ReactNode;
  awayLogo?: ReactNode;
  timeLabel?: string;
  onPlay?: () => void;
}

function normalizeUrl(raw?: string): string | null {
  const url = (raw || '').trim();
  if (!url) return null;
  if (!/^https?:\/\//i.test(url)) return null;

  const yt = url.match(
    /(?:youtube\.com\/(?:watch\?v=|live\/|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (yt && yt[1]) {
    return `https://youtube.com{yt[1]}?rel=0`;
  }
  return url;
}

function withAutoplay(url: string): string {
  if (!/youtube\.com\/embed\//.test(url)) return url;
  return url.includes('?') ? `${url}&autoplay=1` : `${url}?autoplay=1`;
}

function isHlsStream(url: string): boolean {
  return /\.m3u8(\?|$)/i.test(url);
}

function HlsVideoPlayer({ src, title }: { src: string; title: string }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls: Hls | null = null;

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      video.addEventListener('loadedmetadata', () => {
        video.play().catch(() => {});
      });
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [src]);

  return (
    <video
      ref={videoRef}
      title={title}
      className="absolute inset-0 w-full h-full bg-black"
      controls
      autoPlay
      playsInline
    />
  );
}

export default function VideoPlayer({
  streamUrl,
  streams,
  matchTitle,
  homeName,
  awayName,
  homeLogo,
  awayLogo,
  timeLabel,
  onPlay,
}: VideoPlayerProps) {
  const links = useMemo(() => {
    const source: StreamLink[] =
      streams && streams.length > 0
        ? streams
        : streamUrl
          ? [{ name: 'لینکی ١', url: streamUrl }]
          : [];
    return source
      .map((s, i) => ({ name: s.name?.trim() || `لینکی ${i + 1}`, url: normalizeUrl(s.url) }))
      .filter((s): s is { name: string; url: string } => Boolean(s.url));
  }, [streams, streamUrl]);

  const [active, setActive] = useState(0);
  const [started, setStarted] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const hasStream = links.length > 0;
  const current = links[Math.min(active, Math.max(links.length - 1, 0))];

  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-accent-400" />
          <span className="text-sm font-medium text-accent-400">
            ناوەندی پەخش و ڕووماڵی ڕاستەوخۆ
          </span>
        </div>
        {hasStream && (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-live-400 bg-live-500/10 border border-live-500/20 px-2.5 py-0.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-live-500 animate-pulse" />
            پەخش بەردەستە
          </span>
        )}
      </div>

      <div
        className="relative w-full overflow-hidden rounded-xl border border-white/10 bg-bg-900 shadow-2xl"
        style={{ aspectRatio: '16/9' }}
      >
        {hasStream && current && started ? (
          isHlsStream(current.url) ? (
            <HlsVideoPlayer
              key={`${active}-${reloadKey}`}
              src={current.url}
              title={`${matchTitle} - ${current.name}`}
            />
          ) : (
            <iframe
              key={`${active}-${reloadKey}`}
              src={withAutoplay(current.url)}
              title={`${matchTitle} - ${current.name}`}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              style={{ border: 0 }}
            />
          )
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden bg-gradient-to-br from-bg-800 via-bg-900 to-bg-900">
            <svg
              className="absolute inset-0 w-full h-full opacity-[0.07] pointer-events-none"
              viewBox="0 0 800 450"
              fill="none"
              xmlns="http://w3.org"
              preserveAspectRatio="xMidYMid slice"
            >
              <rect x="30" y="25" width="740" height="400" rx="8" stroke="#C6F432" strokeWidth="3" />
              <line x1="400" y1="25" x2="400" y2="425" stroke="#C6F432" strokeWidth="3" />
              <circle cx="400" cy="225" r="65" stroke="#C6F432" strokeWidth="3" />
              <circle cx="400" cy="225" r="6" fill="#C6F432" />
              <rect x="30" y="115" width="110" height="220" stroke="#C6F432" strokeWidth="3" />
              <rect x="660" y="115" width="110" height="220" stroke="#C6F432" strokeWidth="3" />
            </svg>

            <div className="relative z-10 flex flex-col items-center text-center gap-3 sm:gap-4 w-full max-w-lg">
              {homeName && awayName ? (
                <div className="flex items-center justify-center gap-4 sm:gap-8 w-full">
                  <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
                    {homeLogo}
                    <span className="text-white font-bold text-xs sm:text-sm truncate max-w-full">
                      {homeName}
                    </span>
                  </div>
                  <div className="flex flex-col items-center shrink-0">
                    <span className="text-slatey-400 text-xs font-bold">VS</span>
                    {timeLabel && (
                      <span className="text-white font-bold text-lg sm:text-2xl mt-1">{timeLabel}</span>
                    )}
                  </div>
                  <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
                    {awayLogo}
                    <span className="text-white font-bold text-xs sm:text-sm truncate max-w-full">
                      {awayName}
                    </span>
                  </div>
                </div>
              ) : (
                <h3 className="text-white font-bold text-base sm:text-lg">{matchTitle}</h3>
              )}

              {hasStream ? (
                <button
                  onClick={() => {
                    setStarted(true);
                    onPlay?.();
                  }}
                  className="group flex items-center gap-3 px-6 py-3 rounded-full bg-accent-500 hover:bg-accent-400 font-bold text-sm sm:text-base accent-glow transition-colors"
                >
                  <Play className="w-5 h-5 fill-current" />
                  پەخش بکە
                </button>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-2xl bg-bg-600 border border-white/10 flex items-center justify-center">
                    <Radio className="w-6 h-6 text-slatey-300" />
                  </div>
                  <p className="text-slatey-300 text-xs sm:text-sm leading-relaxed max-w-sm">
                    هێشتا لینکی پەخش بۆ ئەم یارییە دانەنراوە. دوایی سەردانی بکەرەوە.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {hasStream && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {links.length > 1 &&
            links.map((l, i) => (
              <button
                key={`${l.name}-${i}`}
                onClick={() => {
                  setActive(i);
                  setReloadKey((k) => k + 1);
                }}
                className={
                  i === active
                    ? 'px-4 py-1.5 rounded-full text-xs font-bold bg-accent-500'
                    : 'px-4 py-1.5 rounded-full text-xs font-medium bg-bg-600 text-slatey-300 hover:bg-bg-500 hover:text-white transition-colors'
                }
              >
                {l.name}
              </button>
            ))}

          {started && (
            <button
              onClick={() => setReloadKey((k) => k + 1)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-bg-600 text-slatey-300 hover:bg-bg-500 hover:text-white transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              تازەکردنەوە
            </button>
          )}
        </div>
      )}

      {hasStream && started && (
        <p className="mt-2 text-[11px] text-slatey-400">
          ئەگەر پەخشەکە وەستا، تازەی بکەرەوە
          {links.length > 1 ? ' یان لینکێکی تر هەڵبژێرە.' : '.'}
        </p>
      )}
    </div>
  );
}
