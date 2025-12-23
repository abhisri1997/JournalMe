import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavigationBar from "../components/NavigationBar";
import { useAuth } from "../hooks";
import { useTheme } from "../theme";

export default function SettingsPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
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
      <NavigationBar
        isAuthenticated={isAuthenticated}
        menuOpen={menuOpen}
        onMenuToggle={() => setMenuOpen((v) => !v)}
      />
      <section className='mt-4'>
        <h1 className='text-2xl font-semibold'>Settings</h1>

        <div className='grid gap-6'>
          <div className='border-b border-black/10 pb-4'>
            <h2 className='text-lg mb-3'>Appearance</h2>
            <div className='flex gap-3'>
              {["light", "dark"].map((t) => (
                <label
                  key={t}
                  className='flex items-center gap-2 cursor-pointer'
                >
                  <input
                    type='radio'
                    name='theme'
                    value={t}
                    checked={theme === t}
                    onChange={(e) => handleThemeChange(e.target.value)}
                  />
                  <span className='capitalize'>{t} Mode</span>
                </label>
              ))}
            </div>
          </div>

          <div className='border-b border-black/10 pb-4'>
            <h2 className='text-lg mb-3'>Recording Settings</h2>
            <p className='my-2 text-sm text-[var(--muted)]'>
              Microphone device is selected on the Journal page
            </p>
          </div>

          <div className='border-b border-black/10 pb-4'>
            <h2 className='text-lg mb-3'>About</h2>
            <p className='my-2 text-sm'>JournalMe v1.0.0</p>
            <p className='my-2 text-xs text-[var(--muted)]'>
              A simple journaling app with audio recording
            </p>
          </div>

          <button
            onClick={() => navigate("/journal")}
            className='border border-black/20 bg-transparent text-[var(--text)]'
          >
            Back to Journal
          </button>
        </div>
      </section>
    </main>
  );
}
