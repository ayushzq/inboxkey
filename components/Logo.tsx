export default function Logo({ size = 34 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2.5">
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="logoGrad" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="50%" stopColor="#22D3EE" />
            <stop offset="100%" stopColor="#F472B6" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="44" height="44" rx="14" fill="url(#logoGrad)" fillOpacity="0.18" />
        <rect
          x="2.5"
          y="2.5"
          width="43"
          height="43"
          rx="13.5"
          stroke="url(#logoGrad)"
          strokeWidth="1.4"
        />
        <path
          d="M19 15.5C19 14.4 20.2 13.7 21.1 14.3L33.2 22.8C34.1 23.4 34.1 24.6 33.2 25.2L21.1 33.7C20.2 34.3 19 33.6 19 32.5V15.5Z"
          fill="url(#logoGrad)"
        />
      </svg>
      <span className="font-display font-semibold text-lg tracking-tight text-ink">
        Glassreel
      </span>
    </div>
  );
}
