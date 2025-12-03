import "dotenv-expand/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
    schema: "prisma/schema.prisma",
    migrations: {
        seed: `npx tsx prisma/seed.ts`,
    },
    datasource: {
        url: env("POSTGRES_URL"),
    },
});