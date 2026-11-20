import type { Match, LineupPlayer } from '@/data/matches';
import TeamLogo from '../TeamLogo';

interface LineupsTabProps {
  match: Match;
}

export default function LineupsTab({ match }: LineupsTabProps) {
  const homeLineup = match.homeLineup;
  const awayLineup = match.awayLineup;

  if (!homeLineup || !awayLineup) {
    return (
      <div className="glass-card p-8 text-center">
        <p className="text-slatey-400">
          پێکهاتەی ئەم یارییە هێشتا بەردەست نییە
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Formations */}
      <div className="flex items-center justify-between px-2">
        <span className="text-sm font-bold text-accent-400">
          {match.homeTeam.shortName} — {homeLineup.formation}
        </span>
        <span className="text-sm font-bold text-accent-400">
          {awayLineup.formation} — {match.awayTeam.shortName}
        </span>
      </div>

      {/* Split view: home | away */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/5">
            <TeamLogo team={match.homeTeam} size={32} />
            <span className="text-sm font-bold text-white">{match.homeTeam.name}</span>
          </div>
          <PlayerList players={homeLineup.players} accentColor="text-accent-400" />
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/5">
            <TeamLogo team={match.awayTeam} size={32} />
            <span className="text-sm font-bold text-white">{match.awayTeam.name}</span>
          </div>
          <PlayerList players={awayLineup.players} accentColor="text-accent-400" />
        </div>
      </div>
    </div>
  );
}

function PlayerList({
  players,
  accentColor,
}: {
  players: LineupPlayer[];
  accentColor: string;
}) {
  return (
    <div className="space-y-1">
      {players.map((player, idx) => (
        <div
          key={idx}
          className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-white/5 transition-colors"
        >
          <span
            className={`flex items-center justify-center w-7 h-7 rounded-full bg-bg-600 text-xs font-bold ${accentColor}`}
          >
            {player.number}
          </span>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium text-white truncate">{player.name}</span>
            <span className="text-[10px] text-slatey-500">{player.position}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
