import { Play, Calendar, CheckCircle, Radio } from 'lucide-react';
import type { Match } from '@/data/matches';
import TeamLogo from './TeamLogo';

interface MatchCardProps {
  match: Match;
  onClick: () => void;
}

export default function MatchCard({ match, onClick }: MatchCardProps) {
  const isLive = match.status === 'live';
  const isFinished = match.status === 'finished';

  return (
    <div
      onClick={onClick}
      className="glass-card p-4 sm:p-5 cursor-pointer transition-all hover:border-accent-500/30 hover:bg-bg-600/80 group animate-fade-in"
    >
      {/* League name */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-slatey-400 font-medium">{match.leagueName}</span>
        <StatusBadge match={match} />
      </div>

      {/* Teams + Score */}
      <div className="flex items-center justify-between gap-3">
        {/* Home team */}
        <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
          <TeamLogo team={match.homeTeam} size={48} />
          <span className="text-sm font-medium text-white text-center truncate w-full">
            {match.homeTeam.name}
          </span>
        </div>

        {/* Score / Time */}
        <div className="flex flex-col items-center gap-1 px-2 sm:px-4 min-w-[80px]">
          {isLive || isFinished ? (
            <div className="flex items-center gap-2 text-2xl font-bold text-white">
              <span className={isLive ? 'text-accent-400' : ''}>{match.homeScore}</span>
              <span className="text-slatey-500 text-lg">-</span>
              <span className={isLive ? 'text-accent-400' : ''}>{match.awayScore}</span>
            </div>
          ) : (
            <div className="text-xl font-bold text-slatey-300">{match.kickoffTime}</div>
          )}
          {isLive && (
            <div className="flex items-center gap-1 text-xs text-live-400 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-live-500 animate-pulse-dot" />
              {match.liveMinute}'
            </div>
          )}
          {isFinished && (
            <span className="text-xs text-slatey-500 font-medium">کۆتایی هات</span>
          )}
          {!isLive && !isFinished && (
            <span className="text-xs text-slatey-500">کاتژمێر</span>
          )}
        </div>

        {/* Away team */}
        <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
          <TeamLogo team={match.awayTeam} size={48} />
          <span className="text-sm font-medium text-white text-center truncate w-full">
            {match.awayTeam.name}
          </span>
        </div>
      </div>

      {/* Watch button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all bg-bg-600/50 text-slatey-300 group-hover:bg-accent-500 group-hover:text-white"
      >
        <Play className="w-4 h-4" fill="currentColor" />
        بینینی یاری
      </button>
    </div>
  );
}

function StatusBadge({ match }: { match: Match }) {
  if (match.status === 'live') {
    return (
      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-live-500/15 text-live-400 text-[10px] font-bold live-glow">
        <Radio className="w-3 h-3" />
        LIVE
      </span>
    );
  }
  if (match.status === 'finished') {
    return (
      <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slatey-600/30 text-slatey-400 text-[10px] font-bold">
        <CheckCircle className="w-3 h-3" />
        کۆتایی هات
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent-500/10 text-accent-400 text-[10px] font-bold">
      <Calendar className="w-3 h-3" />
      کاتژمێر {match.kickoffTime}
    </span>
  );
}
