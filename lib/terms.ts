/**
 * The first-time "Welcome to Sparkthunder" agreement.
 *
 * A person is "welcomed" once their account carries terms_accepted_at in
 * its metadata. Email sign-ups record it at sign-up (the form already
 * tells them they are agreeing). Anyone who arrives another way, such as
 * through Google or another Sparkthunder site, sees /welcome first.
 * Change TERMS_VERSION when the Terms or Privacy Policy change in a way
 * people should agree to again.
 */
export const TERMS_VERSION = '2026-11-08';

export function hasAcceptedTerms(user: { user_metadata?: Record<string, unknown> } | null | undefined): boolean {
  const accepted = user?.user_metadata?.terms_accepted_at;
  return typeof accepted === 'string' && accepted.length > 0;
}
