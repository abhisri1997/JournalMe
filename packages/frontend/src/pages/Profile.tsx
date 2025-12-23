import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavigationBar from "../components/NavigationBar";
import { useAuth } from "../hooks";
import { UserService } from "../services/api";
import { STORAGE_KEYS } from "../constants";

type User = {
  id: string;
  email: string;
  displayName?: string;
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
    if (!storedUser) {
      navigate("/");
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setDisplayName(parsedUser.displayName || "");
    } catch (e) {
      navigate("/");
    }
  }, [navigate]);

  const handleSave = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const updatedUser = await UserService.updateProfile(displayName);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
      setUser(updatedUser);
      setSuccess("Profile updated successfully!");
      setTimeout(() => navigate("/journal"), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <main className='site-container'>
      <NavigationBar
        isAuthenticated={isAuthenticated}
        menuOpen={menuOpen}
        onMenuToggle={() => setMenuOpen((v) => !v)}
      />
      <section style={{ marginTop: 16 }}>
        <h1>Edit Profile</h1>

        <div style={{ display: "grid", gap: "16px" }}>
          <div>
            <label
              htmlFor='email'
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
              }}
            >
              Email
            </label>
            <input
              id='email'
              type='email'
              value={user.email}
              disabled
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "4px",
                border: "1px solid rgba(0, 0, 0, 0.2)",
                backgroundColor: "var(--card)",
                color: "var(--text)",
                opacity: 0.6,
                cursor: "not-allowed",
              }}
            />
            <small
              style={{
                display: "block",
                marginTop: "4px",
                color: "var(--muted)",
              }}
            >
              Email cannot be changed
            </small>
          </div>

          <div>
            <label
              htmlFor='displayName'
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
              }}
            >
              Display Name (optional)
            </label>
            <input
              id='displayName'
              type='text'
              placeholder='Enter your name'
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "4px",
                border: "1px solid rgba(0, 0, 0, 0.2)",
                backgroundColor: "var(--card)",
                color: "var(--text)",
                fontSize: "1rem",
              }}
            />
          </div>

          {error && (
            <div
              style={{
                padding: "12px",
                backgroundColor: "#f8d7da",
                color: "#721c24",
                borderRadius: "4px",
              }}
            >
              {error}
            </div>
          )}

          {success && (
            <div
              style={{
                padding: "12px",
                backgroundColor: "#d4edda",
                color: "#155724",
                borderRadius: "4px",
              }}
            >
              {success}
            </div>
          )}

          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </button>
            <button
              onClick={() => navigate("/journal")}
              style={{
                backgroundColor: "transparent",
                color: "var(--text)",
                border: "1px solid rgba(0, 0, 0, 0.2)",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
