/**
 * Flag of Việt Nam as an SVG image. A flag emoji does not draw on some systems
 * (for example Windows), so the flag is never an emoji (ENG-F07 R4).
 */
export function VietnamFlag({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 30 20"
      className={className}
      aria-hidden="true"
      focusable="false"
      data-testid="vietnam-flag"
    >
      <rect width="30" height="20" fill="#DA251D" />
      <polygon
        fill="#FFFF00"
        points="15,4 16.39,8.28 20.9,8.28 17.25,10.93 18.64,15.22 15,12.57 11.36,15.22 12.75,10.93 9.1,8.28 13.61,8.28"
      />
    </svg>
  );
}
