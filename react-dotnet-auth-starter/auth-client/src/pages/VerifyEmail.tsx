import { useEffect, useState } from "react";

export default function VerifyEmail() {
  const [msg, setMsg] = useState("Verifying...");
  useEffect(() => {
    const url = new URL(window.location.href);
    const userId = url.searchParams.get("userId");
    const token = url.searchParams.get("token");
    fetch(`${import.meta.env.VITE_API_URL}/auth/confirm-email?userId=${encodeURIComponent(userId || "")}&token=${encodeURIComponent(token || "")}`)
      .then(() => setMsg("Email confirmed! You can now login."))
      .catch(() => setMsg("Verification failed."))
  }, []);
  return <p>{msg}</p>;
}
