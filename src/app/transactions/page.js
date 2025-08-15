"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AddTransaction() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    itemId: "",
    itemName: "",
    price: "",
    quantity: 1,
    date: "",
    note: "",
  });

  useEffect(() => {
    async function fetchItems() {
      const userId = localStorage.getItem("userId");
      const res = await fetch("/api/items", {
        headers: { "x-user-id": userId }
      });
      const data = await res.json();
      setItems(data.items || []);
    }
    fetchItems();
    setForm(f => ({
      ...f,
      date: new Date().toISOString().slice(0, 10),
    }));
  }, []);

  const handleItemChange = (e) => {
    const item = items.find(i => i._id === e.target.value);
    if (item) {
      setForm({
        ...form,
        itemId: item._id,
        itemName: item.name,
        price: item.price
      });
    } else {
      setForm({
        ...form,
        itemId: "",
        itemName: "",
        price: ""
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("User tidak ditemukan, silakan login ulang.");
      return;
    }
    const res = await fetch("/api/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": userId
      },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (res.ok) {
      alert("Transaksi berhasil ditambahkan!");
      router.push("/riwayat");
    } else {
      alert(data.message || "Terjadi kesalahan");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8">
      <div className="bg-white shadow rounded-lg p-8 w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-6 text-blue-700 text-center">Tambah Transaksi Utang</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-semibold mb-1">Pilih Item Favorit (opsional)</label>
            <select
              onChange={handleItemChange}
              value={form.itemId}
              className="w-full p-2 border rounded"
            >
              <option value="">-- Pilih dari daftar item favorit --</option>
              {items.map(item => (
                <option key={item._id} value={item._id}>{item.name}</option>
              ))}
            </select>
            <span className="block text-xs text-gray-500 mt-1">
              Pilih item jika sering digunakan, atau isi manual di bawah.
            </span>
          </div>

          <div>
            <label className="block font-semibold mb-1">Nama Barang <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="itemName"
              placeholder="Contoh: Rokok, Kopi, dll"
              value={form.itemName}
              onChange={e => setForm({ ...form, itemName: e.target.value, itemId: "" })}
              className="w-full p-2 border rounded"
              required={!form.itemId}
              autoComplete="off"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Harga <span className="text-red-500">*</span></label>
            <input
              type="number"
              name="price"
              placeholder="Masukkan harga barang"
              value={form.price}
              onChange={e => setForm({ ...form, price: e.target.value })}
              className="w-full p-2 border rounded"
              required
              min="0"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Jumlah <span className="text-red-500">*</span></label>
            <input
              type="number"
              name="quantity"
              placeholder="Masukkan jumlah barang"
              value={form.quantity}
              onChange={e => setForm({ ...form, quantity: e.target.value })}
              className="w-full p-2 border rounded"
              required
              min="1"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Tanggal</label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={e => setForm({ ...form, date: e.target.value })}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Catatan</label>
            <input
              type="text"
              name="note"
              placeholder="Catatan tambahan (opsional)"
              value={form.note}
              onChange={e => setForm({ ...form, note: e.target.value })}
              className="w-full p-2 border rounded"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition font-semibold"
          >
            Simpan Transaksi
          </button>
        </form>
      </div>
    </div>
  );
}
