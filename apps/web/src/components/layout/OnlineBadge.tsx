const COUNT_FORMAT = new Intl.NumberFormat('en-US');

interface OnlineBadgeProps {
  /** Rounded number of players online. Null when it cannot be loaded (ENG-F07 E3). */
  count: number | null;
}

/**
 * Badge with a green dot and the number, for example 1,240 (ENG-F07 R3).
 * It is hidden, never shown as 0, when there is no usable number.
 */
export function OnlineBadge({ count }: OnlineBadgeProps) {
  if (count === null || !Number.isInteger(count) || count < 0) return null;

  const formatted = COUNT_FORMAT.format(count);

  return (
    <span
      role="status"
      aria-label={`${formatted} người chơi đang online`}
      className="flex items-center gap-1.5 rounded-full bg-surface px-2.5 py-1 text-xs font-medium"
    >
      <span aria-hidden="true" className="h-2 w-2 rounded-full bg-success" />
      {formatted}
    </span>
  );
}
