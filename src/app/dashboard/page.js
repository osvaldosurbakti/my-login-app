'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState(null); // Ubah initial state menjadi null
  const [authStatus, setAuthStatus] = useState('checking');
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setAuthStatus('unauthenticated');
      return false;
    }

    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      setAuthStatus('authenticated');
      return true;
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      setAuthStatus('unauthenticated');
      return false;
    }
  };

  useEffect(() => {
    const verifyAndLoad = async () => {
      const isAuthenticated = await checkAuth();
      
      if (isAuthenticated) {
        await fetchData();
      } else {
        router.replace('/login');
      }
    };

    verifyAndLoad();

    const handleStorageChange = () => {
      if (!localStorage.getItem('token')) {
        router.replace('/login');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [router]);

  async function fetchData() {
  try {
    setIsLoading(true);
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    
    if (!userId || !token) {
      throw new Error('Missing credentials');
    }

    const res = await fetch('/api/dashboard', {
      headers: {
        'x-user-id': userId,
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to fetch dashboard data');
    }

    setStats({
      totalUnpaid: data.totalUnpaid || 0,
      transaksiBulanIni: data.transaksiBulanIni || 0,
      transaksiLunasBulanIni: data.transaksiLunasBulanIni || 0,
      recentTransactions: data.recentTransactions || []
    });
  } catch (error) {
    console.error('Dashboard fetch error:', error);
    alert(`Error: ${error.message}`);
    // Don't redirect immediately - let user see the error
  } finally {
    setIsLoading(false);
  }
}

 const handleLogout = async () => {
  try {
    const response = await fetch('/api/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      credentials: 'include' // Penting untuk cookie-based auth
    });

    if (!response.ok) throw new Error('Logout failed');

    // Bersihkan local storage
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    
    // Redirect ke halaman login
    router.push('/login');
  } catch (error) {
    console.error('Logout error:', error);
    alert('Logout failed. Please try again.');
  }
};

  // Fungsi untuk memformat nilai dengan aman
  const formatCurrency = (value) => {
    if (value === undefined || value === null) return 'Rp 0';
    return `Rp ${Number(value).toLocaleString('id-ID')}`;
  };

  if (authStatus === 'checking') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Memeriksa autentikasi...</p>
        </div>
      </div>
    );
  }

  if (authStatus === 'unauthenticated' || !stats) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white shadow mb-6">
        <h1 className="text-2xl font-bold text-blue-700">Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition"
        >
          Logout
        </button>
      </header>

      <main className="p-6 max-w-5xl mx-auto">
        {/* Ringkasan */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card
            title="Total Utang Belum Dibayar"
            value={formatCurrency(stats.totalUnpaid)}
            icon="💸"
          />
          <Card
            title="Transaksi Bulan Ini"
            value={stats.transaksiBulanIni}
            icon="🗓️"
          />
          <Card
            title="Transaksi Lunas Bulan Ini"
            value={stats.transaksiLunasBulanIni}
            icon="✅"
          />
        </div>

        {/* Shortcut */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Shortcut label="Tambah Transaksi" onClick={() => router.push("/transactions")} icon="➕" />
          <Shortcut label="Kelola Barang" onClick={() => router.push("/items")} icon="📦" />
          <Shortcut label="Riwayat Transaksi" onClick={() => router.push("/riwayat")} icon="📜" />
          <Shortcut label="Pembayaran" onClick={() => router.push("/pembayaran")} icon="💳" />
        </div>

        {/* Transaksi Terbaru */}
        <section className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4 text-blue-700">Transaksi Terbaru</h2>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-blue-100">
                <tr>
                  <th className="p-2 border">Tanggal</th>
                  <th className="p-2 border">Barang</th>
                  <th className="p-2 border">Total</th>
                  <th className="p-2 border">Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center p-4 text-gray-400">Belum ada transaksi</td>
                  </tr>
                ) : (
                  stats.recentTransactions.map((trx, i) => (
                    <tr key={i} className="text-center hover:bg-blue-50 transition">
                      <td className="p-2 border">{formatDate(trx.date || trx.tanggal)}</td>
                      <td className="p-2 border">{trx.itemName || trx.barang}</td>
                      <td className="p-2 border">{formatCurrency(trx.total)}</td>
                      <td className="p-2 border">
                        <StatusBadge status={trx.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

// Komponen Card Ringkasan
function Card({ title, value, icon }) {
  return (
    <div className="bg-white p-6 shadow rounded-lg flex items-center gap-4">
      <span className="text-3xl">{icon}</span>
      <div>
        <h3 className="text-sm text-gray-500">{title}</h3>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
  );
}

// Komponen Shortcut
function Shortcut({ label, onClick, icon }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center bg-blue-500 text-white p-4 rounded-lg hover:bg-blue-600 transition shadow"
    >
      <span className="text-2xl mb-1">{icon}</span>
      <span className="font-semibold">{label}</span>
    </button>
  );
}

// Komponen Badge Status
function StatusBadge({ status }) {
  if (status === "Lunas") {
    return <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-semibold">Lunas</span>;
  }
  return <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-semibold">{status || "Belum Lunas"}</span>;
}

// Format tanggal
function formatDate(date) {
  if (!date) return "-";
  const d = new Date(date);
  if (isNaN(d)) return date;
  return d.toLocaleDateString("id-ID", { 
    year: "numeric", 
    month: "short", 
    day: "numeric" 
  });
}