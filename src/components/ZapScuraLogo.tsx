/**
 * ZapScura Logo — Lightning bolt + shield with orbital rings.
 */

interface Props {
  size?: number;
  glow?: boolean;
  animated?: boolean;
  color?: string;
}

export default function ZapScuraLogo({ size = 32, glow = false, animated = false, color = '#3b82f6' }: Props) {
  return (
    <div
      className={animated ? 'zap-logo-animated' : undefined}
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
          filter: glow ? `drop-shadow(0 0 8px ${color}80) drop-shadow(0 0 20px ${color}40)` : undefined,
        }}
      >
        {/* Shield outline */}
        <path
          d="M20 3L5 10v10c0 9.55 6.4 18.48 15 20.7 8.6-2.22 15-11.15 15-20.7V10L20 3z"
          fill={`${color}15`}
          stroke={color}
          strokeWidth="1.5"
          opacity="0.9"
        />
        {/* Lightning bolt */}
        <path
          d="M22 8L13 22h6l-2 10 11-14h-6l2-10z"
          fill={color}
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="0.5"
        />
      </svg>
    </div>
  );
}

export const logoStyles = `
  @keyframes logo-pulse {
    0%, 100% {
      filter: drop-shadow(0 0 6px rgba(59,130,246,0.4));
    }
    50% {
      filter: drop-shadow(0 0 14px rgba(59,130,246,0.7));
    }
  }
  .zap-logo-animated svg {
    animation: logo-pulse 3s ease-in-out infinite;
  }
`;
