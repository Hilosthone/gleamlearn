import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class", // Enables class-based dark mode
  theme: {
    extend: {
      colors: {
        // gleamLearn Brand Color System
        brand: {
          blue: "#2563EB",      // Spark Blue - Primary brand & actions
          green: "#10B981",     // Learning Green - Success & mastery badges
          orange: "#F97316",    // Orange - Accents, streaks & warnings
          purple: "#7C3AED",    // AI Purple - AI companions, tutors & smart features
          red: "#EF4444",       // Red - Errors & destructive actions
        },
        dark: {
          bg: "#0B0F19",        // Deep immersive dark background
          card: "#111827",      // Card surface background
          border: "#1F2937",    // Subtle border color
        }
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "sans-serif"], // Plus Jakarta Sans typography
      },
      animation: {
        "float": "float 6s ease-in-out infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "gradient-shift": "gradientShift 8s ease infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        gradientShift: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        }
      }
    },
  },
  plugins: [],
};

export default config;