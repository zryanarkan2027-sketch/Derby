import { useState } from 'react';

interface TeamLogoProps {
  team: { logoColor: string; logoText: string; name: string; crest?: string };
  size?: number;
}

export default function TeamLogo({ team, size = 48 }: TeamLogoProps) {
  const isLight = team.logoColor === '#ffffff' || team.logoColor === '#fde100';
  const [crestFailed, setCrestFailed] = useState(false);

  if (team.crest && !crestFailed) {
    return (
      <img
        src={team.crest}
        alt={team.name}
        className="object-contain rounded-full bg-white/95 p-0.5 shrink-0"
        style={{ width: size, height: size }}
        loading="lazy"
        onError={() => setCrestFailed(true)}
      />
    );
  }

  return (
    <div
      className="flex items-center justify-center rounded-full border-2 shrink-0 font-bold"
      style={{
        width: size,
        height: size,
        backgroundColor: team.logoColor,
        color: isLight ? '#0a0e14' : '#ffffff',
        borderColor: isLight ? '#334155' : 'rgba(255,255,255,0.15)',
        fontSize: size * 0.3,
      }}
      title={team.name}
    >
      {team.logoText}
    </div>
  );
}
