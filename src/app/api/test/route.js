// app/api/test/route.js
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    const users = await db.collection('users').countDocuments();
    const transactions = await db.collection('transactions').countDocuments();
    
    return Response.json({
      users_count: users,
      transactions_count: transactions,
      status: "OK"
    });
  } catch (err) {
    return Response.json({
      error: err.message,
      stack: err.stack
    }, { status: 500 });
  }
}