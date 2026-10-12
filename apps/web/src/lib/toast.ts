import { toast } from 'sonner';

/**
 * Shows a small toast (ENG-F07 R13, E11). In a live game a notification shows as a toast and the
 * bell stays hidden. The notification source (USR-F03) calls it. The text is plain text: Sonner
 * renders a string as text and never parses it as HTML. `Toaster` in the root layout shows it.
 */
export function pushToast(message: string): void {
  toast(message);
}
