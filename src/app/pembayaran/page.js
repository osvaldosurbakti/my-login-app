'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import id from "date-fns/locale/id";

export default function PembayaranPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [amount, setAmount] = useState(0);
  const [note, setNote] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState({
    fetch: true,
    submit: false
  });
  const [userInfo, setUserInfo] = useState({
    email: "",
    name: ""
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Format currency helper
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(value || 0);
  };

  // Format date helper
  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), "dd MMMM yyyy", { locale: id });
    } catch {
      return dateString || "-";
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    
    if (!token || !userId) {
      router.push("/login");
      return;
    }

    // Decode token untuk dapatkan user info
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUserInfo({
        email: payload.email || "",
        name: payload.name || ""
      });
    } catch (err) {
      console.error("Token decode error:", err);
    }

    fetchUnpaid(userId);
    setDate(new Date().toISOString().slice(0, 10));
  }, [router]);

  const fetchUnpaid = async (userId) => {
    try {
      setLoading(prev => ({ ...prev, fetch: true }));
      setError(null);
      
      const res = await fetch("/api/transactions/unpaid", {
        headers: {
          "x-user-id": userId,
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        cache: "no-store"
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const data = await res.json();
      setTransactions(data.transactions || []);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message || "Gagal memuat data transaksi");
    } finally {
      setLoading(prev => ({ ...prev, fetch: false }));
    }
  };

  // Update amount otomatis saat selectedIds berubah
  useEffect(() => {
    const total = transactions
      .filter(trx => selectedIds.includes(trx._id))
      .reduce((sum, trx) => sum + (trx.total - (trx.paid || 0)), 0);
    setAmount(total);
  }, [selectedIds, transactions]);

  const handleCheckbox = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const payableIds = transactions
        .filter(trx => (trx.total - (trx.paid || 0)) > 0)
        .map(trx => trx._id);
      setSelectedIds(payableIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");
    
    if (!userId || !token) {
      router.push("/login");
      return;
    }

    if (selectedIds.length === 0) {
      setError("Pilih minimal satu transaksi yang akan dibayar");
      return;
    }

    setLoading(prev => ({ ...prev, submit: true }));
    setError(null);
    setSuccess(null);

    try {
      const results = await Promise.all(
        selectedIds.map(async (trxId) => {
          const trx = transactions.find(t => t._id === trxId);
          const sisa = trx.total - (trx.paid || 0);
          
          const res = await fetch("/api/pembayaran", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-user-id": userId,
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
              transactionId: trxId,
              amount: sisa,
              date,
              note,
            }),
          });

          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || `Pembayaran untuk ${trx.itemName} gagal`);
          }

          return res.json();
        })
      );

      setSuccess("Semua pembayaran berhasil diproses");
      setSelectedIds([]);
      setNote("");
      fetchUnpaid(userId);
    } catch (err) {
      console.error("Payment error:", err);
      setError(err.message);
    } finally {
      setLoading(prev => ({ ...prev, submit: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-800">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-xl font-bold text-white">Pembayaran Hutang</h1>
              {userInfo.name && (
                <div className="mt-2 sm:mt-0 flex items-center">
                  <span className="text-sm text-blue-100 mr-2">Login sebagai:</span>
                  <span className="text-sm font-semibold text-white bg-blue-500 px-3 py-1 rounded-full">
                    {userInfo.name} ({userInfo.email})
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            {/* Error/Success Messages */}
            {error && (
              <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
                <p>{error}</p>
              </div>
            )}
            
            {success && (
              <div className="mb-4 p-3 bg-green-100 border-l-4 border-green-500 text-green-700 rounded">
                <p>{success}</p>
              </div>
            )}

            {/* Loading State */}
            {loading.fetch && (
              <div className="mb-4 p-4 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                <p className="mt-2 text-gray-600">Memuat data transaksi...</p>
              </div>
            )}

            {/* Transactions Table */}
            {!loading.fetch && (
              <>
                <div className="overflow-x-auto mb-6 border border-gray-200 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <input
                            type="checkbox"
                            checked={selectedIds.length > 0 && 
                                     selectedIds.length === transactions.filter(t => (t.total - (t.paid || 0)) > 0).length}
                            onChange={handleSelectAll}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tanggal
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Barang/Jasa
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Terbayar
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Sisa
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {transactions.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                            Tidak ada transaksi belum lunas
                          </td>
                        </tr>
                      ) : (
                        transactions.map((trx) => {
                          const sisa = trx.total - (trx.paid || 0);
                          const isSelectable = sisa > 0;
                          
                          return (
                            <tr 
                              key={trx._id} 
                              className={`${isSelectable ? 'hover:bg-blue-50' : 'bg-gray-50'} transition`}
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <input
                                  type="checkbox"
                                  checked={selectedIds.includes(trx._id)}
                                  onChange={() => handleCheckbox(trx._id)}
                                  disabled={!isSelectable}
                                  className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
                                    !isSelectable ? 'opacity-50 cursor-not-allowed' : ''
                                  }`}
                                />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(trx.date)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{trx.itemName}</div>
                                {trx.note && (
                                  <div className="text-xs text-gray-500 mt-1">{trx.note}</div>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                                {formatCurrency(trx.total)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                                {formatCurrency(trx.paid || 0)}
                              </td>
                              <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${
                                sisa > 0 ? 'text-red-600' : 'text-green-600'
                              }`}>
                                {formatCurrency(sisa)}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Payment Form */}
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Form Pembayaran</h2>
                  <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                          Tanggal Pembayaran
                        </label>
                        <input
                          type="date"
                          id="date"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">
                          Catatan Pembayaran (Opsional)
                        </label>
                        <input
                          type="text"
                          id="note"
                          placeholder="Contoh: Transfer via Bank ABC"
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                        />
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 rounded-md">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">Total Pembayaran</h3>
                          <p className="text-sm text-gray-500">
                            {selectedIds.length} transaksi terpilih
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-700">
                            {formatCurrency(amount)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <button
                        type="submit"
                        disabled={loading.submit || selectedIds.length === 0}
                        className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                          loading.submit || selectedIds.length === 0 ? 'opacity-70 cursor-not-allowed' : ''
                        }`}
                      >
                        {loading.submit ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Memproses Pembayaran...
                          </>
                        ) : (
                          'Konfirmasi Pembayaran'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}