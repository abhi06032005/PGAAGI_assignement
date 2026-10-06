import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('[Neon Schema Export] DATABASE_URL is not set.');
  process.exit(1);
}

async function pushSchema() {
  console.log('[Neon Schema Export] Connecting to Neon DB PostgreSQL...');
  console.log('[Neon Schema Export] Target URL:', dbUrl.replace(/:[^:@]+@/, ':****@'));

  const schemaPath = path.resolve(process.cwd(), 'prisma', 'schema.sql');
  const ddl = fs.readFileSync(schemaPath, 'utf-8');

  // Strip comments and split by semicolon
  const cleanSql = ddl
    .split('\n')
    .filter((line) => !line.trim().startsWith('--'))
    .join('\n');

  const statements = cleanSql
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  console.log(`[Neon Schema Export] Executing ${statements.length} DDL statements...`);

  const url = new URL(dbUrl.replace('postgresql://', 'https://').replace('postgres://', 'https://'));
  const neonApiUrl = `https://${url.host}/sql`;

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    try {
      const res = await fetch(neonApiUrl, {
        method: 'POST',
        headers: {
          'Neon-Connection-String': dbUrl,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: stmt }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        console.error(`[Error executing statement ${i + 1}]:`, errJson);
      } else {
        const title = stmt.split('\n')[0].substring(0, 60);
        console.log(`[OK] Statement ${i + 1}: ${title}`);
      }
    } catch (err) {
      console.error(`[Fetch Error on statement ${i + 1}]:`, err.message);
    }
  }

  // Verify created tables
  console.log('[Neon Schema Export] Verifying created tables in Neon PostgreSQL...');
  const verifyRes = await fetch(neonApiUrl, {
    method: 'POST',
    headers: {
      'Neon-Connection-String': dbUrl,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;",
    }),
  });

  if (verifyRes.ok) {
    const data = await verifyRes.json();
    console.log('[Neon Schema Export] Verified tables in live Neon DB:');
    console.table(data.rows);
  } else {
    console.error('[Neon Verification Failed]:', await verifyRes.text());
  }
}

pushSchema().catch(console.error);
