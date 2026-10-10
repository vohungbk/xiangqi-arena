// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { LanguageButton } from './LanguageButton';

// Regional indicator symbols: two of them make a flag emoji.
const FLAG_EMOJI = /[\u{1F1E6}-\u{1F1FF}]/u;

describe('LanguageButton', () => {
  afterEach(() => {
    cleanup();
  });

  it('should show a flag and the text Tiếng Việt', () => {
    render(<LanguageButton />);
    const button = screen.getByRole('button', { name: /Tiếng Việt/ });
    expect(button.textContent).toContain('Tiếng Việt');
    expect(button.querySelector('svg')).not.toBeNull();
  });

  it('should draw the flag as an SVG image and not as an emoji', () => {
    const { container } = render(<LanguageButton />);
    expect(screen.getByTestId('vietnam-flag').tagName.toLowerCase()).toBe('svg');
    expect(FLAG_EMOJI.test(container.innerHTML)).toBe(false);
    expect(FLAG_EMOJI.test(container.textContent ?? '')).toBe(false);
  });

  it('should be disabled', () => {
    render(<LanguageButton />);
    expect((screen.getByRole('button') as HTMLButtonElement).disabled).toBe(true);
  });

  it('should be marked as disabled for assistive tools', () => {
    render(<LanguageButton />);
    expect(screen.getByRole('button').getAttribute('aria-disabled')).toBe('true');
  });

  it('should show the tooltip Ngôn ngữ khác: Sắp ra mắt', () => {
    const { container } = render(<LanguageButton />);
    const wrapper = container.firstElementChild;
    expect(wrapper?.getAttribute('title')).toBe('Ngôn ngữ khác: Sắp ra mắt');
  });

  it('should describe the reason to assistive tools', () => {
    render(<LanguageButton />);
    const id = screen.getByRole('button').getAttribute('aria-describedby') ?? '';
    expect(document.getElementById(id)?.textContent).toBe('Ngôn ngữ khác: Sắp ra mắt');
  });

  it('should change nothing on the page when the player clicks it', () => {
    const { container } = render(<LanguageButton />);
    const before = container.innerHTML;
    const button = screen.getByRole('button');
    fireEvent.click(button);
    fireEvent.doubleClick(button);
    expect(container.innerHTML).toBe(before);
  });

  it('should not take the keyboard focus', () => {
    render(<LanguageButton />);
    const button = screen.getByRole('button');
    button.focus();
    expect(document.activeElement).not.toBe(button);
  });
});
