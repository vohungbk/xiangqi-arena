/**
 * Up to two upper-case letters for the Avatar.
 * "minh_anh" gives "MA", "Khoa" gives "KH".
 */
export function getInitials(username: string): string {
  const words = username.split(/[\s_]+/).filter(Boolean);
  const first = words[0] ?? '';
  const second = words[1] ?? '';
  const letters = second !== '' ? `${first.charAt(0)}${second.charAt(0)}` : first.slice(0, 2);
  return letters.toUpperCase() || '?';
}
