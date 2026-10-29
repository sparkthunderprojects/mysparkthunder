import type { NextRequest } from 'next/server';
import { redirectWithCookies, updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { response, user, configured } = await updateSession(request);
  if (!configured) return response;

  const path = request.nextUrl.pathname;
  const isAccount = path === '/account' || path.startsWith('/account/');

  if (isAccount && !user) {
    return redirectWithCookies(request, response, '/login');
  }
  if (!isAccount && user && (path === '/login' || path === '/signup')) {
    return redirectWithCookies(request, response, '/account');
  }
  return response;
}

// Public pages are deliberately not matched, so they stay static and fast.
export const config = {
  matcher: ['/account/:path*', '/login', '/signup'],
};
