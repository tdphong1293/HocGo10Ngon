import type { PrismaConfig } from "prisma/config";
import "dotenv-expand/config";

export default {
    migrations: {
        seed: `npx tsx prisma/seed.ts`,
    },
} satisfies PrismaConfig;