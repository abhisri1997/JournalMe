import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (!tokenParam) {
      setError("No reset token provided. Please check your email link.");
    } else {
      setToken(tokenParam);
    }
  }, [searchParams]);

  async function submit() {
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to reset password");
      }
      setSuccess(true);
      setNewPassword("");
      setConfirmPassword("");
      // Redirect to login after 2 seconds
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to reset password";
      setError(message);
      console.error("Reset password error:", err);
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
        <h1 style={{ margin: 0 }}>Reset Password</h1>
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
        {!token ? (
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
        ) : (
          <>
            <div>
              <label
                htmlFor='password'
                style={{ display: "block", marginBottom: 4 }}
              >
                New Password
              </label>
              <input
                id='password'
                type='password'
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder='Enter new password'
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
              <small
                style={{
                  display: "block",
                  marginTop: 4,
                  color: "var(--text-light)",
                }}
              >
                At least 8 characters
              </small>
            </div>

            <div>
              <label
                htmlFor='confirm'
                style={{ display: "block", marginBottom: 4 }}
              >
                Confirm Password
              </label>
              <input
                id='confirm'
                type='password'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder='Confirm new password'
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
                Password reset successfully! Redirecting to login...
              </div>
            )}

            <button
              onClick={submit}
              disabled={loading || !newPassword || !confirmPassword}
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
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </>
        )}
      </div>
    </main>
  );
}
