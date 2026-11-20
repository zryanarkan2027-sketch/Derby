import { ShieldCheck, Tv, AlertCircle } from 'lucide-react';

interface VideoPlayerProps {
  streamUrl?: string;
  matchTitle: string;
}

export default function VideoPlayer({ streamUrl, matchTitle }: VideoPlayerProps) {
  const hasStream = streamUrl && streamUrl.trim().length > 0;

  return (
    <div className="mb-2">
      {/* Official stream label */}
      <div className="flex items-center gap-2 mb-2">
        <ShieldCheck className="w-4 h-4 text-accent-400" />
        <span className="text-sm font-medium text-accent-400">
          پەخشی فەرمی و ڕێگەپێدراو
        </span>
      </div>

      {/* 16:9 video container */}
      <div className="relative w-full overflow-hidden rounded-xl border border-white/5 bg-black" style={{ aspectRatio: '16/9' }}>
        {hasStream ? (
          <iframe
            src={streamUrl}
            title={matchTitle}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            frameBorder="0"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-bg-800 to-bg-900 p-6">
            <div className="w-16 h-16 rounded-full bg-bg-600 flex items-center justify-center">
              <Tv className="w-8 h-8 text-slatey-500" />
            </div>
            <p className="text-slatey-300 text-center text-sm sm:text-base max-w-md">
              پەخشی فەرمی بۆ ئەم یارییە بەردەست نییە، دەتوانیت لێرەوە ئامارەکان ببینیت
            </p>
            <div className="flex items-center gap-1.5 text-xs text-slatey-500">
              <AlertCircle className="w-3.5 h-3.5" />
              تەنها پەخشی فەرمی و ڕێگەپێدراو پشتی پێ دەبەسترێت
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
