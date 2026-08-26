"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Incorrect password.");
      }
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-box">
      <h2>Registrar sign-in</h2>
      <p style={{ fontSize: 13, opacity: 0.7, marginTop: -8 }}>
        Enter the staff password to view deferment requests.
      </p>
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Password</label>
          <input
            type="password"
            required
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button className="primary" type="submit" disabled={loading} style={{ width: "100%" }}>
          {loading ? "Checking…" : "Sign in"}
        </button>
        {error && <div className="err">{error}</div>}
      </form>
    </div>
  );
}
