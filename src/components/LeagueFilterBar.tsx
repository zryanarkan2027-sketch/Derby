import { leagues, type LeagueId } from '@/data/matches';

interface LeagueFilterBarProps {
  active: LeagueId;
  onChange: (id: LeagueId) => void;
}

export default function LeagueFilterBar({ active, onChange }: LeagueFilterBarProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
      {leagues.map((league) => {
        const isActive = active === league.id;
        return (
          <button
            key={league.id}
            onClick={() => onChange(league.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              isActive
                ? 'bg-accent-500 text-white accent-glow'
                : 'bg-bg-700 text-slatey-300 hover:bg-bg-600 hover:text-white border border-white/5'
            }`}
          >
            <span className="text-base leading-none">{league.icon}</span>
            <span>{league.name}</span>
          </button>
        );
      })}
    </div>
  );
}
