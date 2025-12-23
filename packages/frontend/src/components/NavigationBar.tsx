import React from "react";
import { NavLink } from "react-router-dom";
import ProfileMenu from "./ProfileMenu";
import ThemeToggle from "./ThemeToggle";
import { HomeIcon, JournalIcon, UserIcon } from "./Icons";

interface NavigationBarProps {
  isAuthenticated: boolean;
  menuOpen: boolean;
  onMenuToggle: () => void;
}

export default function NavigationBar({
  isAuthenticated,
  menuOpen,
  onMenuToggle,
}: NavigationBarProps) {
  return (
    <>
      <div className='mobile-top-bar'>
        <div className='logo' aria-label='JournalMe logo'>
          <JournalIcon className='logo-icon' />
          <span className='logo-text'>JournalMe</span>
        </div>
        <div className='mobile-top-actions'>
          {isAuthenticated ? <ProfileMenu /> : <ThemeToggle />}
        </div>
      </div>

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
            <NavLink to='/journal' aria-label='Journal'>
              <JournalIcon className='icon' /> Journal
            </NavLink>
            <NavLink to='/' end aria-label='Home'>
              <HomeIcon className='icon' /> Home
            </NavLink>
            {isAuthenticated && (
              <NavLink to='/community' aria-label='Community'>
                <JournalIcon className='icon' /> Community
              </NavLink>
            )}
            {!isAuthenticated && (
              <>
                <NavLink to='/login' aria-label='Login'>
                  <UserIcon className='icon' /> Login
                </NavLink>
                <NavLink to='/register' aria-label='Register'>
                  <UserIcon className='icon' /> Register
                </NavLink>
              </>
            )}
          </div>
        </div>
        <div className='nav-right'>
          <button
            className='menu-button'
            aria-label='Toggle menu'
            aria-controls='primary-navigation'
            aria-expanded={menuOpen}
            onClick={onMenuToggle}
          >
            Menu
          </button>
          {!isAuthenticated && <ThemeToggle />}
          {isAuthenticated && <ProfileMenu />}
        </div>
      </nav>
    </>
  );
}
