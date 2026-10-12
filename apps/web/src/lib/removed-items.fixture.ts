/**
 * Features cut from the MVP (ENG-F07 R27). No screen of the shell shows them.
 * Add an entry here only when the spec removes another item.
 */
export const REMOVED_MENU_LABELS = ['Cộng đồng', 'Luyện tập', 'Giải Đố', 'Phân tích'] as const;

/** Old paths of the removed menu items. They must not be linked and must not have a page. */
export const REMOVED_PATH_NAMES = [
  'community',
  'practice',
  'puzzle',
  'puzzles',
  'analysis',
  'cong-dong',
  'luyen-tap',
  'giai-do',
  'phan-tich',
] as const;

export const REMOVED_HOME_BLOCK = 'Cờ Thế Mỗi Ngày';

/** Text of the 7-day streak card and of the viewer counter. */
export const REMOVED_STREAK_PATTERN = /\bstreak\b|chuỗi\s*(\d+\s*)?ngày/i;
export const REMOVED_VIEWER_PATTERN = /đang xem|người xem|\b(viewers?|spectators?)\b/i;

/** The removed labels that appear in the text, ignoring case. */
export function findRemovedLabels(text: string): string[] {
  const lower = text.toLocaleLowerCase('vi');
  return REMOVED_MENU_LABELS.filter((label) => lower.includes(label.toLocaleLowerCase('vi')));
}

/** The links that point at a removed path or below it. */
export function findRemovedPaths(hrefs: readonly string[]): string[] {
  return hrefs.filter((href) =>
    REMOVED_PATH_NAMES.some((name) => href === `/${name}` || href.startsWith(`/${name}/`)),
  );
}
