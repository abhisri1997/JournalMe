import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
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
      <div
        style={{
          marginBottom: 24,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1 style={{ margin: 0 }}>Login</h1>
        <button
          onClick={() => navigate("/")}
          style={{
            padding: "8px 12px",
            backgroundColor: "transparent",
            border: "1px solid var(--border)",
            borderRadius: "4px",
            cursor: "pointer",
            color: "var(--text)",
            fontSize: "0.9rem",
          }}
        >
          Home
        </button>
      </div>
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
        <div style={{ marginTop: 16, textAlign: "center", fontSize: "0.9rem" }}>
          Don't have an account?{" "}
          <button
            onClick={() => navigate("/register")}
            style={{
              background: "none",
              border: "none",
              color: "var(--primary, #007bff)",
              cursor: "pointer",
              textDecoration: "underline",
              padding: 0,
              font: "inherit",
            }}
          >
            Register here
          </button>
        </div>
        <div style={{ marginTop: 12, textAlign: "center", fontSize: "0.9rem" }}>
          <button
            onClick={() => navigate("/forgot-password")}
            style={{
              background: "none",
              border: "none",
              color: "var(--primary, #007bff)",
              cursor: "pointer",
              textDecoration: "underline",
              padding: 0,
              font: "inherit",
            }}
          >
            Forgot password?
          </button>
        </div>
      </div>
    </main>
  );
}
