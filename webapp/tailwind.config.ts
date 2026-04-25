import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        htech: {
          orange: "#FF8142",
          "orange-light": "#FDD9B5",
          "orange-border": "hsla(34,100%,63%,0.3)",
          bg: "#171717",
          "bg-2": "#211713",
          "bg-3": "#1f1a16",
          text: "#DEDEDE",
          "text-strong": "#FFFFFF",
          "text-muted": "#9a9a9a",
        },
      },
      fontFamily: {
        display: ["var(--font-oxanium)", "sans-serif"],
        body: ["var(--font-work-sans)", "sans-serif"],
      },
      backgroundImage: {
        "htech-gradient":
          "linear-gradient(35deg, #FF8142 0%, #FDD9B5 50%, #FF8142 100%)",
      },
      boxShadow: {
        htech: "0px 2px 5px 0px hsla(0, 0%, 0%, 0.4)",
        "htech-glow":
          "0 0 0 1px hsla(34,100%,63%,0.3), 0 6px 30px -10px hsla(20,100%,55%,0.45)",
      },
    },
  },
  plugins: [],
};

export default config;
