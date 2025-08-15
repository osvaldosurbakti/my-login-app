"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function RiwayatPage() {
  const router = useRouter();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      router.push("/login");
      return;
    }
    fetchRiwayat(userId);
  }, [router]);

  const fetchRiwayat = async (userId) => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch("/api/riwayat", {
        headers: {
          "x-user-id": userId,
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });

      if (!res.ok) throw new Error(await res.text());

      const data = await res.json();
      
      // Transformasi data dengan validasi
      const transaksi = (data.transactions || [])
        .filter(trx => trx.userId === userId) // Filter tambahan
        .map(trx => ({
          _id: trx._id,
          type: "Transaksi",
          date: trx.date || trx.tanggal,
          item: trx.itemName || trx.barang,
          amount: trx.total,
          quantity: trx.quantity || trx.jumlah,
          status: trx.status,
          note: trx.note || "",
          userId: trx.userId // Simpan userId untuk debugging
        }));

      const pembayaran = (data.payments || [])
        .filter(pay => pay.userId === userId) // Filter tambahan
        .map(pay => ({
          _id: pay._id,
          type: "Pembayaran",
          date: pay.date,
          item: pay.itemName || pay.barang || "-",
          amount: pay.amount,
          quantity: "-",
          status: "-",
          note: pay.note || "",
          userId: pay.userId // Simpan userId untuk debugging
        }));

      const all = [...transaksi, ...pembayaran].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
      
      setActivities(all);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Gagal memuat riwayat");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-blue-700">Riwayat Aktivitas</h1>
          <button
            onClick={() => router.push("/dashboard")}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          >
            Kembali ke Dashboard
          </button>
        </div>
        {loading ? (
          <div className="text-center py-8 text-gray-500">Memuat...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
              <thead className="bg-blue-100">
                <tr>
                  <th className="p-2 border">Tanggal</th>
                  <th className="p-2 border">Tipe</th>
                  <th className="p-2 border">Barang</th>
                  <th className="p-2 border">Jumlah</th>
                  <th className="p-2 border">Nominal</th>
                  <th className="p-2 border">Status</th>
                  <th className="p-2 border">Catatan</th>
                </tr>
              </thead>
              <tbody>
                {activities.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center p-4 text-gray-400">
                      Belum ada aktivitas
                    </td>
                  </tr>
                )}
                {activities.map((act, i) => (
                  <tr key={act._id || i} className="text-center hover:bg-blue-50 transition">
                    <td className="p-2 border">{formatDate(act.date)}</td>
                    <td className="p-2 border">{act.type}</td>
                    <td className="p-2 border">{act.item}</td>
                    <td className="p-2 border">{act.quantity}</td>
                    <td className="p-2 border">
                      Rp {act.amount?.toLocaleString?.() ?? act.amount}
                    </td>
                    <td
                      className={`p-2 border ${
                        act.status === "Lunas"
                          ? "text-green-600"
                          : act.status === "Belum Lunas"
                          ? "text-red-600"
                          : "text-gray-500"
                      }`}
                    >
                      {act.status}
                    </td>
                    <td className="p-2 border">{act.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Format tanggal helper
function formatDate(date) {
  if (!date) return "-";
  const d = new Date(date);
  if (isNaN(d)) return date;
  return d.toLocaleDateString("id-ID", { year: "numeric", month: "short", day: "numeric" });
}
