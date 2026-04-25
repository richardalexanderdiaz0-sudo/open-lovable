export default function Logo() {
  return (
    <svg
      fill="none"
      height="20"
      viewBox="0 0 100 20"
      width="100"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id="neon-glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <linearGradient id="neon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#b024d0" />
          <stop offset="50%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
      
      {/* Nebulosa de fondo */}
      <circle cx="50" cy="10" r="25" fill="url(#neon-gradient)" opacity="0.1" filter="url(#neon-glow)" />
      
      {/* Texto NEXUS con efecto neon */}
      <text
        x="50"
        y="15"
        fontFamily="Arial, sans-serif"
        fontSize="14"
        fontWeight="bold"
        textAnchor="middle"
        fill="url(#neon-gradient)"
        filter="url(#neon-glow)"
        stroke="#b024d0"
        strokeWidth="0.3"
      >
        NEXUS
      </text>
    </svg>
  );
}
