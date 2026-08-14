import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from './lib/auth';

export async function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  const isProtectedPath =
    pathname === '/' ||
    pathname.startsWith('/rooms') ||
    pathname.startsWith('/racks');

  if (isProtectedPath) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const payload = await verifyJWT(token);
    if (!payload) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token');
      return response;
    }
  }

  if (pathname === '/login' && token) {
    const payload = await verifyJWT(token);
    if (payload) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
