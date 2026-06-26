import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const teacherPassword = await bcrypt.hash('teacher123', 10);
  const studentPassword = await bcrypt.hash('student123', 10);

  // Seed Teacher
  const teacher = await prisma.user.upsert({
    where: { username: 'teacher' },
    update: {},
    create: {
      username: 'teacher',
      password: teacherPassword,
      role: 'teacher',
    },
  });

  // Delete existing default 'student' if present
  await prisma.user.deleteMany({
    where: { username: 'student' },
  });

  console.log('Database seeding complete:');
  console.log(`- Teacher: ${teacher.username} / teacher123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
