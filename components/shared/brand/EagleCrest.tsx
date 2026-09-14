/**
 * Stylised Shaaneiol eagle crest: gold spread wings around a serif "S".
 * Rendered as inline SVG so it stays crisp at every size the brand lockup uses.
 */
const FEATHERS = [
  "M62 25c15-6 32-7 49-2-15 7-32 9-49 6z",
  "M62 31c14-4 29-3 43 3-14 5-29 5-43 2z",
  "M62 37c12-2 25 0 36 6-13 3-25 2-36-1z",
  "M62 43c10-1 20 2 28 8-11 1-21-1-28-4z",
];

export function EagleCrest({ className }: { className?: string }) {
  const gradientId = "shaaneiol-crest-gold";
  return (
    <svg
      viewBox="0 0 120 66"
      className={className}
      role="img"
      aria-label="Shaaneiol eagle crest"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e3c184" />
          <stop offset="45%" stopColor="#c39a4d" />
          <stop offset="100%" stopColor="#9a7027" />
        </linearGradient>
      </defs>
      <g fill={`url(#${gradientId})`}>
        {/* right wing, then the same feathers mirrored for the left */}
        <g>{FEATHERS.map((d) => <path key={d} d={d} />)}</g>
        <g transform="translate(120 0) scale(-1 1)">
          {FEATHERS.map((d) => <path key={d} d={d} />)}
        </g>
        {/* head, crown and tail of the bird */}
        <path d="M60 6c3.2 0 5.4 2.4 5.4 5.4 0 2-1 3.7-2.6 4.6l4.8 2-5.6 1.6h-4l-5.6-1.6 4.8-2a5.3 5.3 0 0 1-2.6-4.6C54.6 8.4 56.8 6 60 6z" />
        <path d="M56 20h8l3 9c1.6 4.8 1.2 10-1.2 14.4L60 51l-5.8-7.6c-2.4-4.4-2.8-9.6-1.2-14.4z" />
        <path d="M60 52l4.6 5.4L60 62l-4.6-4.6z" />
      </g>
      <text
        x="60"
        y="40"
        textAnchor="middle"
        fill="#8c1225"
        fontFamily="var(--font-wordmark), Georgia, serif"
        fontSize="17"
        fontWeight="700"
      >
        S
      </text>
    </svg>
  );
}
