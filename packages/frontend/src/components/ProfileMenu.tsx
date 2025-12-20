import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { clearToken, getToken } from "../auth";

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
    const storedUser = localStorage.getItem("jm_user");
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
    localStorage.removeItem("jm_user");
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
    <div
      ref={menuRef}
      style={{
        position: "relative",
        display: "inline-block",
      }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label='Profile menu'
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          border: "none",
          backgroundColor: "#2563eb",
          color: "white",
          cursor: "pointer",
          fontSize: "1rem",
          fontWeight: "600",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
        }}
        title={user.email}
      >
        {initials || "U"}
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            marginTop: "8px",
            backgroundColor: "var(--card)",
            border: "1px solid rgba(0, 0, 0, 0.1)",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            minWidth: "200px",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              padding: "12px 16px",
              borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
            }}
          >
            <div
              style={{
                fontSize: "0.9rem",
                fontWeight: "600",
                color: "var(--text)",
              }}
            >
              {user.email}
            </div>
          </div>

          <button
            onClick={() => {
              navigate("/profile");
              setIsOpen(false);
            }}
            style={{
              width: "100%",
              padding: "10px 16px",
              backgroundColor: "transparent",
              border: "none",
              color: "var(--text)",
              textAlign: "left",
              cursor: "pointer",
              fontSize: "0.95rem",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor =
                "rgba(0, 0, 0, 0.05)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor =
                "transparent";
            }}
          >
            Edit Profile
          </button>

          <button
            onClick={() => {
              navigate("/settings");
              setIsOpen(false);
            }}
            style={{
              width: "100%",
              padding: "10px 16px",
              backgroundColor: "transparent",
              border: "none",
              color: "var(--text)",
              textAlign: "left",
              cursor: "pointer",
              fontSize: "0.95rem",
              borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor =
                "rgba(0, 0, 0, 0.05)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor =
                "transparent";
            }}
          >
            Settings
          </button>

          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              padding: "10px 16px",
              backgroundColor: "transparent",
              border: "none",
              color: "#dc3545",
              textAlign: "left",
              cursor: "pointer",
              fontSize: "0.95rem",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor =
                "rgba(220, 53, 69, 0.1)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor =
                "transparent";
            }}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
