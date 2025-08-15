'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AddItem() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: ""
  });
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      router.push("/login");
      return;
    }
    fetchItems(userId);
  }, [router]);

  const fetchItems = async (userId) => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch("/api/items", {
        headers: { 
          "x-user-id": userId,
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });

      if (!res.ok) {
        throw new Error("Failed to fetch items");
      }

      const data = await res.json();
      setItems(data.items || []);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");
    
    if (!userId || !token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-user-id": userId,
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          ...form,
          price: Number(form.price)
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to add item");
      }

      const data = await res.json();
      alert(data.message || "Item added successfully");
      setForm({ name: "", description: "", price: "" });
      fetchItems(userId);
    } catch (err) {
      console.error("Submit error:", err);
      alert(err.message || "Error adding item");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");
    
    if (!userId || !token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(`/api/items?id=${id}`, {
        method: "DELETE",
        headers: { 
          "x-user-id": userId,
          "Authorization": `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete item");
      }

      fetchItems(userId);
    } catch (err) {
      console.error("Delete error:", err);
      alert(err.message || "Error deleting item");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-xl mx-auto bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold mb-4 text-blue-700">Tambah Item Favorit</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Nama Item (misal: Rokok)"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
          <textarea
            name="description"
            placeholder="Deskripsi (opsional)"
            value={form.description}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          <input
            type="number"
            name="price"
            placeholder="Harga"
            value={form.price}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
            min="0"
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
          >
            Tambah Item
          </button>
        </form>
      </div>
      <div className="max-w-3xl mx-auto bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-blue-700">Daftar Item Favorit</h3>
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-blue-100">
              <tr>
                <th className="p-2 border">Nama</th>
                <th className="p-2 border">Deskripsi</th>
                <th className="p-2 border">Harga</th>
                <th className="p-2 border">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center p-4 text-gray-400">Belum ada item</td>
                </tr>
              )}
              {items.map(item => (
                <tr key={item.id || item._id} className="text-center hover:bg-blue-50 transition">
                  <td className="p-2 border">{item.name}</td>
                  <td className="p-2 border">{item.description}</td>
                  <td className="p-2 border">Rp {item.price?.toLocaleString?.() ?? item.price}</td>
                  <td className="p-2 border">
                    <button
                      onClick={() => handleDelete(item.id || item._id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-gray-500 text-sm">
          * Item di sini hanya sebagai favorit/opsional agar mudah dipilih saat tambah transaksi. Tidak wajib diisi jika hanya transaksi sekali.
        </p>
      </div>
    </div>
  );
}