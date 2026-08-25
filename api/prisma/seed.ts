import { PrismaClient, UserRole } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import * as bcrypt from 'bcrypt';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log('🌱 Starting database seed...');

  const roles = [
    UserRole.ADMIN,
    UserRole.HR_USER,
    UserRole.DEPARTMENT_MANAGER,
    UserRole.EMPLOYEE,
  ];

  for (const role of roles) {
    await prisma.employeeIdSequence.upsert({
      where: {
        role,
      },
      update: {},
      create: {
        role,
        nextNumber: 1001,
      },
    });

    console.log(`✅ Employee ID sequence initialized: ${role}`);
  }

  const adminPassword = await bcrypt.hash('admin@123', 10);

  const admin = await prisma.user.upsert({
    where: {
      username: 'admin',
    },
    update: {
      passwordHash: adminPassword,
      role: UserRole.ADMIN,
      isActive: true,
    },
    create: {
      username: 'admin',
      passwordHash: adminPassword,
      role: UserRole.ADMIN,
      isActive: true,
    },
  });

  console.log(`✅ Admin user created: ${admin.username}`);

  console.log('🌱 Database seed completed successfully.');
}

main()
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
