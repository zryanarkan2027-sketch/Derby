import { type Match, type LeagueFilter, isTodayInBaghdad } from '@/data/matches';
import type { FilterTab } from './FilterTabs';
import { filterToStatus } from './FilterTabs';
import MatchCard from './MatchCard';

interface MatchListProps {
  filterTab: FilterTab;
  leagueFilter: LeagueFilter;
  searchQuery: string;
  onMatchClick: (match: Match) => void;
  matches: Match[];
}

export default function MatchList({
  filterTab,
  leagueFilter,
  searchQuery,
  onMatchClick,
  matches,
}: MatchListProps) {
  const statuses = filterToStatus(filterTab);
  const now = new Date();

  let filtered = matches.filter((m) => {
    const statusMatch = statuses.includes(m.status);
    if (filterTab === 'today' && !isTodayInBaghdad(m.kickoffDate, now)) return false;
    const leagueMatch =
      leagueFilter === 'all' || m.leagueId === leagueFilter;

    let searchMatch = true;
    if (searchQuery.trim()) {
      const q = searchQuery.trim();
      searchMatch =
        m.homeTeam.name.includes(q) ||
        m.awayTeam.name.includes(q) ||
        m.leagueName.includes(q);
    }

    return statusMatch && leagueMatch && searchMatch;
  });

  // Sort: live first, then upcoming by time, then finished by time
  filtered = filtered.sort((a, b) => {
    const order: Record<string, number> = { live: 0, upcoming: 1, finished: 2 };
    if (order[a.status] !== order[b.status]) {
      return order[a.status] - order[b.status];
    }
    // Use kickoffDate for accurate chronological sorting, fall back to kickoffTime
    const aSortKey = a.kickoffDate || a.kickoffTime;
    const bSortKey = b.kickoffDate || b.kickoffTime;
    return aSortKey.localeCompare(bSortKey);
  });

  if (filtered.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <p className="text-slatey-400 text-lg mb-2">هیچ یارییەک نەدۆزرایەوە</p>
        <p className="text-slatey-500 text-sm">
          بگۆڕە فلتەرەکان بۆ بینینی یارییەکانی تر
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {filtered.map((match) => (
        <MatchCard
          key={match.id}
          match={match}
          onClick={() => onMatchClick(match)}
        />
      ))}
    </div>
  );
}
