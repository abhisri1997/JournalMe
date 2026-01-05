import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavigationBar from "../components/NavigationBar";
import { useAuth } from "../hooks";
import { UserService } from "../services/api";
import { STORAGE_KEYS } from "../constants";

type User = {
  id: string;
  email: string;
  username: string;
  displayName?: string;
};

export default function EditProfilePage() {
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
      setTimeout(() => navigate("/profile"), 2000);
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
      <section className='mt-6'>
        <h1 className='text-2xl font-semibold mb-6'>Edit Profile</h1>

        <div className='max-w-md'>
          <div className='grid gap-4'>
            <div>
              <label htmlFor='email' className='block mb-2 font-semibold'>
                Email
              </label>
              <input
                id='email'
                type='email'
                value={user.email}
                disabled
                className='w-full rounded-md border border-black/20 bg-[var(--card)] text-[var(--text)] px-3 py-2 opacity-60 cursor-not-allowed'
              />
              <small className='mt-1 block text-[var(--muted)]'>
                Email cannot be changed
              </small>
            </div>

            <div>
              <label htmlFor='displayName' className='block mb-2 font-semibold'>
                Display Name (optional)
              </label>
              <input
                id='displayName'
                type='text'
                placeholder='Enter your name'
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className='w-full rounded-md border border-black/20 bg-[var(--card)] text-[var(--text)] px-3 py-2 text-base'
              />
            </div>

            {error && (
              <div className='rounded-md bg-[var(--error)]/10 text-[var(--error)] p-3'>
                {error}
              </div>
            )}

            {success && (
              <div className='rounded-md bg-[var(--success)]/10 text-[var(--success)] p-3'>
                {success}
              </div>
            )}

            <div className='flex gap-2 pt-2'>
              <button
                onClick={handleSave}
                disabled={loading}
                className='px-6 py-2 bg-[var(--accent)] text-[#faf6f0] rounded-md hover:bg-[var(--accent-hover)] transition disabled:opacity-50'
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
              <button
                onClick={() => navigate("/profile")}
                className='px-6 py-2 border border-black/20 bg-transparent text-[var(--text)] rounded-md hover:bg-black/5 transition'
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
