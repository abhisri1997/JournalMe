import ProfileMenu from "./ProfileMenu";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  return (
    <header className='journal-header'>
      <h1>JournalMe</h1>
      <div className='header-actions'>
        <ThemeToggle />
        <ProfileMenu />
      </div>
    </header>
  );
}
