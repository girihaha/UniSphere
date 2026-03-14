import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@srmist.edu.in";
  const passwordHash = await bcrypt.hash("admin123", 10);

  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    await prisma.user.update({
      where: { email },
      data: {
        role: "super_admin",
      },
    });

    console.log("Existing admin updated to super_admin");
    return;
  }

  await prisma.user.create({
    data: {
      id: `admin-${Date.now()}`,
      name: "UniSphere Admin",
      email,
      password: passwordHash,
      branch: "CSE",
      year: 4,
      role: "super_admin",
      bio: "Platform administrator",
      posts: 0,
    },
  });

  console.log("Super admin created");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });