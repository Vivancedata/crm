/** @type {import('next').NextConfig} */
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nextConfig = {
  // Avoid Next.js picking the wrong workspace root when multiple lockfiles exist.
  outputFileTracingRoot: __dirname,

  // @vivancedata/ui resolves its "." import to src/index.ts -- TypeScript
  // source, not a build. Next only compiles node_modules it is told to, so
  // without this every import from the design system is a syntax error.
  // Same line in learn/next.config.ts and vivancedata/next.config.mjs.
  transpilePackages: ["@vivancedata/ui"],

  // The design system is a barrel of ~40 components reached through a single
  // entry -- the package publishes no "./components/*" subpath, so importing
  // one component pulls cmdk, next-themes, embla and every Radix package with
  // it. Measured here: First Load JS on /contacts/[id] went 195 kB -> 253 kB
  // when the local components were swapped for package ones, and this flag did
  // not move that number (the RSC caveat in Vivancedata/ui#6). Kept because it
  // is what learn and vivancedata set and because the fix belongs upstream, in
  // an exports map with per-component subpaths -- not in a fourth local fork.
  experimental: {
    optimizePackageImports: ["@vivancedata/ui"],
  },
};

export default nextConfig;
