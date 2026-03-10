/**
 * ZapScura Logo — Lightning bolt + shield combo.
 */

interface Props {
  size?: number;
  glow?: boolean;
  animated?: boolean;
}

export default function ZapScuraLogo({ size = 32, glow = false, animated = false }: Props) {
  return (
    <div
      style={{
        width: size,
        height: size,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          filter: glow ? 'drop-shadow(0 0 8px rgba(14,165,233,0.5)) drop-shadow(0 0 16px rgba(217,70,239,0.3))' : undefined,
          animation: animated ? 'logo-pulse 3s ease-in-out infinite' : undefined,
        }}
      >
        {/* Shield outline */}
        <path
          d="M20 3L5 10v10c0 9.55 6.4 18.48 15 20.7 8.6-2.22 15-11.15 15-20.7V10L20 3z"
          fill="url(#shield-gradient)"
          stroke="url(#stroke-gradient)"
          strokeWidth="1.5"
          opacity="0.9"
        />
        {/* Lightning bolt */}
        <path
          d="M22 8L13 22h6l-2 10 11-14h-6l2-10z"
          fill="url(#bolt-gradient)"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="0.5"
        />
        <defs>
          <linearGradient id="shield-gradient" x1="5" y1="3" x2="35" y2="33">
            <stop offset="0%" stopColor="rgba(14,165,233,0.15)" />
            <stop offset="100%" stopColor="rgba(217,70,239,0.15)" />
          </linearGradient>
          <linearGradient id="stroke-gradient" x1="5" y1="3" x2="35" y2="33">
            <stop offset="0%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="#d946ef" />
          </linearGradient>
          <linearGradient id="bolt-gradient" x1="13" y1="8" x2="28" y2="32">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="50%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="#d946ef" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

export const logoStyles = `
  @keyframes logo-pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
`;
