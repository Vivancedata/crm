import type { Config } from "tailwindcss";
import vivanceTailwindPreset from "@vivancedata/ui/tailwind";

/**
 * The design system arrives via the preset, matching vivancedata and learn.
 *
 * This file previously carried its own colour, spacing, radius and shadow
 * scales, and the colours in it were not this org's -- they were an exact copy
 * of the lscaturchio.xyz identity (warm paper `38 25% 97%`, forest green
 * `152 52% 20%`) sitting under a comment that called them the "Vivancedata
 * Color Palette". Three products, two design languages.
 *
 * Only genuinely app-specific things belong in `extend` below. Anything that
 * should look the same across the marketing site, the learning platform and
 * this dashboard belongs in @vivancedata/ui instead.
 */
const config: Config = {
  presets: [vivanceTailwindPreset],
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@vivancedata/ui/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // The pipeline ramp, defined in src/app/globals.css. App-specific by
        // design -- see the comment there.
        stage: {
          lead: "hsl(var(--stage-lead))",
          qualified: "hsl(var(--stage-qualified))",
          discovery: "hsl(var(--stage-discovery))",
          proposal: "hsl(var(--stage-proposal))",
          negotiation: "hsl(var(--stage-negotiation))",
        },
      },
      width: {
        sidebar: "var(--sidebar-width)",
      },
    },
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
  },
};

export default config;
