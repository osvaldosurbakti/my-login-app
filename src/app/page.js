'use client';

import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 px-4">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">
        Selamat Datang di <span className="text-blue-600">My Login App 🚀</span>
      </h1>
      <p className="text-lg text-gray-600 max-w-md text-center">
        Aplikasi ini dibuat untuk demo fitur <span className="font-semibold">Login</span> dan{" "}
        <span className="font-semibold">Register</span> dengan MongoDB + JWT.
      </p>

      <div className="mt-6 flex gap-4">
        <Link href="/login">
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition duration-200">
            Login
          </button>
        </Link>
        <Link href="/register">
          <button className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg shadow hover:bg-gray-300 transition duration-200">
            Register
          </button>
        </Link>
      </div>
    </div>
  );
}
