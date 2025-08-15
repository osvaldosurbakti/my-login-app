import { MongoClient } from 'mongodb';

export async function GET(request) {
  try {
    // Dapatkan userId dari headers
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return Response.json(
        { success: false, message: "User ID tidak valid" },
        { status: 401 }
      );
    }

    // Buat koneksi baru (jangan gunakan clientPromise jika bermasalah)
    const client = new MongoClient(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 30000
    });

    try {
      await client.connect();
      const db = client.db();

      // Query dengan filter userId
      const [transactions, payments] = await Promise.all([
        db.collection("transactions")
          .find({ userId })
          .sort({ date: -1 })
          .toArray(),
        db.collection("payments")
          .find({ userId })
          .sort({ date: -1 })
          .toArray()
      ]);

      return Response.json({
        success: true,
        transactions,
        payments
      });
    } finally {
      await client.close();
    }
  } catch (error) {
    console.error('API Error:', error);
    return Response.json(
      { 
        success: false,
        message: "Internal server error",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}