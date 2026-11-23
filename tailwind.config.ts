import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Hiryze brand palette
        forest: {
          DEFAULT: "#0D2F31",
          light: "#1a4446",
          dark: "#081e1f",
        },
        steel: "#6184AB",
        cream: {
          DEFAULT: "#F5EFE2",
          dark: "#EDE4D0",
        },
        sand: "#DDD5C2",
      },
      fontFamily: {
        display: ["adonis-web", "Cormorant Garamond", "Georgia", "serif"],
        body: ["Pontano Sans", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-up": "fadeUp 0.5s ease both",
        shimmer: "shimmer 2.5s linear infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { transform: "translateX(-150%)" },
          "100%": { transform: "translateX(150%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
