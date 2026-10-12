import type { ReactNode } from 'react';

const EMPTY_TEXT = 'Bảng xếp hạng sẽ hiển thị ở đây.';

/**
 * Place of the widget "Top 5 Bảng xếp hạng" on Home (ENG-F07 R28).
 * The shell only keeps the place. The data, the logic and the API of the widget are owned by
 * LB-F01 (R22), which passes the widget as `children`. This slot does not fetch anything.
 */
export function TopFiveSlot({ children }: { children?: ReactNode }) {
  return (
    <section
      aria-labelledby="home-top-five-title"
      className="rounded-lg border border-line-card bg-surface p-4"
    >
      <h2 id="home-top-five-title" className="text-lg font-semibold">
        Top 5 Bảng xếp hạng
      </h2>
      <div className="mt-3">
        {children ?? <p className="text-sm text-fg-muted">{EMPTY_TEXT}</p>}
      </div>
    </section>
  );
}
