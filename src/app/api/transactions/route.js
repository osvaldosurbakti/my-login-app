import clientPromise from "@/lib/mongodb";

// Fungsi untuk mengambil userId dari request (contoh: dari header)
function getUserId(req) {
  return req.headers.get("x-user-id");
}

// POST: tambah transaksi
export async function POST(req) {
  try {
    const userId = getUserId(req);
    if (!userId) return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });

    const { itemId, itemName, price, quantity, date, note } = await req.json();
    const total = price * quantity;
    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection("transactions").insertOne({
      userId,
      itemId: itemId || null,
      itemName: itemName || "",
      price,
      quantity,
      total,
      date: date ? new Date(date) : new Date(),
      note,
      status: "Belum Lunas",
    });

    return new Response(JSON.stringify({ message: "Transaction added", id: result.insertedId }), {
      status: 201,
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ message: "Internal server error" }), { status: 500 });
  }
}

// GET: ambil semua transaksi
export async function GET(req) {
  try {
    const userId = getUserId(req);
    if (!userId) return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });

    const client = await clientPromise;
    const db = client.db();
    const transactions = await db.collection("transactions").find({ userId }).toArray();
    return new Response(JSON.stringify(transactions), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ message: "Internal server error" }), { status: 500 });
  }
}
