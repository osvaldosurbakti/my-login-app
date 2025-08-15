import clientPromise from "@/lib/mongodb";

// Helper untuk mendapatkan userId
function getUserId(request) {
  return request.headers.get('x-user-id');
}

// POST: Tambah item baru
export async function POST(request) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return new Response(
        JSON.stringify({ message: "Unauthorized" }),
        { status: 401 }
      );
    }

    const { name, description, price } = await request.json();
    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection("items").insertOne({
      name,
      description: description || "",
      price: Number(price),
      userId, // Tambahkan userId ke dokumen
      createdAt: new Date()
    });

    return new Response(
      JSON.stringify({ 
        message: "Item added successfully", 
        id: result.insertedId 
      }),
      { status: 201 }
    );
  } catch (err) {
    console.error("POST Error:", err);
    return new Response(
      JSON.stringify({ message: "Internal server error" }),
      { status: 500 }
    );
  }
}

// GET: Ambil item berdasarkan user
export async function GET(request) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return new Response(
        JSON.stringify({ message: "Unauthorized" }),
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    const items = await db.collection("items")
      .find({ userId }) // Hanya ambil item user ini
      .sort({ createdAt: -1 })
      .toArray();

    return new Response(
      JSON.stringify({ items }),
      { status: 200 }
    );
  } catch (err) {
    console.error("GET Error:", err);
    return new Response(
      JSON.stringify({ message: "Internal server error" }),
      { status: 500 }
    );
  }
}

// DELETE: Hapus item (hanya milik user)
export async function DELETE(request) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return new Response(
        JSON.stringify({ message: "Unauthorized" }),
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    const client = await clientPromise;
    const db = client.db();

    // Hapus hanya jika item milik user
    const result = await db.collection("items").deleteOne({
      _id: new ObjectId(id),
      userId
    });

    if (result.deletedCount === 0) {
      return new Response(
        JSON.stringify({ message: "Item not found or not owned by user" }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({ message: "Item deleted successfully" }),
      { status: 200 }
    );
  } catch (err) {
    console.error("DELETE Error:", err);
    return new Response(
      JSON.stringify({ message: "Internal server error" }),
      { status: 500 }
    );
  }
}