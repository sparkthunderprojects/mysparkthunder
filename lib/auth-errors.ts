/** Turns sign-in errors into plain instructions the member can act on. */
export function friendlyAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('invalid login')) {
    return 'That email and password do not match. Check them and try again.';
  }
  if (m.includes('already registered') || m.includes('already exists')) {
    return 'An account with this email already exists. Your MySparkthunder account works on every Sparkthunder site, so sign in instead.';
  }
  if (m.includes('rate limit') || m.includes('too many')) {
    return 'Too many attempts. Wait a few minutes and try again.';
  }
  if (m.includes('password') && (m.includes('short') || m.includes('least'))) {
    return 'Choose a password with at least 8 characters.';
  }
  if (m.includes('same password') || m.includes('different from the old')) {
    return 'Choose a password you have not used on this account before.';
  }
  if (m.includes('email not confirmed')) {
    return 'Confirm your email address first. We sent you a link when you signed up.';
  }
  if (m.includes('network') || m.includes('failed to fetch')) {
    return 'Could not reach the account service. Check your connection and try again.';
  }
  return message;
}
