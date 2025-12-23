import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { clearToken, getToken } from "../auth";
import { STORAGE_KEYS } from "../constants";

type User = {
  id: string;
  email: string;
};

export default function ProfileMenu() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Try to get user from session or fetch it
    const token = getToken();
    if (!token) {
      console.log("No token found");
      return;
    }

    // For now, we'll extract email from a potential user info endpoint
    // You might need to add a /api/auth/me endpoint to get current user
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
    console.log(
      "ProfileMenu: token exists:",
      !!token,
      "storedUser:",
      storedUser
    );
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        console.log("ProfileMenu: parsed user:", parsed);
        setUser(parsed);
      } catch (e) {
        console.error("Failed to parse user:", e);
      }
    } else {
      console.log("No stored user found in localStorage");
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleLogout = () => {
    clearToken();
    localStorage.removeItem(STORAGE_KEYS.USER);
    navigate("/", { replace: true });
  };

  if (!user) return null;

  // Extract initials from email
  const initials = user.email
    .split("@")[0]
    .split(".")
    .map((part) => part[0].toUpperCase())
    .join("");

  return (
    <div ref={menuRef} className='relative inline-block'>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label='Profile menu'
        className='flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400'
        title={user.email}
      >
        {initials || "U"}
      </button>

      {isOpen && (
        <div className='absolute right-0 mt-2 min-w-[200px] rounded-lg border border-black/10 bg-[var(--card)] shadow-lg z-50'>
          <div className='border-b border-black/10 px-4 py-3'>
            <div className='text-sm font-semibold text-[var(--text)]'>
              {user.email}
            </div>
          </div>

          <button
            onClick={() => {
              navigate("/profile");
              setIsOpen(false);
            }}
            className='w-full bg-transparent px-4 py-2.5 text-left text-sm text-[var(--text)] hover:bg-black/5'
          >
            Edit Profile
          </button>

          <button
            onClick={() => {
              navigate("/settings");
              setIsOpen(false);
            }}
            className='w-full bg-transparent border-b border-black/10 px-4 py-2.5 text-left text-sm text-[var(--text)] hover:bg-black/5'
          >
            Settings
          </button>

          <button
            onClick={handleLogout}
            className='w-full bg-transparent px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50'
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
