import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(req) {
  let client; // Deklarasikan di luar try-catch agar bisa diakses di blok catch

  try {
    // Validasi input
    const { email, password } = await req.json();
    if (!email || !password) {
      return new Response(
        JSON.stringify({ message: 'Email and password are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Koneksi database
    client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db();

    // Cari user dengan email (case insensitive)
    const user = await db.collection('users').findOne({ 
      email: { $regex: new RegExp(`^${email}$`, 'i') } 
    });

    if (!user) {
      return new Response(
        JSON.stringify({ message: 'Invalid credentials' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verifikasi password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return new Response(
        JSON.stringify({ message: 'Invalid credentials' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Pastikan JWT_SECRET ada
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }

    // Buat token JWT
    const token = jwt.sign(
      { 
        userId: user._id.toString(),
        email: user.email 
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Response sukses
    return new Response(
      JSON.stringify({ 
        success: true,
        token,
        user: {
          id: user._id.toString(),
          email: user.email
        }
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' } 
      }
    );

  } catch (err) {
    console.error('Login error:', err);
    
    // Error handling khusus untuk koneksi MongoDB
    if (err.code === 'ESERVFAIL') {
      return new Response(
        JSON.stringify({ 
          message: 'Database connection failed',
          error: 'Could not connect to database server'
        }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  } finally {
    // Pastikan koneksi selalu ditutup
    if (client) {
      await client.close().catch(closeErr => {
        console.error('Error closing connection:', closeErr);
      });
    }
  }
}