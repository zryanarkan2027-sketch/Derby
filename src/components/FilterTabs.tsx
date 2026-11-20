import { Calendar, Radio, Clock, CheckCircle } from 'lucide-react';
import type { MatchStatus } from '@/data/matches';

export type FilterTab = 'today' | 'live' | 'upcoming' | 'finished';

interface FilterTabsProps {
  active: FilterTab;
  onChange: (tab: FilterTab) => void;
  counts: Record<FilterTab, number>;
}

const tabs: { id: FilterTab; label: string; icon: typeof Calendar }[] = [
  { id: 'today', label: 'یارییەکانی ئەمڕۆ', icon: Calendar },
  { id: 'live', label: 'LIVE - ڕاستەوخۆ', icon: Radio },
  { id: 'upcoming', label: 'داهاتوو', icon: Clock },
  { id: 'finished', label: 'ئەنجامەکان', icon: CheckCircle },
];

export default function FilterTabs({ active, onChange, counts }: FilterTabsProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = active === tab.id;
        const isLive = tab.id === 'live';
        const count = counts[tab.id];

        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              isActive
                ? isLive
                  ? 'bg-live-500/15 text-live-400 border border-live-500/30 live-glow'
                  : 'bg-accent-500/15 text-accent-400 border border-accent-500/30'
                : 'text-slatey-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{tab.label}</span>
            {isLive && (
              <span className="w-2 h-2 rounded-full bg-live-500 animate-pulse-dot" />
            )}
            {count > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  isActive
                    ? isLive
                      ? 'bg-live-500/20 text-live-400'
                      : 'bg-accent-500/20 text-accent-400'
                    : 'bg-white/5 text-slatey-500'
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function filterToStatus(tab: FilterTab): MatchStatus[] {
  switch (tab) {
    case 'live':
      return ['live'];
    case 'upcoming':
      return ['upcoming'];
    case 'finished':
      return ['finished'];
    case 'today':
      return ['live', 'upcoming', 'finished'];
  }
}
