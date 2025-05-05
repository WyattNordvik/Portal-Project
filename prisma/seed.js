// prisma/seed.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const roles = ["admin", "editor", "viewer"];
  for (const name of roles) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    console.log(`Ensured role: ${name}`);
  }

  const forumChannels = [
    { name: "General", slug: "general" },
    { name: "Announcements", slug: "announcements" },
  ];

  for (const channel of forumChannels) {
    await prisma.forumChannel.upsert({
      where: { slug: channel.slug },
      update: {},
      create: channel,
    });
    console.log(`Ensured forum channel: ${channel.name}`);
  }

  const user = await prisma.user.upsert({
    where: { email: "test@forum.dev" },
    update: {},
    create: {
      email: "test@forum.dev",
      name: "Test User",
      passwordHash: "$2b$10$123456789012345678901u0SxQK4b7GzT8P3gN1VO6xwOeW4uVd7q",
    },
  });

  const general = await prisma.forumChannel.findUnique({
    where: { slug: "general" },
  });

  const threadData = {
    title: "Welcome to the General Channel",
    content: "Feel free to start discussions here!",
    forumChannelId: general.id,
    authorId: user.id,
  };

  console.log("SEED DEBUG → threadData keys:", Object.keys(threadData));
  console.log("SEED DEBUG → full threadData:", threadData);

  const thread = await prisma.thread.create({ data: threadData });

  await prisma.reply.createMany({
    data: [
      {
        content: "This looks great!",
        threadId: thread.id,
        authorId: user.id,
      },
      {
        content: "Glad to be part of the conversation.",
        threadId: thread.id,
        authorId: user.id,
      },
    ],
  });

  console.log("✅ Seeded forum user, thread, and replies.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

