import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: ["query", "error", "warn"],
  });
};

type GlobalWithPrisma = typeof globalThis & {
  prisma: ReturnType<typeof prismaClientSingleton> | undefined;
};

const prisma =
  (globalThis as GlobalWithPrisma).prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  (globalThis as GlobalWithPrisma).prisma = prisma;
}

export default prisma;
