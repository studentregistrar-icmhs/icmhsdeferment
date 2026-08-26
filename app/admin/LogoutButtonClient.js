"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButtonClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      await fetch("/api/logout", { method: "POST" });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button className="logout-btn" type="button" onClick={handleLogout} disabled={loading}>
      {loading ? "Signing out…" : "Sign out"}
    </button>
  );
}
