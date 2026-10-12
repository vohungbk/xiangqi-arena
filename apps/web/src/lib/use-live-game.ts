'use client';

import { useEffect } from 'react';
import { useShellStore } from '@/store/useShellStore';

/**
 * Marks the screen as a live game (ENG-F07 R13-R15). A live online, AI or local game screen
 * calls it with `active` true while the game runs and false when the game is over. The shell
 * then shows the in-game bar, and the full shell comes back when the game ends or when the
 * screen goes away (Back, a redirect). Pages such as the analysis, the replay, the setup and the
 * search do not call it, so they keep the full shell.
 */
export function useLiveGame(active = true): void {
  useEffect(() => {
    if (!active) return;
    const { enterLiveGame, leaveLiveGame } = useShellStore.getState();
    enterLiveGame();
    return leaveLiveGame;
  }, [active]);
}
