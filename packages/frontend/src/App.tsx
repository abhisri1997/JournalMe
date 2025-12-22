import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import ProfileMenu from "./components/ProfileMenu";
import ThemeToggle from "./components/ThemeToggle";
import { HomeIcon, JournalIcon, UserIcon } from "./components/Icons";
import { getToken } from "./auth";

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAuthed, setIsAuthed] = useState(!!getToken());

  useEffect(() => {
    const updateAuth = () => setIsAuthed(!!getToken());
    window.addEventListener("storage", updateAuth);
    window.addEventListener("focus", updateAuth);
    return () => {
      window.removeEventListener("storage", updateAuth);
      window.removeEventListener("focus", updateAuth);
    };
  }, []);
  return (
    <div className='site-container'>
      <nav className='site-nav' role='navigation' aria-label='Main navigation'>
        <div className='nav-left'>
          <div className='logo' aria-label='JournalMe logo'>
            <JournalIcon className='logo-icon' />
            <span className='logo-text'>JournalMe</span>
          </div>
          <div
            id='primary-navigation'
            className={`nav-links ${menuOpen ? "open" : ""}`}
            aria-label='Primary'
          >
            <NavLink to='/' end aria-label='Home'>
              <HomeIcon className='icon' /> Home
            </NavLink>
            <NavLink to='/journal' aria-label='Journal'>
              <JournalIcon className='icon' /> Journal
            </NavLink>
            <NavLink to='/login' aria-label='Login'>
              <UserIcon className='icon' /> Login
            </NavLink>
            <NavLink to='/register' aria-label='Register'>
              <UserIcon className='icon' /> Register
            </NavLink>
          </div>
        </div>
        <div className='nav-right'>
          <button
            className='menu-button'
            aria-label='Toggle menu'
            aria-controls='primary-navigation'
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            Menu
          </button>
          <ThemeToggle />
          {isAuthed && <ProfileMenu />}
        </div>
      </nav>
      <section className='welcome-card' aria-label='Welcome message'>
        <h2 className='welcome-title'>Welcome to JournalMe</h2>
        <p className='welcome-text'>
          A simple journaling app—use the navigation to access pages.
        </p>
      </section>
    </div>
  );
}
