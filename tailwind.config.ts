import type { Config } from "tailwindcss";

/**
 * Sistema de diseño — Golf Partner Hub
 * Paleta inspirada en el campo: verde fairway profundo, arena de bunker,
 * latón de trofeo y neutros cálidos. Pensada para uso diario sin fatiga visual.
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        fairway: {
          50: "#EFF6F1",
          100: "#D8EADD",
          200: "#AFd4BA",
          300: "#7FB893",
          400: "#4C976C",
          500: "#2E7A52",
          600: "#1F6141",
          700: "#194F36",
          800: "#143E2B",
          900: "#0F3D2E",
          950: "#082419",
        },
        sand: {
          50: "#FBF9F4",
          100: "#F6F1E6",
          200: "#EDE3CE",
          300: "#E0D0AF",
        },
        brass: {
          400: "#C6A468",
          500: "#B08D57",
          600: "#96753F",
        },
        ink: "#1C2422",
        danger: "#B3402A",
        warn: "#C07C1F",
        ok: "#2E7A52",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-fraunces)", "Georgia", "serif"],
      },
      borderRadius: {
        card: "0.875rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(28,36,34,.06), 0 4px 16px rgba(28,36,34,.05)",
      },
    },
  },
  plugins: [],
};
export default config;
