import React from 'react';

interface CrestLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'dark' | 'gold';
  showSubtitle?: boolean;
}

export const CrestLogo: React.FC<CrestLogoProps> = ({
  size = 'md',
  variant = 'dark',
  showSubtitle = true
}) => {
  const iconSizes = {
    sm: 'w-9 h-9',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  };

  const isLight = variant === 'light';

  return (
    <div className="flex items-center gap-3 shrink-0 select-none">
      {/* Institutional Crest SVG */}
      <div
        className={`${iconSizes[size]} relative shrink-0 flex items-center justify-center rounded-full border ${
          isLight
            ? 'border-[#c59b43]/50 bg-[#162740] shadow-sm'
            : 'border-[#c59b43] bg-[#0c1829] shadow-sm'
        }`}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 100 100"
          className="w-[82%] h-[82%] text-[#c59b43]"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Outer circle accent */}
          <circle cx="50" cy="50" r="46" stroke="#c59b43" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
          <circle cx="50" cy="50" r="41" stroke="#c59b43" strokeWidth="1.2" />

          {/* Scales of Justice Beam & Center Pillar */}
          <line x1="50" y1="20" x2="50" y2="72" stroke="#e6c887" strokeWidth="3" />
          <circle cx="50" cy="18" r="4" fill="#c59b43" stroke="#e6c887" />
          <line x1="28" y1="30" x2="72" y2="30" stroke="#e6c887" strokeWidth="3" />

          {/* Left Pan */}
          <line x1="28" y1="30" x2="22" y2="44" stroke="#c59b43" strokeWidth="1.5" />
          <line x1="28" y1="30" x2="34" y2="44" stroke="#c59b43" strokeWidth="1.5" />
          <path d="M 20 44 Q 28 50 36 44 Z" fill="currentColor" opacity="0.3" stroke="#c59b43" strokeWidth="2" />

          {/* Right Pan */}
          <line x1="72" y1="30" x2="66" y2="44" stroke="#c59b43" strokeWidth="1.5" />
          <line x1="72" y1="30" x2="78" y2="44" stroke="#c59b43" strokeWidth="1.5" />
          <path d="M 64 44 Q 72 50 80 44 Z" fill="currentColor" opacity="0.3" stroke="#c59b43" strokeWidth="2" />

          {/* Open Law Book Base */}
          <path
            d="M 32 72 Q 50 68 50 75 Q 50 68 68 72 L 68 82 Q 50 78 50 84 Q 50 78 32 82 Z"
            fill="currentColor"
            opacity="0.4"
            stroke="#e6c887"
            strokeWidth="2"
          />
          {/* Base Stand */}
          <line x1="38" y1="87" x2="62" y2="87" stroke="#c59b43" strokeWidth="2.5" />
        </svg>
      </div>

      {/* Brand Text */}
      <div className="flex flex-col shrink-0 justify-center">
        <span
          className={`font-crest font-bold leading-tight tracking-wider uppercase whitespace-nowrap ${
            isLight ? 'text-white text-base md:text-lg' : 'text-[#0c1829] text-base md:text-lg'
          }`}
        >
          Legal Aid Society
        </span>
        {showSubtitle && (
          <span
            className={`text-xs font-medium tracking-wide leading-tight whitespace-nowrap mt-0.5 ${
              isLight ? 'text-[#e6c887]/90' : 'text-[#7b1d28]'
            }`}
          >
            Campus Law Centre <span className="text-[#c59b43] font-bold">•</span> University of Delhi
          </span>
        )}
      </div>
    </div>
  );
};
