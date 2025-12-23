import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "var(--border)",
        muted: "var(--muted)",
        danger: "var(--danger)",
      },
    },
  },
  plugins: [],
};

export default config;
