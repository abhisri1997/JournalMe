import ProfileMenu from "./ProfileMenu";

export default function Header() {
  return (
    <header className='journal-header'>
      <h1>JournalMe</h1>
      <div className='header-actions'>
        <ProfileMenu />
      </div>
    </header>
  );
}
