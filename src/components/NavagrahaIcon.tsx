import React from 'react';

export interface NavagrahaMeta {
  symbol: string;
  sanskritName: string;
  englishName: string;
  yantraMotif: string;
  primaryHex: string;
  secondaryHex: string;
  bgClass: string;
  borderClass: string;
}

export const NAVAGRAHA_METADATA: Record<string, NavagrahaMeta> = {
  Su: {
    symbol: 'Su',
    sanskritName: 'Surya',
    englishName: 'Sun',
    yantraMotif: 'Solar Bindu & 12 Aditya Rays',
    primaryHex: '#f59e0b',
    secondaryHex: '#fde68a',
    bgClass: 'bg-amber-950/90',
    borderClass: 'border-amber-500/60',
  },
  Mo: {
    symbol: 'Mo',
    sanskritName: 'Chandra',
    englishName: 'Moon',
    yantraMotif: 'Soma Crescent & Lotus Bindu',
    primaryHex: '#e2e8f0',
    secondaryHex: '#7dd3fc',
    bgClass: 'bg-slate-900',
    borderClass: 'border-sky-400/60',
  },
  Ma: {
    symbol: 'Ma',
    sanskritName: 'Mangala',
    englishName: 'Mars',
    yantraMotif: 'Agni Upward Trikona & Spear',
    primaryHex: '#ef4444',
    secondaryHex: '#fca5a5',
    bgClass: 'bg-red-950/90',
    borderClass: 'border-red-500/60',
  },
  Me: {
    symbol: 'Me',
    sanskritName: 'Budha',
    englishName: 'Mercury',
    yantraMotif: 'Vishnu Emerald Bow & Caduceus',
    primaryHex: '#10b981',
    secondaryHex: '#6ee7b7',
    bgClass: 'bg-emerald-950/90',
    borderClass: 'border-emerald-500/60',
  },
  Ju: {
    symbol: 'Ju',
    sanskritName: 'Brihaspati',
    englishName: 'Jupiter',
    yantraMotif: 'Guru Octagonal Mandala & Halo',
    primaryHex: '#eab308',
    secondaryHex: '#fef08a',
    bgClass: 'bg-yellow-950/90',
    borderClass: 'border-yellow-500/60',
  },
  Ve: {
    symbol: 'Ve',
    sanskritName: 'Shukra',
    englishName: 'Venus',
    yantraMotif: 'Ashta-Lakshmi 8-Pointed Star',
    primaryHex: '#ec4899',
    secondaryHex: '#f9a8d4',
    bgClass: 'bg-pink-950/90',
    borderClass: 'border-pink-500/60',
  },
  Sa: {
    symbol: 'Sa',
    sanskritName: 'Shani',
    englishName: 'Saturn',
    yantraMotif: 'Kala Chakra Ring & Balance',
    primaryHex: '#3b82f6',
    secondaryHex: '#93c5fd',
    bgClass: 'bg-blue-950/90',
    borderClass: 'border-blue-500/60',
  },
  Ra: {
    symbol: 'Ra',
    sanskritName: 'Rahu',
    englishName: 'North Node',
    yantraMotif: 'Ascending Eclipse Corona',
    primaryHex: '#8b5cf6',
    secondaryHex: '#c4b5fd',
    bgClass: 'bg-violet-950/90',
    borderClass: 'border-violet-500/60',
  },
  Ke: {
    symbol: 'Ke',
    sanskritName: 'Ketu',
    englishName: 'South Node',
    yantraMotif: 'Moksha Dhwaja Flag & Comet',
    primaryHex: '#f97316',
    secondaryHex: '#fdba74',
    bgClass: 'bg-orange-950/90',
    borderClass: 'border-orange-500/60',
  },
};

export const NINE_NAVAGRAHA_SYMBOLS = [
  'Su',
  'Mo',
  'Ma',
  'Me',
  'Ju',
  'Ve',
  'Sa',
  'Ra',
  'Ke',
] as const;

/**
 * Draws the minimalist sacred-geometry Navagraha glyph onto an HTML5 2D Canvas context
 * so the 3D WebGL floating sprites and 2D/3D UI share identical planetary iconography.
 */
export function drawNavagrahaCanvasIcon(
  ctx: CanvasRenderingContext2D,
  symbol: string,
  cx: number,
  cy: number,
  radius: number
): void {
  const meta = NAVAGRAHA_METADATA[symbol] || NAVAGRAHA_METADATA.Su;
  ctx.save();
  ctx.strokeStyle = meta.primaryHex;
  ctx.fillStyle = meta.secondaryHex;
  ctx.lineWidth = Math.max(2, radius * 0.12);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  switch (symbol) {
    case 'Su': {
      // Solar circle + center bindu + 8 minimalist rays
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.52, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.16, 0, Math.PI * 2);
      ctx.fill();
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * radius * 0.68, cy + Math.sin(a) * radius * 0.68);
        ctx.lineTo(cx + Math.cos(a) * radius * 0.92, cy + Math.sin(a) * radius * 0.92);
        ctx.stroke();
      }
      break;
    }
    case 'Mo': {
      // Crescent arc + inner pearl dot
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.68, 0.35 * Math.PI, 1.65 * Math.PI);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx + radius * 0.22, cy, radius * 0.16, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'Ma': {
      // Upward sacred Agni triangle + vertical spear axis
      ctx.beginPath();
      ctx.moveTo(cx, cy - radius * 0.78);
      ctx.lineTo(cx + radius * 0.68, cy + radius * 0.58);
      ctx.lineTo(cx - radius * 0.68, cy + radius * 0.58);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy + radius * 0.18, radius * 0.14, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'Me': {
      // Geometric bow / winged crescent + vertical caduceus axis
      ctx.beginPath();
      ctx.moveTo(cx, cy - radius * 0.78);
      ctx.lineTo(cx, cy + radius * 0.78);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy - radius * 0.15, radius * 0.55, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy - radius * 0.5, radius * 0.14, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'Ju': {
      // Guru diamond-octagon mandala + inner bindu
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.66, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, cy - radius * 0.66);
      ctx.lineTo(cx + radius * 0.66, cy);
      ctx.lineTo(cx, cy + radius * 0.66);
      ctx.lineTo(cx - radius * 0.66, cy);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.16, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'Ve': {
      // 8-pointed diamond star yantra
      for (let rot = 0; rot < 2; rot++) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate((rot * Math.PI) / 4);
        ctx.strokeRect(-radius * 0.46, -radius * 0.46, radius * 0.92, radius * 0.92);
        ctx.restore();
      }
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.14, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'Sa': {
      // Ringed sphere + tilted ellipse ring
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.42, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(cx, cy, radius * 0.86, radius * 0.28, -0.35, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }
    case 'Ra': {
      // Ascending lunar node arch + eclipse nodes
      ctx.beginPath();
      ctx.arc(cx, cy + radius * 0.1, radius * 0.62, Math.PI, 0, false);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx - radius * 0.62, cy + radius * 0.1, radius * 0.14, 0, Math.PI * 2);
      ctx.arc(cx + radius * 0.62, cy + radius * 0.1, radius * 0.14, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'Ke':
    default: {
      // Descending node / Moksha flag yantra
      ctx.beginPath();
      ctx.arc(cx, cy - radius * 0.1, radius * 0.62, 0, Math.PI, false);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, cy + radius * 0.52);
      ctx.lineTo(cx, cy - radius * 0.68);
      ctx.lineTo(cx + radius * 0.42, cy - radius * 0.42);
      ctx.lineTo(cx, cy - radius * 0.2);
      ctx.stroke();
      break;
    }
  }

  ctx.restore();
}

interface NavagrahaIconProps {
  symbol: string;
  size?: 'sm' | 'md' | 'lg';
  active?: boolean;
}

export const NavagrahaIcon: React.FC<NavagrahaIconProps> = ({
  symbol,
  size = 'md',
  active = false,
}) => {
  const meta = NAVAGRAHA_METADATA[symbol] || NAVAGRAHA_METADATA.Su;
  const dim = size === 'sm' ? 28 : size === 'lg' ? 44 : 36;

  return (
    <div
      title={`${meta.sanskritName} (${meta.englishName}) — ${meta.yantraMotif}`}
      className={`inline-flex items-center justify-center rounded-lg border shrink-0 transition-transform ${
        meta.bgClass
      } ${active ? 'border-amber-300 ring-2 ring-amber-400/50 scale-105' : meta.borderClass}`}
      style={{ width: dim, height: dim }}
    >
      <svg
        width={dim - 6}
        height={dim - 6}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label={`${meta.sanskritName} (${meta.englishName}) minimalist Vedic icon`}
      >
        {symbol === 'Su' && (
          <>
            <circle cx="20" cy="20" r="8.5" stroke={meta.primaryHex} strokeWidth="2.2" />
            <circle cx="20" cy="20" r="2.8" fill={meta.secondaryHex} />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
              const rad = (deg * Math.PI) / 180;
              return (
                <line
                  key={deg}
                  x1={20 + Math.cos(rad) * 11.5}
                  y1={20 + Math.sin(rad) * 11.5}
                  x2={20 + Math.cos(rad) * 15.5}
                  y2={20 + Math.sin(rad) * 15.5}
                  stroke={meta.primaryHex}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              );
            })}
          </>
        )}

        {symbol === 'Mo' && (
          <>
            <path
              d="M24.5 9.5C18.2 10.2 13.5 15.5 13.5 22C13.5 28.5 18.2 33.8 24.5 34.5C16.5 35.5 9.5 29.5 9.5 21.5C9.5 13.5 16.5 8.5 24.5 9.5Z"
              stroke={meta.primaryHex}
              strokeWidth="2.2"
              strokeLinejoin="round"
            />
            <circle cx="25.5" cy="19.5" r="3" fill={meta.secondaryHex} />
          </>
        )}

        {symbol === 'Ma' && (
          <>
            <polygon
              points="20,7 32,30 8,30"
              stroke={meta.primaryHex}
              strokeWidth="2.2"
              strokeLinejoin="round"
            />
            <line
              x1="20"
              y1="13"
              x2="20"
              y2="30"
              stroke={meta.secondaryHex}
              strokeWidth="1.8"
            />
            <circle cx="20" cy="23" r="2.5" fill={meta.secondaryHex} />
          </>
        )}

        {symbol === 'Me' && (
          <>
            <path
              d="M11 15C13.5 20.5 26.5 20.5 29 15"
              stroke={meta.primaryHex}
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <line
              x1="20"
              y1="8"
              x2="20"
              y2="32"
              stroke={meta.primaryHex}
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <line
              x1="14"
              y1="26"
              x2="26"
              y2="26"
              stroke={meta.secondaryHex}
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="20" cy="11" r="2.5" fill={meta.secondaryHex} />
          </>
        )}

        {symbol === 'Ju' && (
          <>
            <circle cx="20" cy="20" r="12" stroke={meta.primaryHex} strokeWidth="2" />
            <polygon
              points="20,8 32,20 20,32 8,20"
              stroke={meta.secondaryHex}
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            <circle cx="20" cy="20" r="3" fill={meta.primaryHex} />
          </>
        )}

        {symbol === 'Ve' && (
          <>
            <rect
              x="11"
              y="11"
              width="18"
              height="18"
              stroke={meta.primaryHex}
              strokeWidth="2"
            />
            <rect
              x="11"
              y="11"
              width="18"
              height="18"
              transform="rotate(45 20 20)"
              stroke={meta.secondaryHex}
              strokeWidth="2"
            />
            <circle cx="20" cy="20" r="2.6" fill={meta.primaryHex} />
          </>
        )}

        {symbol === 'Sa' && (
          <>
            <circle cx="20" cy="20" r="7" stroke={meta.primaryHex} strokeWidth="2.2" />
            <ellipse
              cx="20"
              cy="20"
              rx="15"
              ry="5.2"
              transform="rotate(-22 20 20)"
              stroke={meta.secondaryHex}
              strokeWidth="2"
            />
            <circle cx="20" cy="20" r="2.2" fill={meta.secondaryHex} />
          </>
        )}

        {symbol === 'Ra' && (
          <>
            <path
              d="M10 26C10 17 14.5 11 20 11C25.5 11 30 17 30 26"
              stroke={meta.primaryHex}
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <circle cx="10" cy="26" r="2.8" fill={meta.secondaryHex} />
            <circle cx="30" cy="26" r="2.8" fill={meta.secondaryHex} />
            <circle cx="20" cy="19" r="2.2" fill={meta.primaryHex} />
          </>
        )}

        {(symbol === 'Ke' || !NAVAGRAHA_METADATA[symbol]) && (
          <>
            <path
              d="M11 15C11 22.5 15 27 20 27C25 27 29 22.5 29 15"
              stroke={meta.primaryHex}
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <path
              d="M20 31V9L28 13L20 17"
              stroke={meta.secondaryHex}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        )}
      </svg>
    </div>
  );
};
