import { useState } from "react";
import { setToken } from "../auth";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function submit() {
    setError("");
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Register error response:", {
          status: res.status,
          statusText: res.statusText,
          body: errorText,
        });
        let err;
        try {
          err = JSON.parse(errorText);
        } catch {
          err = { error: errorText || `HTTP ${res.status}` };
        }
        throw new Error(err.error || "Register failed");
      }
      const data = await res.json();
      if (data.token) setToken(data.token);
      // Store user info from the response
      if (data.user) {
        localStorage.setItem("jm_user", JSON.stringify(data.user));
      }
      // Navigate to journal after success
      navigate("/journal");
    } catch (err) {
      console.error("Register exception:", err);
      const message = (err as Error).message || "Register failed";
      // Parse Prisma unique constraint error
      if (
        message.includes("User already exists") ||
        message.includes("Unique")
      ) {
        setError(
          "This email is already registered. Try logging in or using a different email."
        );
      } else {
        setError(message);
      }
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
        <h1 style={{ margin: 0 }}>Register</h1>
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
      {error && (
        <div
          style={{
            color: "red",
            marginBottom: 16,
            padding: 12,
            backgroundColor: "#ffe0e0",
            borderRadius: 4,
          }}
        >
          {error}
        </div>
      )}
      <div style={{ display: "grid", gap: 8 }}>
        <input
          placeholder='Email'
          type='email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          placeholder='Password (min 8 characters)'
          type='password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={submit} disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </div>
        <div style={{ marginTop: 16, textAlign: "center", fontSize: "0.9rem" }}>
          Already have an account?{" "}
          <button
            onClick={() => navigate("/login")}
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
            Login here
          </button>
        </div>
      </div>
    </main>
  );
}
