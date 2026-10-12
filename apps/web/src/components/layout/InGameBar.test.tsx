// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { useShellStore } from '@/store/useShellStore';
import { InGameBar } from './InGameBar';

describe('InGameBar', () => {
  beforeEach(() => {
    useShellStore.setState({ inGame: true, leaveModalOpen: false });
  });

  afterEach(() => {
    cleanup();
  });

  describe('content', () => {
    it('should show only the logo and the button Rời Đi', () => {
      render(<InGameBar />);
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(2);
      expect(buttons[0]?.getAttribute('aria-label')).toBe('Xiangqi Arena - Rời ván');
      expect(buttons[1]?.textContent).toBe('Rời Đi');
      expect(screen.queryAllByRole('link')).toHaveLength(0);
      expect(screen.queryByRole('navigation')).toBeNull();
    });

    it('should render nothing when no live game is on screen', () => {
      useShellStore.setState({ inGame: false });
      const { container } = render(<InGameBar />);
      expect(container.innerHTML).toBe('');
    });

    it('should keep every control at least 44 px high', () => {
      render(<InGameBar />);
      for (const button of screen.getAllByRole('button')) {
        expect(button.className).toContain('min-h-[44px]');
      }
    });
  });

  describe('leave modal', () => {
    it('should open the leave modal when the logo is clicked', () => {
      render(<InGameBar />);
      fireEvent.click(screen.getByRole('button', { name: 'Xiangqi Arena - Rời ván' }));
      expect(useShellStore.getState().leaveModalOpen).toBe(true);
    });

    it('should open the leave modal when Rời Đi is clicked', () => {
      render(<InGameBar />);
      fireEvent.click(screen.getByRole('button', { name: 'Rời Đi' }));
      expect(useShellStore.getState().leaveModalOpen).toBe(true);
    });

    it('should not link the logo to Home, so the game is not left by a click', () => {
      render(<InGameBar />);
      const logo = screen.getByRole('button', { name: 'Xiangqi Arena - Rời ván' });
      expect(logo.closest('a')).toBeNull();
      expect(logo.getAttribute('href')).toBeNull();
    });
  });

  describe('window width', () => {
    it('should have no breakpoint at 1024 px, so the bar stays when the window crosses it', () => {
      const { container } = render(<InGameBar />);
      expect(container.innerHTML).not.toMatch(/\blg:/);
    });
  });
});
