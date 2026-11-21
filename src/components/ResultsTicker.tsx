import { useMemo, type CSSProperties } from 'react';
import {
  leagues,
  isTodayInBaghdad,
  isYesterdayInBaghdad,
  type Match,
} from '@/data/matches';
import TeamLogo from './TeamLogo';

interface ResultsTickerProps {
  matches: Match[];
  onMatchClick?: (match: Match) => void;
}

const SECONDS_PER_ITEM = 7;
const MIN_DURATION = 30;

const leagueNameKu = new Map(leagues.map((l) => [l.id, l.nameKu]));

function selectTickerMatches(matches: Match[]): Match[] {
  const now = new Date();
  const live = matches.filter((m) => m.status === 'live');
  const finished = matches.filter(
    (m) =>
      m.status === 'finished' &&
      (isYesterdayInBaghdad(m.kickoffDate, now) || isTodayInBaghdad(m.kickoffDate, now))
  );
  // Live first, then most recent results first
  finished.sort((a, b) => b.kickoffDate.localeCompare(a.kickoffDate));
  return [...live, ...finished];
}

export default function ResultsTicker({ matches, onMatchClick }: ResultsTickerProps) {
  const items = useMemo(() => selectTickerMatches(matches), [matches]);

  if (items.length === 0) return null;

  const duration = Math.max(MIN_DURATION, items.length * SECONDS_PER_ITEM);

  return (
    <section
      aria-label="ئەنجامی یارییەکان"
      className="w-full bg-bg-800 border-b border-white/5"
    >
      <div className="flex items-stretch h-12">
        <div className="flex items-center gap-2 px-4 shrink-0 bg-accent-500/10 border-l border-accent-500/20 text-accent-400">
          <span className="relative flex w-2.5 h-2.5">
            <span className="absolute inline-flex w-full h-full rounded-full bg-accent-400 opacity-60 animate-ping" />
            <span className="relative inline-flex w-2.5 h-2.5 rounded-full bg-accent-500" />
          </span>
          <span className="text-sm font-bold whitespace-nowrap">ئەنجامی یارییەکان</span>
        </div>

        <div className="ticker-viewport ticker-fade relative flex-1 overflow-hidden" dir="ltr">
          <div
            className="ticker-track flex w-max h-full"
            style={{ '--ticker-duration': `${duration}s` } as CSSProperties}
          >
            <TickerGroup items={items} onMatchClick={onMatchClick} />
            <TickerGroup items={items} onMatchClick={onMatchClick} hidden />
          </div>
        </div>
      </div>
    </section>
  );
}

function TickerGroup({
  items,
  onMatchClick,
  hidden = false,
}: {
  items: Match[];
  onMatchClick?: (match: Match) => void;
  hidden?: boolean;
}) {
  return (
    <ul
      className="flex items-center shrink-0 min-w-[100vw] justify-around h-full"
      aria-hidden={hidden || undefined}
    >
      {items.map((match) => (
        <li key={match.id} className="flex items-center h-full">
          <TickerItem match={match} onClick={onMatchClick} tabbable={!hidden} />
          <span className="w-1 h-1 rounded-full bg-slatey-600 mx-2" aria-hidden="true" />
        </li>
      ))}
    </ul>
  );
}

function TickerItem({
  match,
  onClick,
  tabbable,
}: {
  match: Match;
  onClick?: (match: Match) => void;
  tabbable: boolean;
}) {
  const isLive = match.status === 'live';
  const league = leagueNameKu.get(match.leagueId) ?? match.leagueName;
  const score = `${match.homeScore ?? 0} - ${match.awayScore ?? 0}`;

  return (
    <button
      type="button"
      onClick={() => onClick?.(match)}
      tabIndex={tabbable ? 0 : -1}
      className="flex items-center gap-2.5 px-3 h-9 rounded-lg whitespace-nowrap text-sm transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/60"
      aria-label={`${match.homeTeam.name} ${score} ${match.awayTeam.name}${isLive ? ' — ڕاستەوخۆ' : ''}`}
    >
      <span className="text-[11px] font-medium text-slatey-400" dir="rtl">
        {league}
      </span>
      <TeamLogo team={match.homeTeam} size={18} />
      <span className="font-semibold text-slate-100" dir="auto">
        {match.homeTeam.name}
      </span>
      <span
        className={`font-bold tabular-nums px-2 py-0.5 rounded-md text-[13px] ${
          isLive
            ? 'bg-live-500/15 text-live-400 border border-live-500/30'
            : 'bg-accent-500/10 text-accent-400 border border-accent-500/20'
        }`}
      >
        {score}
      </span>
      <span className="font-semibold text-slate-100" dir="auto">
        {match.awayTeam.name}
      </span>
      <TeamLogo team={match.awayTeam} size={18} />
      {isLive ? (
        <span className="flex items-center gap-1 text-[11px] font-bold text-live-400">
          <span className="w-1.5 h-1.5 rounded-full bg-live-500 animate-pulse-dot" />
          {match.liveMinute ? `${match.liveMinute}'` : 'LIVE'}
        </span>
      ) : (
        <span className="text-[11px] font-medium text-slatey-500" dir="rtl">
          {isTodayInBaghdad(match.kickoffDate) ? 'کۆتایی' : 'دوێنێ'}
        </span>
      )}
    </button>
  );
}
