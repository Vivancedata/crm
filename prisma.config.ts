import "dotenv/config";
import { defineConfig } from "prisma/config";

// DATABASE_URL is only needed by the migrate/db/studio commands. It is absent
// in CI, where `postinstall` runs `prisma generate`, so it is attached only
// when set instead of via `env()`, which throws at config load if unset.
const url = process.env.DATABASE_URL;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  ...(url ? { datasource: { url } } : {}),
});
