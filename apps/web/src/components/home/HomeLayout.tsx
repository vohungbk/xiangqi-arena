import type { ReactNode } from 'react';
import { TopFiveSlot } from './TopFiveSlot';

/**
 * Layout and structure of the Home page "Trang Chủ" (called "Tổng quan" in the design),
 * owned by ENG-F07 (R28). The same page shows for a Guest and for a logged-in player.
 * The visual design of the dashboard is not known yet (ENG-F07-S22-ASM01), so this is
 * only the structure: a title and a place for each widget.
 */
export function HomeLayout({ topFive }: { topFive?: ReactNode }) {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6">
      <h1 className="text-2xl font-bold">Tổng quan</h1>
      <TopFiveSlot>{topFive}</TopFiveSlot>
    </main>
  );
}
