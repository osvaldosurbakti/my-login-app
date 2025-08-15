import clientPromise from "@/lib/mongodb";

export async function GET(request) {
  try {
    // Proper header access
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      console.error('Missing user ID in headers');
      return Response.json(
        { success: false, message: "Unauthorized: Missing user ID" },
        { status: 401 }
      );
    }

    // Verify MongoDB connection
    let client;
    try {
      client = await clientPromise;
      if (!client) throw new Error('MongoDB client not available');
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return Response.json(
        { success: false, message: "Database connection failed" },
        { status: 500 }
      );
    }

    const db = client.db();
    const filter = { userId };

    // Debug: Log the filter being used
    console.log('MongoDB filter:', JSON.stringify(filter));

    // Get unpaid total - with error handling
    let totalUnpaid = 0;
    try {
      const unpaidResult = await db.collection("transactions").aggregate([
        { $match: { ...filter, status: { $ne: "Lunas" } } },
        { $group: { _id: null, total: { $sum: "$amount" } } } // Changed from $total to $amount
      ]).toArray();
      
      totalUnpaid = unpaidResult[0]?.total || 0;
    } catch (aggError) {
      console.error('Aggregation error:', aggError);
      return Response.json(
        { success: false, message: "Error calculating unpaid total" },
        { status: 500 }
      );
    }

    // Get monthly counts
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const [transaksiBulanIni, transaksiLunasBulanIni] = await Promise.all([
      db.collection("transactions").countDocuments({
        ...filter,
        date: { $gte: firstDay, $lte: lastDay }
      }),
      db.collection("transactions").countDocuments({
        ...filter,
        status: "Lunas",
        date: { $gte: firstDay, $lte: lastDay }
      })
    ]);

    // Get recent transactions
    const recentTransactions = await db.collection("transactions")
      .find(filter)
      .sort({ date: -1 })
      .limit(5)
      .toArray();

    return Response.json({
      success: true,
      totalUnpaid,
      transaksiBulanIni,
      transaksiLunasBulanIni,
      recentTransactions: recentTransactions.map(tx => ({
        ...tx,
        id: tx._id.toString(), // Convert ObjectId to string
        _id: undefined // Remove the original _id
      }))
    });

  } catch (error) {
    console.error('API route error:', error);
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