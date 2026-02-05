import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#000000",
        foreground: "#FFFFFF",
        cyan: {
          neon: "#00FFFF",
          dark: "#008B8B",
          light: "#7FFFD4",
        },
        ginger: {
          DEFAULT: "#D2691E",
          light: "#F4A460",
          dark: "#8B4513",
        },
      },
      boxShadow: {
        'cyan-glow': '0 0 10px #00FFFF, 0 0 20px #00FFFF, 0 0 30px #00FFFF',
        'cyan-glow-lg': '0 0 20px #00FFFF, 0 0 40px #00FFFF, 0 0 60px #00FFFF',
        'cyan-glow-xl': '0 0 30px #00FFFF, 0 0 60px #00FFFF, 0 0 90px #00FFFF',
      },
      dropShadow: {
        'cyan-glow': '0 0 10px #00FFFF',
        'cyan-glow-lg': '0 0 20px #00FFFF',
      },
      animation: {
        'breathing-glow': 'breathingGlow 3s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        breathingGlow: {
          '0%, 100%': {
            boxShadow: '0 0 10px #00FFFF, 0 0 20px #00FFFF, 0 0 30px #00FFFF',
          },
          '50%': {
            boxShadow: '0 0 20px #00FFFF, 0 0 40px #00FFFF, 0 0 60px #00FFFF',
          },
        },
        pulseGlow: {
          '0%, 100%': {
            opacity: '1',
            filter: 'drop-shadow(0 0 10px #00FFFF)',
          },
          '50%': {
            opacity: '0.8',
            filter: 'drop-shadow(0 0 25px #00FFFF)',
          },
        },
      },
    },
  },
  plugins: [],
};

export default config;
