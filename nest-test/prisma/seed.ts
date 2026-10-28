import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL is required');
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

try {
  await prisma.$transaction(async (tx) => {
    const owner = await tx.user.upsert({
      where: { email: 'alice@example.com' }, update: {},
      create: { email: 'alice@example.com', name: 'Alice' },
    });

    const member = await tx.user.upsert({
      where: { email: 'bob@example.com' }, update: {},
      create: { email: 'bob@example.com', name: 'Bob' },
    });

    const project = await tx.project.upsert({
      where: { name: 'StudyFlow' }, update: {},
      create: { name: 'StudyFlow', description: 'Навчальний проєкт з PostgreSQL', status: 'active' },
    });

    for (const [userId, role] of [[owner.id, 'owner'], [member.id, 'member']] as const) {
      await tx.membership.upsert({
        where: { projectId_userId: { projectId: project.id, userId } }, update: {},
        create: { projectId: project.id, userId, role },
      });
    }

    if (!await tx.task.findFirst({ where: { projectId: project.id, title: 'Перевірити CRUD' } })) {
      await tx.task.create({ data: { projectId: project.id, assigneeId: member.id, title: 'Перевірити CRUD' } });
    }
  });
  console.log('Seed completed: StudyFlow, two users, memberships and a task.');
} finally {
  await prisma.$disconnect();
}
