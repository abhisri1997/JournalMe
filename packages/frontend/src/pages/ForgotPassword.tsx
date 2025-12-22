import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function submit() {
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to process request");
      }
      setSuccess(true);
      setEmail("");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to process request";
      setError(message);
      console.error("Forgot password error:", err);
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
        <h1 style={{ margin: 0 }}>Forgot Password</h1>
        <button
          onClick={() => navigate("/login")}
          style={{
            padding: "8px 12px",
            backgroundColor: "transparent",
            border: "1px solid var(--border)",
            borderRadius: "4px",
            cursor: "pointer",
            color: "var(--text)",
            fontSize: 14,
          }}
        >
          Back to Login
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <label htmlFor='email' style={{ display: "block", marginBottom: 4 }}>
            Email
          </label>
          <input
            id='email'
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder='your@email.com'
            style={{
              width: "100%",
              padding: "8px 12px",
              border: "1px solid var(--border)",
              borderRadius: "4px",
              backgroundColor: "var(--bg)",
              color: "var(--text)",
              boxSizing: "border-box",
            }}
          />
        </div>

        {error && (
          <div
            style={{
              padding: 12,
              backgroundColor: "#fee",
              color: "#c33",
              borderRadius: "4px",
              fontSize: 14,
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              padding: 12,
              backgroundColor: "#efe",
              color: "#3c3",
              borderRadius: "4px",
              fontSize: 14,
            }}
          >
            If an account exists with this email, a password reset link has been
            sent. Check your email!
          </div>
        )}

        <button
          onClick={submit}
          disabled={loading || !email}
          style={{
            padding: "10px 16px",
            backgroundColor: loading ? "#999" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "default" : "pointer",
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>

        <p style={{ textAlign: "center", fontSize: 14, marginTop: 16 }}>
          Remember your password?{" "}
          <a
            href='/login'
            style={{
              color: "#007bff",
              textDecoration: "none",
              cursor: "pointer",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.textDecoration = "underline")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.textDecoration = "none")
            }
          >
            Back to Login
          </a>
        </p>
      </div>
    </main>
  );
}
