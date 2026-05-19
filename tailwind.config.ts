import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sf: {
          black: "#111111",
          white: "#FFFFFF",
          forest: "#1a472a",
          forestHover: "#236b3a",
          mint: "#e8f5e9",
          sage: "#c8e6c9",
          sun: "#f9a825",
          ash: "#888888",
          stone: "#2a2a2a",
          stoneLight: "#333333",
        },
        "neon-cyan": "#00d9ff",
        "neon-purple": "#d946ef",
        "neon-pink": "#ec4899",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        pill: "9999px",
      },
      fontFamily: {
        sans: ["var(--font-display)", "system-ui", "sans-serif"],
        serif: ["var(--font-primary)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      fontSize: {
        "heading-xl": ["clamp(2rem, 8vw, 7rem)", { lineHeight: "1.05", letterSpacing: "-0.03em" }],
        "heading-lg": ["clamp(1.5rem, 5vw, 4rem)", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "heading-md": ["clamp(1.25rem, 3vw, 2.5rem)", { lineHeight: "1.2", letterSpacing: "-0.02em" }],
      },
      spacing: {
        "section": "120px",
        "section-mobile": "64px",
      },
      animation: {
        "fade-in": "fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "slide-up": "slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "slide-down": "slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "marquee": "marquee 30s linear infinite",
        "marquee-reverse": "marqueeReverse 30s linear infinite",
        "voxel-fall": "voxelFall 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        "voxel-settle": "voxelSettle 2s ease-in-out forwards",
        "color-pulse": "colorPulse 3s ease-in-out infinite",
        "spin-slow": "spin 20s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(26,71,42,0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(26,71,42,0.6)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        marqueeReverse: {
          "0%": { transform: "translateX(-50%)" },
          "100%": { transform: "translateX(0)" },
        },
        voxelFall: {
          "0%": { transform: "translate3d(0, -300px, 0) rotateX(-90deg) scale(0.5)", opacity: "0" },
          "40%": { transform: "translate3d(0, 0, 0) rotateX(-20deg) scale(1.1)", opacity: "1" },
          "60%": { transform: "translate3d(0, 10px, 0) rotateX(10deg) scale(0.95)" },
          "100%": { transform: "translate3d(0, 0, 0) rotateX(0deg) scale(1)", opacity: "1" },
        },
        voxelSettle: {
          "0%": { transform: "translate3d(0, 0, 0) rotateX(0deg) scale(1)" },
          "30%": { transform: "translate3d(0, -15px, 0) rotateX(5deg) scale(1.02)" },
          "100%": { transform: "translate3d(0, 0, 0) rotateX(-5deg) scale(1)" },
        },
        colorPulse: {
          "0%, 100%": { color: "#FFFFFF" },
          "50%": { color: "#1a472a" },
        },
      },
      transitionTimingFunction: {
        "expo-out": "cubic-bezier(0.16, 1, 0.3, 1)",
        "expo-in": "cubic-bezier(0.7, 0, 0.84, 0)",
        "smooth": "cubic-bezier(0.45, 0.05, 0.55, 0.95)",
        "bounce-custom": "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      screens: {
        xs: "320px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
