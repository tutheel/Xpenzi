import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Stage 0 seed: ensure the database is reachable.
  await prisma.$queryRaw`SELECT 1`;
  console.log('Seed placeholder executed.');
}

main()
  .catch((error) => {
    console.error('Seed failed', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
