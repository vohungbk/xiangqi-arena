/**
 * jsdom lacks a few browser APIs that Radix UI (shadcn/ui) uses for menus and positioning.
 * Give the component tests a minimal stand-in. Real browsers have all of them.
 */
if (typeof window !== 'undefined') {
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  window.ResizeObserver ??= ResizeObserverStub as unknown as typeof ResizeObserver;

  const proto = window.HTMLElement.prototype;
  proto.hasPointerCapture ??= () => false;
  proto.setPointerCapture ??= () => undefined;
  proto.releasePointerCapture ??= () => undefined;
  proto.scrollIntoView ??= () => undefined;

  // jsdom has no PointerEvent. A button check on `pointerdown` needs `button` and `ctrlKey`.
  const target = window as unknown as { PointerEvent?: unknown };
  if (!target.PointerEvent) {
    class PointerEventStub extends MouseEvent {
      readonly pointerType: string;
      constructor(type: string, init: PointerEventInit = {}) {
        super(type, init);
        this.pointerType = init.pointerType ?? 'mouse';
      }
    }
    target.PointerEvent = PointerEventStub;
  }
}
