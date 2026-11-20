import type { Match } from '@/data/matches';

interface StatsTabProps {
  match: Match;
}

interface StatRowProps {
  label: string;
  home: number;
  away: number;
  unit?: string;
}

function StatRow({ label, home, away, unit }: StatRowProps) {
  const total = home + away;
  const homePct = total > 0 ? (home / total) * 100 : 50;
  const awayPct = total > 0 ? (away / total) * 100 : 50;
  const homeHigher = home > away;
  const awayHigher = away > home;

  return (
    <div className="py-3">
      <div className="flex items-center justify-between mb-1.5">
        <span className={`text-sm font-bold ${homeHigher ? 'text-accent-400' : 'text-white'}`}>
          {home}{unit && ` ${unit}`}
        </span>
        <span className="text-xs text-slatey-400 font-medium">{label}</span>
        <span className={`text-sm font-bold ${awayHigher ? 'text-accent-400' : 'text-white'}`}>
          {away}{unit && ` ${unit}`}
        </span>
      </div>
      <div className="flex items-center gap-1 h-2 rounded-full overflow-hidden bg-bg-600">
        <div
          className="h-full bg-accent-500 transition-all rounded-r-full"
          style={{ width: `${homePct}%` }}
        />
        <div
          className="h-full bg-slatey-600 transition-all rounded-l-full"
          style={{ width: `${awayPct}%` }}
        />
      </div>
    </div>
  );
}

export default function StatsTab({ match }: StatsTabProps) {
  if (!match.stats) {
    return (
      <div className="glass-card p-8 text-center">
        <p className="text-slatey-400">ئامارەکان بەردەست نییە بۆ ئەم یارییە</p>
      </div>
    );
  }

  const s = match.stats;

  return (
    <div className="space-y-4">
      {/* Goals summary */}
      {match.goals && match.goals.length > 0 && (
        <div className="glass-card p-4">
          <h3 className="text-sm font-bold text-slatey-300 mb-3">گۆڵەکانی یاری</h3>
          <div className="grid grid-cols-2 gap-4">
            {/* Home goals */}
            <div className="space-y-2">
              {match.goals
                .filter((g) => g.team === 'home')
                .map((g, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span className="text-xs font-bold text-accent-400 w-8 shrink-0">
                      {g.minute}'
                    </span>
                    <span className="text-white">⚽ {g.name}</span>
                    {g.penalty && (
                      <span className="text-[10px] text-slatey-500">(پەنالتی)</span>
                    )}
                  </div>
                ))}
              {match.goals.filter((g) => g.team === 'home').length === 0 && (
                <span className="text-xs text-slatey-500">—</span>
              )}
            </div>
            {/* Away goals */}
            <div className="space-y-2 text-left">
              {match.goals
                .filter((g) => g.team === 'away')
                .map((g, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm justify-end">
                    {g.penalty && (
                      <span className="text-[10px] text-slatey-500">(پەنالتی)</span>
                    )}
                    <span className="text-white">{g.name} ⚽</span>
                    <span className="text-xs font-bold text-accent-400 w-8 shrink-0">
                      {g.minute}'
                    </span>
                  </div>
                ))}
              {match.goals.filter((g) => g.team === 'away').length === 0 && (
                <span className="text-xs text-slatey-500">—</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stats bars */}
      <div className="glass-card p-4 sm:p-5">
        <div className="flex items-center justify-center mb-2 pb-3 border-b border-white/5">
          <span className="text-xs font-bold text-slatey-400">ئامارەکانی یاری</span>
        </div>
        <StatRow label="گرتنی تۆپ" home={s.possession[0]} away={s.possession[1]} unit="%" />
        <StatRow label="شووتەکان" home={s.shots[0]} away={s.shots[1]} />
        <StatRow label="شووتی ڕاست" home={s.shotsOnTarget[0]} away={s.shotsOnTarget[1]} />
        <StatRow label="گۆشە" home={s.corners[0]} away={s.corners[1]} />
        <StatRow label="هەڵە" home={s.fouls[0]} away={s.fouls[1]} />
        <StatRow label="کارتە زەرد" home={s.yellowCards[0]} away={s.yellowCards[1]} />
        <StatRow label="کارتە سوور" home={s.redCards[0]} away={s.redCards[1]} />
        <StatRow label="ئۆفساید" home={s.offsides[0]} away={s.offsides[1]} />
      </div>
    </div>
  );
}
