import clientPromise from "@/lib/mongodb";

export async function GET(request) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return new Response(
        JSON.stringify({ success: false, message: "Unauthorized" }),
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Hanya ambil transaksi user ini yang belum lunas
    const transactions = await db.collection("transactions")
      .find({ 
        userId,
        status: { $ne: "Lunas" } 
      })
      .sort({ date: -1 })
      .toArray();

    return new Response(
      JSON.stringify({ 
        success: true,
        transactions: transactions.map(trx => ({
          ...trx,
          _id: trx._id.toString()
        }))
      }),
      { status: 200 }
    );

  } catch (error) {
    console.error("Fetch unpaid error:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        message: "Internal server error" 
      }),
      { status: 500 }
    );
  }
}