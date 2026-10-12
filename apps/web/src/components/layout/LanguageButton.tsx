'use client';

import { useId } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { VietnamFlag } from './VietnamFlag';

export const LANGUAGE_LABEL = 'Tiếng Việt';
export const LANGUAGE_TOOLTIP = 'Ngôn ngữ khác: Sắp ra mắt';

/**
 * Language button of the header (ENG-F07 R4). It is fixed to Vietnamese and disabled
 * in the MVP. It only keeps the place for more languages in Phase 2.
 *
 * A disabled button gets no hover or focus events, so the focusable wrapper opens the shadcn/ui
 * Tooltip, for the mouse and for the keyboard. The hint stays in the page for screen readers.
 */
export function LanguageButton() {
  // The header and the drawer both render this button, so the hint id must be unique.
  const hintId = useId();

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span tabIndex={0} className="inline-flex rounded-lg outline-none focus-visible:ring-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled
              aria-disabled="true"
              aria-describedby={hintId}
              className="min-h-8 cursor-not-allowed px-2 py-1 text-fg-muted opacity-60"
            >
              <VietnamFlag className="h-4 w-6 shrink-0 rounded-xs" />
              {LANGUAGE_LABEL}
            </Button>
            <span id={hintId} className="sr-only">
              {LANGUAGE_TOOLTIP}
            </span>
          </span>
        </TooltipTrigger>
        <TooltipContent>{LANGUAGE_TOOLTIP}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
