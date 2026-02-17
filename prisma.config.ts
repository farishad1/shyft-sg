// prisma.config.ts
import "dotenv/config";
import { defineConfig, env } from "prisma/config"; // Import the 'env' helper

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"), // Use the 'env' helper instead of process.env
  },
});