import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        console.error('Auth callback error:', error.message);
        return NextResponse.redirect(new URL('/?auth_error=1', requestUrl.origin));
      }
    } catch (err) {
      console.error('Auth callback exception:', err);
      return NextResponse.redirect(new URL('/?auth_error=1', requestUrl.origin));
    }
  }

  // Redirect to home page
  return NextResponse.redirect(new URL('/', requestUrl.origin));
}
