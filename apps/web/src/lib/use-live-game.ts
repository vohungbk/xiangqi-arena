'use client';

import { useEffect, useRef } from 'react';
import { useShellStore } from '@/store/useShellStore';
import type { LiveGameKind } from './live-game-kind';

interface LiveGameOptions {
  /** The kind of game. The shell picks the leave modal from it (ENG-F07 R17). */
  kind?: LiveGameKind;
  /**
   * Called once when the player confirms the leave in the leave modal, before the shell goes
   * to another page. An AI or local game screen drops its unfinished game here, so it is not
   * saved (R17).
   */
  onLeave?: () => void;
}

/**
 * Marks the screen as a live game (ENG-F07 R13-R15). A live online, AI or local game screen
 * calls it with `active` true while the game runs and false when the game is over. The shell
 * then shows the in-game bar, and the full shell comes back when the game ends or when the
 * screen goes away (Back, a redirect). Pages such as the analysis, the replay, the setup and the
 * search do not call it, so they keep the full shell.
 */
export function useLiveGame(active = true, options: LiveGameOptions = {}): void {
  const { kind, onLeave } = options;
  // A ref keeps the latest callback without entering the game again on every render.
  const onLeaveRef = useRef(onLeave);
  useEffect(() => {
    onLeaveRef.current = onLeave;
  }, [onLeave]);

  useEffect(() => {
    if (!active) return;
    const { enterLiveGame, leaveLiveGame } = useShellStore.getState();
    enterLiveGame({ kind, onLeave: () => onLeaveRef.current?.() });
    return leaveLiveGame;
  }, [active, kind]);
}
