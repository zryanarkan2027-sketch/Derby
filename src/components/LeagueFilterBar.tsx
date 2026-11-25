import { leagues, type LeagueFilter } from '@/data/matches';
import { leaguePath } from '@/data/leaguePages';

interface LeagueFilterBarProps {
  active: LeagueFilter;
  onChange: (id: LeagueFilter) => void;
}

// Display order: All, Iraq, Premier League, La Liga, Champions League, Serie A, Bundesliga, Ligue 1, International
// A league only appears if it also exists in `leagues` (src/data/matches.ts).
const LEAGUE_ORDER = [
  'all',
  'iraq_stars',
  'premier_league',
  'la_liga',
  'champions_league',
  'serie_a',
  'bundesliga',
  'ligue_1',
  'international',
] as LeagueFilter[];

const orderedLeagues = LEAGUE_ORDER.map((id) => leagues.find((l) => l.id === id)).filter(
  (l): l is (typeof leagues)[number] => Boolean(l)
);

export default function LeagueFilterBar({ active, onChange }: LeagueFilterBarProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1" role="group" aria-label="خولەکان">
      {orderedLeagues.map((league) => {
        const isActive = active === league.id;
        const className = `flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
          isActive
            ? 'bg-accent-500 text-white accent-glow'
            : 'bg-bg-700 text-slatey-300 hover:bg-bg-600 hover:text-white border border-white/5'
        }`;
        const href = leaguePath(league.id);

        // Leagues with their own page are real links (good for search engines);
        // a normal click still just switches the list without reloading.
        if (href) {
          return (
            <a
              key={league.id}
              href={href}
              onClick={(e) => {
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                e.preventDefault();
                onChange(league.id);
              }}
              aria-current={isActive ? 'page' : undefined}
              title={league.name}
              className={className}
            >
              <span>{league.nameKu}</span>
            </a>
          );
        }

        return (
          <button
            key={league.id}
            type="button"
            onClick={() => onChange(league.id)}
            aria-pressed={isActive}
            title={league.name}
            className={className}
          >
            <span>{league.nameKu}</span>
          </button>
        );
      })}
    </div>
  );
}
