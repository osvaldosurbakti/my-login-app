// src/pages/cart.js
import { useState, useEffect } from "react";
import Link from "next/link";

export default function CartPage() {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    // Ambil cart dari localStorage atau API Mongo
    const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(savedCart);
  }, []);

  const removeFromCart = (itemId) => {
    const updatedCart = cart.filter((item) => item._id !== itemId);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-4">Keranjang Belanja</h1>

      {cart.length === 0 ? (
        <p className="text-gray-600">
          Keranjang kosong. <Link href="/items" className="text-blue-500">Belanja sekarang</Link>
        </p>
      ) : (
        <>
          <ul className="space-y-4">
            {cart.map((item) => (
              <li key={item._id} className="bg-white p-4 rounded-lg shadow flex justify-between">
                <div>
                  <h2 className="font-semibold">{item.name}</h2>
                  <p className="text-gray-600">Rp {item.price.toLocaleString()}</p>
                </div>
                <button
                  onClick={() => removeFromCart(item._id)}
                  className="text-red-500 hover:underline"
                >
                  Hapus
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-6 p-4 bg-white rounded-lg shadow">
            <p className="text-lg font-semibold">Total: Rp {totalPrice.toLocaleString()}</p>
            <Link
              href="/payment"
              className="mt-4 inline-block bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Lanjut ke Pembayaran
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
