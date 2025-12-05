/// <reference types="node" />
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.$transaction([
    prisma.expenseSplit.deleteMany(),
    prisma.expense.deleteMany(),
    prisma.balance.deleteMany(),
    prisma.settlement.deleteMany(),
    prisma.groupMember.deleteMany(),
    prisma.group.deleteMany(),
    prisma.budget.deleteMany(),
    prisma.monthlyAggregate.deleteMany(),
    prisma.auditLog.deleteMany(),
    prisma.receipt.deleteMany(),
    prisma.userPushSubscription.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  const user = await prisma.user.create({
    data: {
      clerkUserId: 'user_36QKjH3Cu0MCWvfxnYLJB2mEGnT',
      email: 'sushilpatildev@gmail.com',
      name: 'Sushi Parti',
    },
  });

  const group = await prisma.group.create({
    data: {
      name: 'Demo Trip',
      currency: 'USD',
      createdById: user.id,
    },
  });

  const ownerMember = await prisma.groupMember.create({
    data: {
      groupId: group.id,
      userId: user.id,
      displayName: 'Sushi Parti',
      role: 'OWNER',
    },
  });

  const guest1 = await prisma.groupMember.create({
    data: {
      groupId: group.id,
      displayName: 'Alex Guest',
      role: 'MEMBER',
    },
  });

  const guest2 = await prisma.groupMember.create({
    data: {
      groupId: group.id,
      displayName: 'Jamie Guest',
      role: 'ADMIN',
    },
  });

  const [expense1, expense2, expense3] = await prisma.$transaction([
    prisma.expense.create({
      data: {
        groupId: group.id,
        payerMemberId: ownerMember.id,
        description: 'Groceries',
        amountCents: 4500,
        currency: 'USD',
        category: 'Food',
        expenseDate: new Date(),
        status: 'APPROVED',
        createdById: user.id,
        splits: {
          create: [
            {
              memberId: ownerMember.id,
              shareType: 'EQUAL',
              shareValue: 1,
              owedCents: 1500,
            },
            {
              memberId: guest1.id,
              shareType: 'EQUAL',
              shareValue: 1,
              owedCents: 1500,
            },
            {
              memberId: guest2.id,
              shareType: 'EQUAL',
              shareValue: 1,
              owedCents: 1500,
            },
          ],
        },
      },
    }),
    prisma.expense.create({
      data: {
        groupId: group.id,
        payerMemberId: guest1.id,
        description: 'Cab ride',
        amountCents: 2300,
        currency: 'USD',
        category: 'Transport',
        expenseDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
        status: 'APPROVED',
        createdById: user.id,
        splits: {
          create: [
            {
              memberId: ownerMember.id,
              shareType: 'PERCENT',
              shareValue: 40,
              owedCents: 920,
            },
            {
              memberId: guest1.id,
              shareType: 'PERCENT',
              shareValue: 30,
              owedCents: 690,
            },
            {
              memberId: guest2.id,
              shareType: 'PERCENT',
              shareValue: 30,
              owedCents: 690,
            },
          ],
        },
      },
    }),
    prisma.expense.create({
      data: {
        groupId: group.id,
        payerMemberId: guest2.id,
        description: 'Museum tickets',
        amountCents: 3600,
        currency: 'USD',
        category: 'Entertainment',
        expenseDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
        status: 'APPROVED',
        createdById: user.id,
        splits: {
          create: [
            {
              memberId: ownerMember.id,
              shareType: 'WEIGHT',
              shareValue: 1,
              owedCents: 1200,
            },
            {
              memberId: guest1.id,
              shareType: 'WEIGHT',
              shareValue: 1,
              owedCents: 1200,
            },
            {
              memberId: guest2.id,
              shareType: 'WEIGHT',
              shareValue: 1,
              owedCents: 1200,
            },
          ],
        },
      },
    }),
  ]);

  await prisma.balance.createMany({
    data: [
      {
        groupId: group.id,
        memberId: ownerMember.id,
        balanceCents: -3000,
      },
      {
        groupId: group.id,
        memberId: guest1.id,
        balanceCents: 1500,
      },
      {
        groupId: group.id,
        memberId: guest2.id,
        balanceCents: 1500,
      },
    ],
  });

  await prisma.settlement.create({
    data: {
      groupId: group.id,
      fromMemberId: guest1.id,
      toMemberId: ownerMember.id,
      amountCents: 1500,
      method: 'CASH',
      status: 'PENDING',
    },
  });

  await prisma.budget.create({
    data: {
      ownerType: 'GROUP',
      ownerId: group.id,
      month: '2025-12',
      currency: 'USD',
      totalLimitCents: 200000,
      perCategoryJson: { Food: 80000, Transport: 30000, Entertainment: 40000 },
      createdById: user.id,
    },
  });

  await prisma.monthlyAggregate.create({
    data: {
      ownerType: 'GROUP',
      ownerId: group.id,
      month: '2025-12',
      totalsJson: { Food: 45.0, Transport: 23.0, Entertainment: 36.0 },
    },
  });

  await prisma.auditLog.create({
    data: {
      actorUserId: user.id,
      entity: 'group',
      entityId: group.id,
      action: 'seed_create',
      diffJson: { message: 'Seed data created' },
    },
  });

  await prisma.userPushSubscription.create({
    data: {
      userId: user.id,
      endpoint: 'https://example.com/push/endpoint',
      p256dh: 'demo-p256dh',
      auth: 'demo-auth',
    },
  });

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
