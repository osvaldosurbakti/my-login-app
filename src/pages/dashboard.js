import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { jwtDecode } from "jwt-decode"; // Changed import

export default function Dashboard() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (typeof window === "undefined") return;
        
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        const decoded = jwtDecode(token); // Direct usage now
        
        const currentTime = Date.now() / 1000;
        if (decoded.exp < currentTime) {
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }

        setUserEmail(decoded.email);
      } catch (error) {
        console.error("Authentication error:", error);
        localStorage.removeItem("token");
        router.push("/login");
      }
    };

    checkAuth();
  }, [router]);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Dashboard</h1>
      {userEmail && <p>Halo, {userEmail} 👋</p>}
      <button
        onClick={() => {
          localStorage.removeItem("token");
          router.push("/");
        }}
      >
        Logout
      </button>
    </div>
  );
}