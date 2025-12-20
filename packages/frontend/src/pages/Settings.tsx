import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { useTheme } from "../theme";

export default function SettingsPage() {
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();

  const handleThemeChange = (newTheme: string) => {
    if (newTheme === "light" && theme === "dark") {
      toggle();
    } else if (newTheme === "dark" && theme === "light") {
      toggle();
    }
  };

  return (
    <main className='site-container'>
      <Header />
      <section style={{ marginTop: 16 }}>
        <h1>Settings</h1>

        <div style={{ display: "grid", gap: "24px" }}>
          <div
            style={{
              borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
              paddingBottom: "16px",
            }}
          >
            <h2 style={{ fontSize: "1.1rem", marginBottom: "12px" }}>
              Appearance
            </h2>
            <div style={{ display: "flex", gap: "12px" }}>
              {["light", "dark"].map((t) => (
                <label
                  key={t}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type='radio'
                    name='theme'
                    value={t}
                    checked={theme === t}
                    onChange={(e) => handleThemeChange(e.target.value)}
                  />
                  <span style={{ textTransform: "capitalize" }}>{t} Mode</span>
                </label>
              ))}
            </div>
          </div>

          <div
            style={{
              borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
              paddingBottom: "16px",
            }}
          >
            <h2 style={{ fontSize: "1.1rem", marginBottom: "12px" }}>
              Recording Settings
            </h2>
            <p
              style={{
                margin: "8px 0",
                fontSize: "0.9rem",
                color: "var(--muted)",
              }}
            >
              Microphone device is selected on the Journal page
            </p>
          </div>

          <div
            style={{
              borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
              paddingBottom: "16px",
            }}
          >
            <h2 style={{ fontSize: "1.1rem", marginBottom: "12px" }}>About</h2>
            <p style={{ margin: "8px 0", fontSize: "0.9rem" }}>
              JournalMe v1.0.0
            </p>
            <p
              style={{
                margin: "8px 0",
                fontSize: "0.85rem",
                color: "var(--muted)",
              }}
            >
              A simple journaling app with audio recording
            </p>
          </div>

          <button
            onClick={() => navigate("/journal")}
            style={{
              backgroundColor: "transparent",
              color: "var(--text)",
              border: "1px solid rgba(0, 0, 0, 0.2)",
            }}
          >
            Back to Journal
          </button>
        </div>
      </section>
    </main>
  );
}
