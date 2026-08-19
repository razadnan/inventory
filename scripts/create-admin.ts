import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";

async function main() {
  const passwordHash = await bcrypt.hash("Admin@123", 12);

  const user = await prisma.user.upsert({
    where: {
      email: "admin@inventory.local",
    },
    update: {
      passwordHash,
      role: "ADMIN",
      name: "Administrator",
    },
    create: {
      name: "Administrator",
      email: "admin@inventory.local",
      passwordHash,
      role: "ADMIN",
    },
  });

  console.log("Admin created:");
  console.log(user.email);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });