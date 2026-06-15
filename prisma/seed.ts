import { PrismaClient } from "@prisma/client";
import { PLANS } from "../src/lib/plans";

const prisma = new PrismaClient();

async function main() {
  for (const p of PLANS) {
    await prisma.plan.upsert({
      where: { code: p.code },
      create: {
        code: p.code,
        name: p.name,
        interval: p.interval,
        amountPaise: p.amountPaise,
        durationDays: p.durationDays,
        sortOrder: p.sortOrder,
        isActive: true,
      },
      update: {
        name: p.name,
        interval: p.interval,
        amountPaise: p.amountPaise,
        durationDays: p.durationDays,
        sortOrder: p.sortOrder,
        isActive: true,
      },
    });
    console.log(`seeded plan: ${p.code}`);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
