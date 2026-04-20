import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public routes that don't require authentication
const publicRoutes = ['/login', '/register'];

// Routes that should redirect to dashboard if already authenticated
const authRoutes = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const token = request.cookies.get('auth-token')?.value;

  // Redirect old /app/factory routes to /ai-studio (301 permanent redirect)
  if (pathname.startsWith('/app/factory/new')) {
    const newUrl = new URL('/ai-studio/new', request.url);
    return NextResponse.redirect(newUrl, 301);
  }
  
  if (pathname.startsWith('/app/factory/')) {
    const rest = pathname.split('/app/factory')[1];
    const newUrl = new URL(`/ai-studio${rest}`, request.url);
    return NextResponse.redirect(newUrl, 301);
  }

  if (pathname === '/app/factory') {
    const newUrl = new URL('/ai-studio', request.url);
    return NextResponse.redirect(newUrl, 301);
  }

  // Check if the route is an auth route (login/register)
  const isAuthRoute = authRoutes.includes(pathname);

  // If user is authenticated and trying to access login/register, redirect to dashboard
  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL('/app', request.url));
  }

  // If user is not authenticated and trying to access protected route, redirect to login
  if (!token && !publicRoutes.includes(pathname) && !pathname.startsWith('/api')) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Configure which routes should be handled by middleware
export const config = {
  matcher: [
    '/app/factory/:path*',
    '/app/factory',
    '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
