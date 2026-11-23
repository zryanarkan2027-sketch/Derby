import { useState } from 'react';
import { Search, Menu, X, Trophy, Radio, Home, Volume2, VolumeX } from 'lucide-react';
import Logo from '@/components/Logo';

interface HeaderProps {
  onNavigate: (page: 'home' | 'leagues' | 'live') => void;
  onSearch: (query: string) => void;
  searchQuery: string;
  /** Goal sound on/off (optional) */
  soundOn?: boolean;
  onToggleSound?: () => void;
}

export default function Header({
  onNavigate,
  onSearch,
  searchQuery,
  soundOn = false,
  onToggleSound,
}: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { id: 'home' as const, label: 'سەرەکی', icon: Home },
    { id: 'leagues' as const, label: 'خولەکان', icon: Trophy },
    { id: 'live' as const, label: 'پەخشی ڕاستەوخۆ', icon: Radio },
  ];

  return (
    <header className="sticky top-0 z-50 bg-bg-800/95 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <button
            onClick={() => onNavigate('home')}
            aria-label="Derby"
            className="shrink-0 transition-transform hover:scale-105"
          >
            <Logo height={36} />
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-slatey-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.id === 'live' && (
                    <span className="w-2 h-2 rounded-full bg-live-500 animate-pulse-dot" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Search */}
          <div className="flex-1 max-w-xs hidden sm:block">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slatey-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearch(e.target.value)}
                placeholder="گەڕان بۆ یاری یان تیم..."
                className="w-full bg-bg-600 border border-white/5 rounded-lg pr-10 pl-4 py-2 text-sm text-white placeholder:text-slatey-400 focus:outline-none focus:border-accent-500/50 transition-colors"
              />
            </div>
          </div>

          {/* Goal sound toggle */}
          {onToggleSound && (
            <button
              onClick={onToggleSound}
              aria-pressed={soundOn}
              aria-label={soundOn ? 'کوژاندنەوەی دەنگی گۆڵ' : 'چالاککردنی دەنگی گۆڵ'}
              title={soundOn ? 'دەنگی گۆڵ: چالاکە' : 'دەنگی گۆڵ: کوژاوەیە'}
              className={`shrink-0 flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${
                soundOn
                  ? 'bg-accent-500/15 text-accent-400 hover:bg-accent-500/25'
                  : 'text-slatey-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              {soundOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg text-slatey-300 hover:bg-white/5"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 animate-fade-in">
            <div className="relative mb-3">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slatey-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearch(e.target.value)}
                placeholder="گەڕان..."
                className="w-full bg-bg-600 border border-white/5 rounded-lg pr-10 pl-4 py-2 text-sm text-white placeholder:text-slatey-400 focus:outline-none focus:border-accent-500/50"
              />
            </div>
            <div className="flex flex-col gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      setMobileOpen(false);
                    }}
                    className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-slatey-300 hover:text-white hover:bg-white/5"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                    {item.id === 'live' && (
                      <span className="w-2 h-2 rounded-full bg-live-500 animate-pulse-dot" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
