import Link from "next/link";

export default function Home() {
  return (
    <div style={{ textAlign: "center", padding: "40px" }}>
      <h1>Selamat Datang di My Login App 🚀</h1>
      <p>Aplikasi ini dibuat untuk demo fitur Login dan Register dengan MongoDB + JWT.</p>

      <div style={{ marginTop: "20px" }}>
        <Link href="/login">
          <button style={{ marginRight: "10px" }}>Login</button>
        </Link>
        <Link href="/register">
          <button>Register</button>
        </Link>
      </div>
    </div>
  );
}
