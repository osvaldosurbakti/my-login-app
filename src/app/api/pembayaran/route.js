import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(request) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return new Response(
        JSON.stringify({ success: false, message: "Unauthorized" }),
        { status: 401 }
      );
    }

    const { transactionId, amount, date, note } = await request.json();
    const client = await clientPromise;
    const db = client.db();

    // 1. Verifikasi transaksi milik user ini
    const transaction = await db.collection("transactions").findOne({
      _id: new ObjectId(transactionId),
      userId
    });

    if (!transaction) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Transaksi tidak ditemukan atau bukan milik Anda" 
        }),
        { status: 404 }
      );
    }

    // 2. Hitung sisa hutang
    const paid = transaction.paid || 0;
    const sisa = transaction.total - paid;

    if (amount > sisa) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: `Jumlah pembayaran melebihi sisa hutang (Rp ${sisa.toLocaleString()})` 
        }),
        { status: 400 }
      );
    }

    // 3. Update transaksi
    const newPaid = paid + amount;
    const status = newPaid >= transaction.total ? "Lunas" : "Belum Lunas";

    await db.collection("transactions").updateOne(
      { _id: new ObjectId(transactionId) },
      { 
        $set: { 
          paid: newPaid,
          status,
          lastPaymentDate: new Date(date)
        } 
      }
    );

    // 4. Catat pembayaran
    await db.collection("payments").insertOne({
      transactionId: new ObjectId(transactionId),
      userId,
      amount,
      date: new Date(date),
      note,
      createdAt: new Date()
    });

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Pembayaran berhasil dicatat"
      }),
      { status: 200 }
    );

  } catch (error) {
    console.error("Payment error:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        message: "Internal server error",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      }),
      { status: 500 }
    );
  }
}