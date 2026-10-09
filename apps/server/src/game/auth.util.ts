/** Returns true when the handshake Origin header is in the allow list. */
export function isOriginAllowed(origin: string | undefined, allowed: string[]): boolean {
  return !!origin && allowed.includes(origin);
}
