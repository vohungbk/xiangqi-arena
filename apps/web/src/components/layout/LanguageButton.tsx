import { VietnamFlag } from './VietnamFlag';

export const LANGUAGE_LABEL = 'Tiếng Việt';
export const LANGUAGE_TOOLTIP = 'Ngôn ngữ khác: Sắp ra mắt';

/**
 * Language button of the header (ENG-F07 R4). It is fixed to Vietnamese and disabled
 * in the MVP. It only keeps the place for more languages in Phase 2.
 */
export function LanguageButton() {
  return (
    // The wrapper carries the tooltip, because a disabled button gets no hover events.
    <span title={LANGUAGE_TOOLTIP} className="inline-flex">
      <button
        type="button"
        disabled
        aria-disabled="true"
        aria-describedby="language-button-hint"
        className="flex cursor-not-allowed items-center gap-2 rounded-lg px-2 py-1 text-sm text-fg-muted opacity-60"
      >
        <VietnamFlag className="h-4 w-6 shrink-0 rounded-sm" />
        {LANGUAGE_LABEL}
      </button>
      <span id="language-button-hint" className="sr-only">
        {LANGUAGE_TOOLTIP}
      </span>
    </span>
  );
}
