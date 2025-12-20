import { useTheme } from "../theme";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
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
