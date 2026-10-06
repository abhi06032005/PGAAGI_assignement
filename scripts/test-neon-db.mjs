import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { prisma } from '../src/lib/prisma.ts';

async function testNeon() {
  console.log('[Test Neon DB] Testing live Neon PostgreSQL ORM with DATABASE_URL...');

  const testEmail = 'user_' + Date.now() + '@pulse.app';
  console.log(`[Test Neon DB] Upserting user: ${testEmail}...`);

  const user = await prisma.user.upsert({
    where: { email: testEmail },
    update: { name: 'Neon Live User' },
    create: {
      email: testEmail,
      name: 'Neon Live User',
      password: 'secure_password_hash',
    },
  });

  console.log('[Test Neon DB] Successfully stored user in Neon DB:', user);

  // Retrieve user
  const found = await prisma.user.findUnique({
    where: { email: testEmail },
  });

  console.log('[Test Neon DB] Retrieved user from Neon DB:', found);

  // Verify in Neon SQL directly
  const dbUrl = process.env.DATABASE_URL;
  const url = new URL(dbUrl.replace('postgresql://', 'https://').replace('postgres://', 'https://'));
  const res = await fetch(`https://${url.host}/sql`, {
    method: 'POST',
    headers: {
      'Neon-Connection-String': dbUrl,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: 'SELECT id, name, email, created_at FROM users WHERE email = $1',
      params: [testEmail],
    }),
  });

  const neonData = await res.json();
  console.log('[Test Neon DB] Direct Neon PostgreSQL confirmation query:');
  console.table(neonData.rows);
}

testNeon().catch(console.error);
