import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Login failed");
      }
      const data = await res.json();
      localStorage.setItem("jm_token", data.token);
      // Store user info from the response
      if (data.user) {
        localStorage.setItem("jm_user", JSON.stringify(data.user));
      }
      // set a minimal user indicator
      window.location.href = "/";
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 24, maxWidth: 640, margin: "0 auto" }}>
      <h1>Login</h1>
      <div style={{ display: "grid", gap: 8 }}>
        <input
          placeholder='Email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          placeholder='Password'
          type='password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && (
          <div style={{ color: "#dc3545", fontSize: "0.9rem" }}>{error}</div>
        )}
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={submit} disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </div>
      </div>
    </main>
  );
}
