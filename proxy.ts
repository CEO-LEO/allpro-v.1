import { NextResponse, type NextRequest } from 'next/server';
// import { createMiddlewareSupabaseClient } from '@/lib/supabase/middleware';

// ============================================================
// RBAC Middleware — Pro Hunter (DEMO MODE)
//
// NOTE: Currently using client-side auth (Zustand) instead of Supabase
// Middleware is disabled for demo. Auth checks happen via AuthGuard component.
//
// For production with real Supabase:
//  1. /merchant/* → require auth + merchant role in DB
//  2. /api/merchant/* → require auth (API-level ownership
//     checks happen in route handlers via RLS)
//  3. Public routes → passthrough
// ============================================================

/** Routes that require the user to be a merchant */
const MERCHANT_ROUTES = ['/merchant'];

/** Merchant routes that should remain public (onboarding) */
const MERCHANT_PUBLIC_EXCEPTIONS = ['/merchant/register'];

/** API routes that require merchant auth */
const MERCHANT_API_ROUTES = ['/api/merchant'];

/** Routes that are always public */
const PUBLIC_PREFIXES = [
  '/_next',
  '/api/auth',
  '/auth',
  '/favicon.ico',
  '/static',
  '/manifest.json',
  '/sw.js',
];

/** File extensions to skip */
const STATIC_EXTENSIONS = /\.(svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|eot|map)$/;

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── 1. Skip static files & internal routes ──
  if (
    PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix)) ||
    STATIC_EXTENSIONS.test(pathname)
  ) {
    return NextResponse.next();
  }

  // ── DEMO MODE: BYPASS ALL AUTH CHECKS ──
  // Auth is handled client-side via AuthGuard component
  // Uncomment below code when Supabase backend is ready
  
  return NextResponse.next();

  /*
  // ══════════════════════════════════════════════════════════
  // PRODUCTION CODE (Enable when Supabase is configured)
  // ══════════════════════════════════════════════════════════

  // ── 2. Create Supabase client (refreshes cookies) ──
  const { supabase, response } = await createMiddlewareSupabaseClient(request);

  // ── 3. Get current user (validates JWT from cookies) ──
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  const isAuthenticated = !!user && !authError;

  // ── 4. Merchant page routes (/merchant/*) ──
  const isMerchantPage = MERCHANT_ROUTES.some((r) => pathname.startsWith(r));
  const isMerchantPublicException = MERCHANT_PUBLIC_EXCEPTIONS.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isMerchantPage && isMerchantPublicException) {
    return response;
  }

  if (isMerchantPage) {
    // Not logged in → redirect to home with auth prompt
    if (!isAuthenticated) {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      url.searchParams.set('redirect', pathname);
      url.searchParams.set('authRequired', 'true');
      return NextResponse.redirect(url);
    }

    // Check merchant role in the database
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user!.id)
      .single();

    const role = profile?.role?.toLowerCase();

    // Also check if user has a merchant record
    const { data: merchant } = await supabase
      .from('merchants')
      .select('id, status')
      .eq('owner_id', user!.id)
      .eq('status', 'active')
      .maybeSingle();

    const isMerchant = role === 'merchant' || !!merchant;

    if (!isMerchant) {
      // Customer trying to access merchant area → redirect
      const url = request.nextUrl.clone();
      url.pathname = '/merchant/landing';
      url.searchParams.set('reason', 'access_denied');
      return NextResponse.redirect(url);
    }

    // Set merchant context headers for downstream use
    response.headers.set('x-user-role', 'merchant');
    response.headers.set('x-user-id', user!.id);
    if (merchant) {
      response.headers.set('x-merchant-id', merchant.id);
    }
  }

  // ── 5. Merchant API routes (/api/merchant/*) ──
  const isMerchantApi = MERCHANT_API_ROUTES.some((r) => pathname.startsWith(r));
  if (isMerchantApi && !isAuthenticated) {
    return NextResponse.json(
      { success: false, error: 'Authentication required', code: 'AUTH_REQUIRED' },
      { status: 401 }
    );
  }

  // ── 6. All other routes → passthrough with refreshed cookies ──
  return response;
  */
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder static assets
     */
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
