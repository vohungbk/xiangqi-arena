/** A modal keeps the keyboard focus inside: wrap Tab and Shift+Tab at the ends of the panel. */
export function trapTab(event: KeyboardEvent, panel: HTMLElement): void {
  const focusable = panel.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (!first || !last) return;
  const active = document.activeElement;
  if (event.shiftKey && (active === first || active === panel)) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus();
  }
}
