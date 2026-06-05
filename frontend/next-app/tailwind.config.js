import type { Config } from 'tailwindcss';

export default {
  content: [
    "./src/**/*.tsx",
    "./src/**/*.ts",
    "./src/**/*.jsx",
    "./src/**/*.js",
    "./src/**/*.mdx",
  ],
  theme: {
    extend: {
      colors: {
        "deep-forest": "#0B3D2E",
        cyan: "#00D9FF",
      },
      fontFamily: {
        space: ["Space Grotesk", "sans-serif"],
        inter: ["Inter", "sans-serif"],
      },
    },
  },
  darkMode: "media",
} satisfies Config;
