import { leagues, type LeagueFilter } from '@/data/matches';

interface LeagueFilterBarProps {
  active: LeagueFilter;
  onChange: (id: LeagueFilter) => void;
}

// Display order: All, Iraq, Premier League, La Liga, Champions League, Serie A, Bundesliga, International
const LEAGUE_ORDER: LeagueFilter[] = [
  'all',
  'iraq_stars',
  'premier_league',
  'la_liga',
  'champions_league',
  'serie_a',
  'bundesliga',
  'international',
];

const orderedLeagues = LEAGUE_ORDER.map((id) => leagues.find((l) => l.id === id)).filter(
  (l): l is (typeof leagues)[number] => Boolean(l)
);

export default function LeagueFilterBar({ active, onChange }: LeagueFilterBarProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1" role="group" aria-label="خولەکان">
      {orderedLeagues.map((league) => {
        const isActive = active === league.id;
        return (
          <button
            key={league.id}
            type="button"
            onClick={() => onChange(league.id)}
            aria-pressed={isActive}
            title={league.name}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              isActive
                ? 'bg-accent-500 text-white accent-glow'
                : 'bg-bg-700 text-slatey-300 hover:bg-bg-600 hover:text-white border border-white/5'
            }`}
          >
            <span>{league.nameKu}</span>
          </button>
        );
      })}
    </div>
  );
}
