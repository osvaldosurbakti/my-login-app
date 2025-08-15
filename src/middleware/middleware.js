import { NextResponse } from 'next/server';
import { verifyToken } from './lib/auth'; // Buat utility untuk verifikasi token

export async function middleware(request) {
  const protectedRoutes = ['/dashboard', '/transactions', '/items'];
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  const token = request.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // Verifikasi token
    const isValid = await verifyToken(token);
    
    if (!isValid) {
      throw new Error('Invalid token');
    }

    return NextResponse.next();
  } catch (error) {
    // Hapus cookie token jika tidak valid
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('token');
    return response;
  }
}

export function middleware(request) {
  const path = request.nextUrl.pathname;
  const token = request.cookies.get('token')?.value;
  const userId = request.headers.get('x-user-id');

  if (path.startsWith('/api/riwayat') && !userId) {
    return new Response('Unauthorized', { status: 401 });
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/transactions/:path*',
    '/items/:path*'
  ],
};