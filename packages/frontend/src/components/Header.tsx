import ProfileMenu from "./ProfileMenu";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "../hooks";

export default function Header() {
  const { isAuthenticated } = useAuth();

  return (
    <header className='journal-header'>
      <h1>JournalMe</h1>
      <div className='header-actions'>
        {!isAuthenticated && <ThemeToggle />}
        <ProfileMenu />
      </div>
    </header>
  );
}
