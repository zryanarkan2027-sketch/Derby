import { ArrowRight, Calendar, Trophy, Users, BarChart3, Info, Shield, Tv, MapPin, CloudSun, User, ExternalLink, PlayCircle } from 'lucide-react';
import { useState } from 'react';
import type { Match } from '@/data/matches';
import TeamLogo from './TeamLogo';
import VideoPlayer from './VideoPlayer';
import { incrementClickCount } from '@/data/streamUrls';
import LineupsTab from './tabs/LineupsTab';
import StatsTab from './tabs/StatsTab';
import MatchInfoTab from './tabs/MatchInfoTab';

interface MatchDetailsProps {
  match: Match;
  onBack: () => void;
}

type TabId = 'lineups' | 'stats' | 'info';

export default function MatchDetails({ match, onBack }: MatchDetailsProps) {
  const [activeTab, setActiveTab] = useState<TabId>('lineups');

  const isLive = match.status === 'live';
  const isFinished = match.status === 'finished';

  const tabs: { id: TabId; label: string; icon: typeof Users }[] = [
    { id: 'lineups', label: 'پێکهاتە', icon: Users },
    { id: 'stats', label: 'ئامارەکان', icon: BarChart3 },
    { id: 'info', label: 'زانیاری یاری', icon: Info },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-fade-in">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slatey-400 hover:text-white transition-colors mb-4 text-sm font-medium"
      >
        <ArrowRight className="w-4 h-4" />
        گەڕانەوە بۆ لیستی یارییەکان
      </button>

      {/* Scoreboard header */}
      <div className="glass-card p-6 sm:p-8 mb-6">
        {/* League + status */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-sm text-slatey-400">
            <Trophy className="w-4 h-4" />
            {match.leagueName}
          </div>
          {isLive && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-live-500/15 text-live-400 text-xs font-bold live-glow">
              <span className="w-2 h-2 rounded-full bg-live-500 animate-pulse-dot" />
              {match.liveMinute}' - ڕاستەوخۆ
            </span>
          )}
          {isFinished && (
            <span className="px-3 py-1 rounded-full bg-slatey-600/30 text-slatey-400 text-xs font-bold">
              کۆتایی هات
            </span>
          )}
          {!isLive && !isFinished && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-500/10 text-accent-400 text-xs font-bold">
              <Calendar className="w-3.5 h-3.5" />
              کاتژمێر {match.kickoffTime}
            </span>
          )}
        </div>

        {/* Teams + score */}
        <div className="flex items-center justify-between gap-4">
          {/* Home team */}
          <div className="flex flex-col items-center gap-3 flex-1">
            <TeamLogo team={match.homeTeam} size={72} />
            <span className="text-base sm:text-lg font-bold text-white text-center">
              {match.homeTeam.name}
            </span>
          </div>

          {/* Score / time */}
          <div className="flex flex-col items-center gap-1">
            {isLive || isFinished ? (
              <div className="flex items-center gap-3 text-4xl sm:text-5xl font-bold">
                <span className={isLive ? 'text-accent-400' : 'text-white'}>
                  {match.homeScore}
                </span>
                <span className="text-slatey-600 text-3xl">-</span>
                <span className={isLive ? 'text-accent-400' : 'text-white'}>
                  {match.awayScore}
                </span>
              </div>
            ) : (
              <div className="text-3xl sm:text-4xl font-bold text-slatey-300">
                {match.kickoffTime}
              </div>
            )}
            <span className="text-xs text-slatey-500 font-medium">
              {isLive ? `${match.liveMinute}'` : isFinished ? 'کۆتایی هات' : 'VS'}
            </span>
          </div>

          {/* Away team */}
          <div className="flex flex-col items-center gap-3 flex-1">
            <TeamLogo team={match.awayTeam} size={72} />
            <span className="text-base sm:text-lg font-bold text-white text-center">
              {match.awayTeam.name}
            </span>
          </div>
        </div>
      </div>

      {/* Video Player */}
      <VideoPlayer
        streamUrl={match.streamUrl}
        matchTitle={`${match.homeTeam.name} vs ${match.awayTeam.name}`}
      />

      {/* Official Affiliate Watch Button */}
      {match.affiliateUrl && match.affiliateUrl.trim().length > 0 && (
        <div className="mb-6 mt-4">
          <button
            onClick={() => {
              incrementClickCount(match.id);
              window.open(match.affiliateUrl, '_blank', 'noopener,noreferrer');
            }}
            className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-accent-500 via-accent-400 to-warning-400 px-6 py-4 shadow-lg shadow-accent-500/20 transition-all hover:shadow-accent-500/40 hover:scale-[1.01] active:scale-[0.99]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            <div className="relative flex items-center justify-center gap-3">
              <PlayCircle className="w-6 h-6 text-white shrink-0" />
              <span className="text-white font-bold text-sm sm:text-base text-center leading-tight">
                سەیرکردنی ڕاستەوخۆ بە کوالێتی HD لەسەر {match.platformName || 'پلاتفۆرمی فەرمی'}
              </span>
              <ExternalLink className="w-4 h-4 text-white/80 shrink-0" />
            </div>
          </button>
        </div>
      )}

      {/* Info tabs */}
      <div className="mt-6">
        {/* Tab buttons */}
        <div className="flex items-center gap-2 mb-4 border-b border-white/5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                  isActive
                    ? 'border-accent-500 text-accent-400'
                    : 'border-transparent text-slatey-400 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div className="animate-fade-in">
          {activeTab === 'lineups' && <LineupsTab match={match} />}
          {activeTab === 'stats' && <StatsTab match={match} />}
          {activeTab === 'info' && <MatchInfoTab match={match} />}
        </div>
      </div>
    </div>
  );
}
