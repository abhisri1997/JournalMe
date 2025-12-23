import { useTheme } from "../theme";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <label className='inline-flex items-center gap-2'>
      <input
        aria-label='Toggle dark mode'
        type='checkbox'
        checked={theme === "dark"}
        onChange={toggle}
      />
      <span>{theme === "dark" ? "Dark" : "Light"}</span>
    </label>
  );
}
