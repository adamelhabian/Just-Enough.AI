import React from 'react';
import './common.css';

export const BrandLogo = ({ variant = 'dark', height = 40, className = '' }) => {
  const isLight = variant === 'light';
  const textColor = isLight ? '#FFFFFF' : '#1E293B';
  const accentColor = '#199B74'; // Mint / Teal indicator

  return (
    <div
      className={`brand-logo-container ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        height: `${height}px`,
        userSelect: 'none',
        cursor: 'pointer'
      }}
    >
      <svg
        viewBox="0 0 280 100"
        height={height}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block', height: '100%', width: 'auto' }}
      >
        {/* Measuring Cylinder 'J' */}
        <g stroke={textColor} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
          {/* Main J outline: Top stem down and curving left */}
          <path d="M 68 12 L 68 70 C 68 85, 45 88, 30 78 C 22 72, 25 60, 32 60" />
          {/* Top lip of measuring cylinder */}
          <path d="M 52 12 L 84 12" />
          {/* Internal beaker ticks */}
          <path d="M 68 24 L 58 24" strokeWidth="4" />
          <path d="M 68 34 L 62 34" strokeWidth="3" />
          <path d="M 68 44 L 58 44" strokeWidth="4" />
          <path d="M 68 54 L 62 54" strokeWidth="3" />
          <path d="M 68 64 L 58 64" strokeWidth="4" />
        </g>

        {/* Teal Measurement Fill Line across J stem */}
        <line x1="42" y1="44" x2="84" y2="44" stroke={accentColor} strokeWidth="7" strokeLinecap="round" />

        {/* "JUST" Text - Top Row */}
        <text
          x="90"
          y="42"
          fill={textColor}
          fontSize="36"
          fontWeight="800"
          fontFamily="system-ui, -apple-system, sans-serif"
          letterSpacing="0.04em"
        >
          UST
        </text>

        {/* "en" Text - Bottom Row */}
        <text
          x="90"
          y="80"
          fill={textColor}
          fontSize="34"
          fontWeight="700"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          en
        </text>

        {/* OK Hand Gesture Icon replacing the 'o' in enough */}
        <g transform="translate(132, 54) scale(0.85)" stroke={textColor} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
          {/* Circle forming thumb and index finger */}
          <circle cx="14" cy="14" r="8" />
          {/* 3 extended fingers (middle, ring, pinky) */}
          <path d="M 19 8 L 22 2 C 23.5 -0.5, 26.5 1, 25 3.5 L 21 10" />
          <path d="M 22 10 L 27 4 C 28.5 1.5, 31.5 3, 30 5.5 L 24 13" />
          <path d="M 23 14 L 30 9 C 31.5 6.5, 34.5 8, 33 10.5 L 24 18" />
          {/* Wrist / Palm base curve */}
          <path d="M 8 20 C 5 24, 8 28, 14 28 C 20 28, 24 24, 24 20" />
        </g>

        {/* "ugh" Text - Bottom Row after 'o' */}
        <text
          x="166"
          y="80"
          fill={textColor}
          fontSize="34"
          fontWeight="700"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          ugh
        </text>
      </svg>
    </div>
  );
};

export default BrandLogo;
