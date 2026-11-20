import { MapPin, User, Tv, Users, CloudSun } from 'lucide-react';
import type { Match } from '@/data/matches';

interface MatchInfoTabProps {
  match: Match;
}

export default function MatchInfoTab({ match }: MatchInfoTabProps) {
  const info = match.info;

  const items = [
    { icon: MapPin, label: 'یاریگا', value: info?.stadium || match.venue || '—' },
    { icon: User, label: 'نەوابە', value: info?.referee || match.referee || '—' },
    { icon: Tv, label: 'کەناڵی پەخش', value: info?.channel || '—' },
    { icon: Users, label: 'ژمارەی ئامادەبووان', value: info?.attendance || '—' },
    { icon: CloudSun, label: 'کەشوهەوا', value: info?.weather || '—' },
  ];

  return (
    <div className="glass-card divide-y divide-white/5">
      {items.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div key={idx} className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-bg-600 flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5 text-accent-400" />
            </div>
            <span className="text-sm text-slatey-400 min-w-[100px]">{item.label}</span>
            <span className="text-sm font-medium text-white">{item.value}</span>
          </div>
        );
      })}
    </div>
  );
}
