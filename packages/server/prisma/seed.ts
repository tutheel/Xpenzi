import { PrismaClient, GroupRole, SplitMethod } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clean existing data (in reverse order of dependencies)
  await prisma.expenseParticipant.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.settlement.deleteMany();
  await prisma.groupMember.deleteMany();
  await prisma.group.deleteMany();
  await prisma.user.deleteMany();

  console.log("Cleaned existing data");

  // Create demo users
  const alice = await prisma.user.create({
    data: {
      clerkUserId: "user_demo_alice",
      email: "alice@example.com",
      name: "Alice Johnson",
      imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=alice",
    },
  });

  const bob = await prisma.user.create({
    data: {
      clerkUserId: "user_demo_bob",
      email: "bob@example.com",
      name: "Bob Smith",
      imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=bob",
    },
  });

  const charlie = await prisma.user.create({
    data: {
      clerkUserId: "user_demo_charlie",
      email: "charlie@example.com",
      name: "Charlie Brown",
      imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=charlie",
    },
  });

  const diana = await prisma.user.create({
    data: {
      clerkUserId: "user_demo_diana",
      email: "diana@example.com",
      name: "Diana Prince",
      imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=diana",
    },
  });

  console.log("Created 4 demo users");

  // Create Group 1: Roommates (USD)
  const roommatesGroup = await prisma.group.create({
    data: {
      name: "Roommates",
      description: "Shared apartment expenses",
      currency: "USD",
      createdById: alice.id,
    },
  });

  // Add members to Roommates group
  await prisma.groupMember.createMany({
    data: [
      { groupId: roommatesGroup.id, userId: alice.id, role: GroupRole.ADMIN },
      { groupId: roommatesGroup.id, userId: bob.id, role: GroupRole.MEMBER },
      { groupId: roommatesGroup.id, userId: charlie.id, role: GroupRole.MEMBER },
    ],
  });

  // Create expenses for Roommates group
  const groceriesExpense = await prisma.expense.create({
    data: {
      groupId: roommatesGroup.id,
      description: "Weekly groceries",
      totalAmount: 15000, // $150.00
      currency: "USD",
      expenseDate: new Date("2024-01-15"),
      paidById: alice.id,
      splitMethod: SplitMethod.EQUAL,
      createdById: alice.id,
    },
  });

  await prisma.expenseParticipant.createMany({
    data: [
      { expenseId: groceriesExpense.id, userId: alice.id, owedAmount: 5000 },
      { expenseId: groceriesExpense.id, userId: bob.id, owedAmount: 5000 },
      { expenseId: groceriesExpense.id, userId: charlie.id, owedAmount: 5000 },
    ],
  });

  const electricityExpense = await prisma.expense.create({
    data: {
      groupId: roommatesGroup.id,
      description: "Electricity bill - January",
      totalAmount: 12000, // $120.00
      currency: "USD",
      expenseDate: new Date("2024-01-20"),
      paidById: bob.id,
      splitMethod: SplitMethod.EQUAL,
      createdById: bob.id,
    },
  });

  await prisma.expenseParticipant.createMany({
    data: [
      { expenseId: electricityExpense.id, userId: alice.id, owedAmount: 4000 },
      { expenseId: electricityExpense.id, userId: bob.id, owedAmount: 4000 },
      { expenseId: electricityExpense.id, userId: charlie.id, owedAmount: 4000 },
    ],
  });

  const internetExpense = await prisma.expense.create({
    data: {
      groupId: roommatesGroup.id,
      description: "Internet subscription",
      totalAmount: 9000, // $90.00
      currency: "USD",
      expenseDate: new Date("2024-01-25"),
      paidById: charlie.id,
      splitMethod: SplitMethod.EQUAL,
      createdById: charlie.id,
    },
  });

  await prisma.expenseParticipant.createMany({
    data: [
      { expenseId: internetExpense.id, userId: alice.id, owedAmount: 3000 },
      { expenseId: internetExpense.id, userId: bob.id, owedAmount: 3000 },
      { expenseId: internetExpense.id, userId: charlie.id, owedAmount: 3000 },
    ],
  });

  console.log("Created Roommates group with 3 expenses");

  // Create Group 2: Trip to Paris (EUR)
  const parisGroup = await prisma.group.create({
    data: {
      name: "Trip to Paris",
      description: "Summer vacation expenses",
      currency: "EUR",
      createdById: diana.id,
    },
  });

  // Add members to Paris trip group
  await prisma.groupMember.createMany({
    data: [
      { groupId: parisGroup.id, userId: diana.id, role: GroupRole.ADMIN },
      { groupId: parisGroup.id, userId: alice.id, role: GroupRole.MEMBER },
      { groupId: parisGroup.id, userId: bob.id, role: GroupRole.MEMBER },
    ],
  });

  // Create expenses for Paris trip
  const hotelExpense = await prisma.expense.create({
    data: {
      groupId: parisGroup.id,
      description: "Hotel Marais - 3 nights",
      totalAmount: 45000, // 450.00 EUR
      currency: "EUR",
      expenseDate: new Date("2024-02-10"),
      paidById: diana.id,
      splitMethod: SplitMethod.EQUAL,
      createdById: diana.id,
    },
  });

  await prisma.expenseParticipant.createMany({
    data: [
      { expenseId: hotelExpense.id, userId: diana.id, owedAmount: 15000 },
      { expenseId: hotelExpense.id, userId: alice.id, owedAmount: 15000 },
      { expenseId: hotelExpense.id, userId: bob.id, owedAmount: 15000 },
    ],
  });

  const dinnerExpense = await prisma.expense.create({
    data: {
      groupId: parisGroup.id,
      description: "Dinner at Le Petit Cler",
      totalAmount: 18000, // 180.00 EUR
      currency: "EUR",
      expenseDate: new Date("2024-02-11"),
      paidById: alice.id,
      splitMethod: SplitMethod.EQUAL,
      createdById: alice.id,
    },
  });

  await prisma.expenseParticipant.createMany({
    data: [
      { expenseId: dinnerExpense.id, userId: diana.id, owedAmount: 6000 },
      { expenseId: dinnerExpense.id, userId: alice.id, owedAmount: 6000 },
      { expenseId: dinnerExpense.id, userId: bob.id, owedAmount: 6000 },
    ],
  });

  const louvreExpense = await prisma.expense.create({
    data: {
      groupId: parisGroup.id,
      description: "Louvre Museum tickets",
      totalAmount: 5100, // 51.00 EUR (17 EUR each)
      currency: "EUR",
      expenseDate: new Date("2024-02-12"),
      paidById: bob.id,
      splitMethod: SplitMethod.EQUAL,
      createdById: bob.id,
    },
  });

  await prisma.expenseParticipant.createMany({
    data: [
      { expenseId: louvreExpense.id, userId: diana.id, owedAmount: 1700 },
      { expenseId: louvreExpense.id, userId: alice.id, owedAmount: 1700 },
      { expenseId: louvreExpense.id, userId: bob.id, owedAmount: 1700 },
    ],
  });

  const taxiExpense = await prisma.expense.create({
    data: {
      groupId: parisGroup.id,
      description: "Taxi to airport",
      totalAmount: 5500, // 55.00 EUR
      currency: "EUR",
      expenseDate: new Date("2024-02-13"),
      paidById: diana.id,
      splitMethod: SplitMethod.EQUAL,
      createdById: diana.id,
    },
  });

  await prisma.expenseParticipant.createMany({
    data: [
      { expenseId: taxiExpense.id, userId: diana.id, owedAmount: 1834 },
      { expenseId: taxiExpense.id, userId: alice.id, owedAmount: 1833 },
      { expenseId: taxiExpense.id, userId: bob.id, owedAmount: 1833 },
    ],
  });

  // Add a settlement for Paris trip
  await prisma.settlement.create({
    data: {
      groupId: parisGroup.id,
      fromUserId: bob.id,
      toUserId: diana.id,
      amount: 10000, // 100.00 EUR
      currency: "EUR",
      settlementDate: new Date("2024-02-14"),
      note: "Partial payment for hotel",
      createdById: bob.id,
    },
  });

  console.log("Created Trip to Paris group with 4 expenses and 1 settlement");

  // Create Group 3: Office Lunch Club (USD)
  const lunchGroup = await prisma.group.create({
    data: {
      name: "Office Lunch Club",
      description: "Daily lunch orders",
      currency: "USD",
      createdById: bob.id,
    },
  });

  // Add all 4 members
  await prisma.groupMember.createMany({
    data: [
      { groupId: lunchGroup.id, userId: bob.id, role: GroupRole.ADMIN },
      { groupId: lunchGroup.id, userId: alice.id, role: GroupRole.MEMBER },
      { groupId: lunchGroup.id, userId: charlie.id, role: GroupRole.MEMBER },
      { groupId: lunchGroup.id, userId: diana.id, role: GroupRole.MEMBER },
    ],
  });

  // Create expenses with different split methods
  const pizzaExpense = await prisma.expense.create({
    data: {
      groupId: lunchGroup.id,
      description: "Pizza party",
      totalAmount: 8000, // $80.00
      currency: "USD",
      expenseDate: new Date("2024-01-22"),
      paidById: bob.id,
      splitMethod: SplitMethod.EQUAL,
      createdById: bob.id,
    },
  });

  await prisma.expenseParticipant.createMany({
    data: [
      { expenseId: pizzaExpense.id, userId: bob.id, owedAmount: 2000 },
      { expenseId: pizzaExpense.id, userId: alice.id, owedAmount: 2000 },
      { expenseId: pizzaExpense.id, userId: charlie.id, owedAmount: 2000 },
      { expenseId: pizzaExpense.id, userId: diana.id, owedAmount: 2000 },
    ],
  });

  const sushiExpense = await prisma.expense.create({
    data: {
      groupId: lunchGroup.id,
      description: "Sushi order - different portions",
      totalAmount: 12000, // $120.00
      currency: "USD",
      expenseDate: new Date("2024-01-23"),
      paidById: alice.id,
      splitMethod: SplitMethod.EXACT_AMOUNTS,
      createdById: alice.id,
    },
  });

  await prisma.expenseParticipant.createMany({
    data: [
      { expenseId: sushiExpense.id, userId: bob.id, owedAmount: 2500 }, // $25
      { expenseId: sushiExpense.id, userId: alice.id, owedAmount: 3500 }, // $35
      { expenseId: sushiExpense.id, userId: charlie.id, owedAmount: 2000 }, // $20
      { expenseId: sushiExpense.id, userId: diana.id, owedAmount: 4000 }, // $40
    ],
  });

  const burgerExpense = await prisma.expense.create({
    data: {
      groupId: lunchGroup.id,
      description: "Burger joint",
      totalAmount: 6400, // $64.00
      currency: "USD",
      expenseDate: new Date("2024-01-24"),
      paidById: charlie.id,
      splitMethod: SplitMethod.EQUAL,
      createdById: charlie.id,
    },
  });

  await prisma.expenseParticipant.createMany({
    data: [
      { expenseId: burgerExpense.id, userId: bob.id, owedAmount: 1600 },
      { expenseId: burgerExpense.id, userId: alice.id, owedAmount: 1600 },
      { expenseId: burgerExpense.id, userId: charlie.id, owedAmount: 1600 },
      { expenseId: burgerExpense.id, userId: diana.id, owedAmount: 1600 },
    ],
  });

  const thaiExpense = await prisma.expense.create({
    data: {
      groupId: lunchGroup.id,
      description: "Thai food Friday",
      totalAmount: 10000, // $100.00
      currency: "USD",
      expenseDate: new Date("2024-01-26"),
      paidById: diana.id,
      splitMethod: SplitMethod.SHARES,
      createdById: diana.id,
    },
  });

  await prisma.expenseParticipant.createMany({
    data: [
      { expenseId: thaiExpense.id, userId: bob.id, owedAmount: 2000, shares: 2 },
      { expenseId: thaiExpense.id, userId: alice.id, owedAmount: 3000, shares: 3 },
      { expenseId: thaiExpense.id, userId: charlie.id, owedAmount: 2000, shares: 2 },
      { expenseId: thaiExpense.id, userId: diana.id, owedAmount: 3000, shares: 3 },
    ],
  });

  // Add some settlements for lunch club
  await prisma.settlement.create({
    data: {
      groupId: lunchGroup.id,
      fromUserId: charlie.id,
      toUserId: alice.id,
      amount: 2000, // $20.00
      currency: "USD",
      settlementDate: new Date("2024-01-27"),
      note: "Venmo transfer",
      createdById: charlie.id,
    },
  });

  console.log("Created Office Lunch Club with 4 expenses and 1 settlement");

  // Create Group 4: Weekend Camping (USD) - empty group for testing
  const campingGroup = await prisma.group.create({
    data: {
      name: "Weekend Camping",
      description: "Upcoming camping trip - add expenses here!",
      currency: "USD",
      createdById: charlie.id,
    },
  });

  await prisma.groupMember.createMany({
    data: [
      { groupId: campingGroup.id, userId: charlie.id, role: GroupRole.ADMIN },
      { groupId: campingGroup.id, userId: alice.id, role: GroupRole.MEMBER },
    ],
  });

  console.log("Created Weekend Camping group (empty, for testing)");

  console.log("\n--- Seed Summary ---");
  console.log("Users: 4 (Alice, Bob, Charlie, Diana)");
  console.log("Groups: 4");
  console.log("  - Roommates: 3 members, 3 expenses");
  console.log("  - Trip to Paris: 3 members, 4 expenses, 1 settlement");
  console.log("  - Office Lunch Club: 4 members, 4 expenses, 1 settlement");
  console.log("  - Weekend Camping: 2 members, 0 expenses (empty)");
  console.log("\nDemo Clerk User IDs:");
  console.log("  - Alice: user_demo_alice");
  console.log("  - Bob: user_demo_bob");
  console.log("  - Charlie: user_demo_charlie");
  console.log("  - Diana: user_demo_diana");
  console.log("\nDatabase seeding completed!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
