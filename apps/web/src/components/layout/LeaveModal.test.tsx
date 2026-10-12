// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LiveGameKind } from '@/lib/live-game-kind';
import { useShellStore } from '@/store/useShellStore';
import { InGameBar } from './InGameBar';
import { LEAVE_MODAL_TEXT, LeaveModal } from './LeaveModal';

const router = vi.hoisted(() => ({ push: vi.fn() }));
const socket = vi.hoisted(() => ({ connectSocket: vi.fn() }));

vi.mock('next/navigation', () => ({ useRouter: () => router }));
vi.mock('@/lib/socket', () => socket);

function startGame(kind: LiveGameKind, onLeave?: () => void) {
  act(() => {
    useShellStore.getState().enterLiveGame({ kind, onLeave });
  });
}

function openModal() {
  act(() => useShellStore.getState().openLeaveModal());
}

const shell = () => useShellStore.getState();

describe('LeaveModal', () => {
  beforeEach(() => {
    router.push.mockClear();
    socket.connectSocket.mockClear();
    useShellStore.setState({
      inGame: false,
      liveGameRefs: 0,
      liveGameKind: null,
      leaveHandler: null,
      leaveModalOpen: false,
    });
  });

  afterEach(() => {
    cleanup();
    document.body.style.overflow = '';
  });

  describe('text', () => {
    it.each([LiveGameKind.AI, LiveGameKind.LOCAL])(
      'should ask to confirm the leave of a live %s game',
      (kind) => {
        render(<LeaveModal />);
        startGame(kind);
        openModal();
        expect(screen.getByRole('alertdialog')).toBeTruthy();
        expect(screen.getByText(LEAVE_MODAL_TEXT)).toBeTruthy();
        expect(LEAVE_MODAL_TEXT).toBe('Ván đấu đang diễn ra. Bạn có chắc chắn muốn rời đi?');
      },
    );

    it('should show nothing while the leave modal is not requested', () => {
      render(<LeaveModal />);
      startGame(LiveGameKind.AI);
      expect(screen.queryByRole('alertdialog')).toBeNull();
    });

    it('should show nothing for an online game, which has its own story', () => {
      render(<LeaveModal />);
      startGame(LiveGameKind.ONLINE);
      openModal();
      expect(screen.queryByRole('alertdialog')).toBeNull();
    });

    it('should still ask when a live game screen did not tell its kind', () => {
      render(<LeaveModal />);
      act(() => shell().enterLiveGame());
      openModal();
      expect(screen.getByText(LEAVE_MODAL_TEXT)).toBeTruthy();
    });

    it('should open from the logo and from Rời Đi of the in-game bar', () => {
      render(
        <>
          <InGameBar />
          <LeaveModal />
        </>,
      );
      startGame(LiveGameKind.LOCAL);
      fireEvent.click(screen.getByRole('button', { name: 'Xiangqi Arena - Rời ván' }));
      expect(screen.getByRole('alertdialog')).toBeTruthy();
      fireEvent.click(screen.getByRole('button', { name: 'Ở Lại' }));
      expect(screen.queryByRole('alertdialog')).toBeNull();
      fireEvent.click(screen.getAllByRole('button', { name: 'Rời Đi' })[0] as HTMLElement);
      expect(screen.getByRole('alertdialog')).toBeTruthy();
    });
  });

  describe('confirm', () => {
    it('should drop the unfinished game, close the modal and go to Home', () => {
      const onLeave = vi.fn();
      render(<LeaveModal />);
      startGame(LiveGameKind.AI, onLeave);
      openModal();
      fireEvent.click(screen.getByRole('button', { name: 'Rời Đi' }));
      expect(onLeave).toHaveBeenCalledTimes(1);
      expect(router.push).toHaveBeenCalledWith('/');
      expect(shell().leaveModalOpen).toBe(false);
      expect(screen.queryByRole('alertdialog')).toBeNull();
    });

    it('should leave only once when the player clicks the button twice', () => {
      const onLeave = vi.fn();
      render(<LeaveModal />);
      startGame(LiveGameKind.LOCAL, onLeave);
      openModal();
      const confirm = screen.getByRole('button', { name: 'Rời Đi' });
      fireEvent.click(confirm);
      fireEvent.click(confirm);
      expect(onLeave).toHaveBeenCalledTimes(1);
      expect(router.push).toHaveBeenCalledTimes(1);
    });

    it('should send no WebSocket event and open no connection', () => {
      render(<LeaveModal />);
      startGame(LiveGameKind.AI);
      openModal();
      fireEvent.click(screen.getByRole('button', { name: 'Rời Đi' }));
      expect(socket.connectSocket).not.toHaveBeenCalled();
    });

    it('should still leave and log the error when the leave handler throws', () => {
      const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      render(<LeaveModal />);
      startGame(LiveGameKind.AI, () => {
        throw new Error('storage is full');
      });
      openModal();
      fireEvent.click(screen.getByRole('button', { name: 'Rời Đi' }));
      expect(router.push).toHaveBeenCalledWith('/');
      expect(error).toHaveBeenCalledTimes(1);
      error.mockRestore();
    });

    it('should leave a game that has no leave handler', () => {
      render(<LeaveModal />);
      startGame(LiveGameKind.LOCAL);
      openModal();
      fireEvent.click(screen.getByRole('button', { name: 'Rời Đi' }));
      expect(router.push).toHaveBeenCalledWith('/');
    });
  });

  describe('cancel', () => {
    it('should keep the game going when the player cancels', () => {
      const onLeave = vi.fn();
      render(<LeaveModal />);
      startGame(LiveGameKind.AI, onLeave);
      openModal();
      fireEvent.click(screen.getByRole('button', { name: 'Ở Lại' }));
      expect(screen.queryByRole('alertdialog')).toBeNull();
      expect(shell().inGame).toBe(true);
      expect(onLeave).not.toHaveBeenCalled();
      expect(router.push).not.toHaveBeenCalled();
    });

    it('should keep the game going when Esc is pressed', () => {
      const onLeave = vi.fn();
      render(<LeaveModal />);
      startGame(LiveGameKind.AI, onLeave);
      openModal();
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(shell().leaveModalOpen).toBe(false);
      expect(shell().inGame).toBe(true);
      expect(onLeave).not.toHaveBeenCalled();
    });

    it('should keep the game going when the dimmed area is clicked', () => {
      const onLeave = vi.fn();
      render(<LeaveModal />);
      startGame(LiveGameKind.LOCAL, onLeave);
      openModal();
      fireEvent.click(screen.getByTestId('leave-backdrop'));
      expect(shell().leaveModalOpen).toBe(false);
      expect(shell().inGame).toBe(true);
      expect(onLeave).not.toHaveBeenCalled();
    });

    it('should let the player open it again after a cancel', () => {
      render(<LeaveModal />);
      startGame(LiveGameKind.AI);
      openModal();
      fireEvent.click(screen.getByRole('button', { name: 'Ở Lại' }));
      openModal();
      expect(screen.getByRole('alertdialog')).toBeTruthy();
    });
  });

  describe('game events', () => {
    it('should close when the game ends while the modal is open', () => {
      render(<LeaveModal />);
      startGame(LiveGameKind.AI);
      openModal();
      act(() => shell().leaveLiveGame());
      expect(screen.queryByRole('alertdialog')).toBeNull();
    });
  });

  describe('keyboard and page', () => {
    it('should start the focus on the safe choice', () => {
      render(<LeaveModal />);
      startGame(LiveGameKind.AI);
      openModal();
      expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Ở Lại' }));
    });

    it('should keep the Tab focus inside the modal', () => {
      render(<LeaveModal />);
      startGame(LiveGameKind.AI);
      openModal();
      screen.getByRole('button', { name: 'Rời Đi' }).focus();
      fireEvent.keyDown(document, { key: 'Tab' });
      expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Ở Lại' }));
    });

    it('should return the focus to the element that opened it', () => {
      const opener = document.createElement('button');
      document.body.appendChild(opener);
      render(<LeaveModal />);
      startGame(LiveGameKind.AI);
      opener.focus();
      openModal();
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(document.activeElement).toBe(opener);
      opener.remove();
    });

    it('should lock the page scroll while open and restore it after', () => {
      render(<LeaveModal />);
      startGame(LiveGameKind.AI);
      openModal();
      expect(document.body.style.overflow).toBe('hidden');
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(document.body.style.overflow).toBe('');
    });
  });
});
