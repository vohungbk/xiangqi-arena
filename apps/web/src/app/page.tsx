import { Swords } from 'lucide-react';
import { GameMode } from '@xiangqi/shared-types';

export default function HomePage() {
  return (
    <main className="mx-auto flex max-w-xl flex-col items-center gap-6 p-10">
      <Swords className="h-12 w-12" />
      <h1 className="text-3xl font-bold">Xiangqi Arena</h1>
      <p className="text-fg-muted">Modes: {Object.values(GameMode).join(' / ')}</p>
    </main>
  );
}
