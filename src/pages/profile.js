import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function Profile() {
  const [email, setEmail] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    } else {
      import("jwt-decode").then(({ default: jwtDecode }) => {
        const decoded = jwtDecode(token);
        setEmail(decoded.email);
      });
    }
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Profil User</h1>
      {email && <p>Email: {email}</p>}
    </div>
  );
}
