import type { PrismaConfig } from "prisma/config";
import "dotenv-expand/config";

export default {
    migrations: {
        seed: `tsx prisma/seed.ts`,
    },
} satisfies PrismaConfig;