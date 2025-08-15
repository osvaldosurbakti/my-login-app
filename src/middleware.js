import { NextResponse } from 'next/server';
import { verifyToken } from './lib/auth';

export async function middleware(request) {
  const path = request.nextUrl.pathname;

  // API Protection
  if (path.startsWith('/api/riwayat')) {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    return NextResponse.next();
  }

  // Page Protection
  const protectedRoutes = ['/dashboard', '/transactions', '/items'];
  const isProtectedRoute = protectedRoutes.some(route => 
    path.startsWith(route)
  );

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  const token = request.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const isValid = await verifyToken(token);
    if (!isValid) {
      throw new Error('Invalid token');
    }
    return NextResponse.next();
  } catch (error) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('token');
    return response;
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/transactions/:path*',
    '/items/:path*',
    '/api/riwayat/:path*'
  ],
};