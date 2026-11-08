import type { NextRequest } from 'next/server';
import { safeNext } from '@/lib/safe-next';
import { hasAcceptedTerms } from '@/lib/terms';
import { redirectWithCookies, updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { response, user, configured } = await updateSession(request);
  if (!configured) return response;

  const path = request.nextUrl.pathname;
  const isAccount = path === '/account' || path.startsWith('/account/');
  const isConsent = path === '/oauth/consent';
  const isWelcome = path === '/welcome';

  if (isAccount && !user) {
    return redirectWithCookies(request, response, '/login');
  }
  if (isConsent && !user) {
    // Another Sparkthunder site sent this person here to approve a sign-in.
    // Sign in first, then come straight back to the approval page.
    const back = encodeURIComponent(path + request.nextUrl.search);
    return redirectWithCookies(request, response, `/login?next=${back}`);
  }
  if (isWelcome) {
    // First-time agreement screen: needs a signed-in person who has not agreed yet.
    if (!user) return redirectWithCookies(request, response, '/login');
    if (hasAcceptedTerms(user)) {
      return redirectWithCookies(request, response, safeNext(request.nextUrl.searchParams.get('next')) ?? '/account');
    }
    return response;
  }
  if ((isAccount || isConsent) && user && !hasAcceptedTerms(user)) {
    const back = encodeURIComponent(path + request.nextUrl.search);
    return redirectWithCookies(request, response, `/welcome?next=${back}`);
  }
  if (!isAccount && !isConsent && user && (path === '/login' || path === '/signup')) {
    const next = safeNext(request.nextUrl.searchParams.get('next'));
    return redirectWithCookies(request, response, next ?? '/account');
  }
  return response;
}

// Public pages are deliberately not matched, so they stay static and fast.
export const config = {
  matcher: ['/account/:path*', '/oauth/consent', '/welcome', '/login', '/signup'],
};
