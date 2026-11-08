/**
 * Only allow a "next" address that stays on this site and is the approval
 * page or the account area, so a crafted link cannot send people elsewhere.
 */
export function safeNext(value: string | null | undefined): string | null {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return null;
  if (value.startsWith('/oauth/consent') || value === '/account' || value.startsWith('/account/')) return value;
  return null;
}
