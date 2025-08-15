import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: "Token is required" },
        { status: 400 }
      );
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT secret not configured');
    }

    // Verifikasi token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Response minimal
    return NextResponse.json({
      valid: true,
      userId: decoded.userId
    });

  } catch (error) {
    console.error('Token verification failed:', error.message);
    return NextResponse.json(
      { error: "Invalid token", details: error.message },
      { status: 401 }
    );
  }
}