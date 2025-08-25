import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function reset() {
  try {
    await prisma.$executeRawUnsafe(`
      TRUNCATE TABLE 
        "Notification", "Favorite", "Review", "Estimate", 
        "DesignatedRequest", "RequestDraft", "Request", 
        "Mover", "Client"
      RESTART IDENTITY CASCADE;
    `);
    console.log("Database reset complete");
  } catch (error) {
    console.error("Error during reset:", error);
  } finally {
    await prisma.$disconnect();
  }
}

reset();
