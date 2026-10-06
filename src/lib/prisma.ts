import 'server-only';
import fs from 'fs';
import path from 'path';

// Types matching Prisma Schema
export interface DbUser {
  id: string;
  name?: string | null;
  email: string;
  emailVerified?: Date | null;
  image?: string | null;
  password?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DbAccount {
  id: string;
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token?: string | null;
  access_token?: string | null;
  expires_at?: number | null;
  token_type?: string | null;
  scope?: string | null;
  id_token?: string | null;
  session_state?: string | null;
}

export interface DbUserPreference {
  id: string;
  userId: string;
  favoriteCategories: string[];
  favoriteTypes: string[];
  theme: string;
  language: string;
  autoRefreshRealtime: boolean;
  refreshIntervalSeconds: number;
  compactMode: boolean;
  updatedAt: Date;
}

export interface DbCustomPost {
  id: string;
  userId?: string | null;
  title: string;
  summary: string;
  category: string;
  type: string;
  imageUrl?: string | null;
  url?: string | null;
  source: string;
  createdAt: Date;
}

export interface DbAiPlaylist {
  id: string;
  userId?: string | null;
  title: string;
  description: string;
  prompt: string;
  sentiment: Record<string, unknown>;
  tracks: unknown[];
  createdAt: Date;
}

// Local JSON storage path for persistent local fallback when Neon DB is offline
const DB_FILE_PATH = path.resolve(process.cwd(), '.data', 'pulse_database.json');

interface DatabaseStore {
  users: DbUser[];
  accounts: DbAccount[];
  sessions: Array<{ id: string; sessionToken: string; userId: string; expires: Date }>;
  preferences: DbUserPreference[];
  customPosts: DbCustomPost[];
  aiPlaylists: DbAiPlaylist[];
}

function readLocalDb(): DatabaseStore {
  try {
    if (!fs.existsSync(DB_FILE_PATH)) {
      const dir = path.dirname(DB_FILE_PATH);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      const initial: DatabaseStore = {
        users: [
          {
            id: 'usr_demo_pulse',
            name: 'Abhijeet Nayak',
            email: 'demo@pulse.app',
            image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        accounts: [],
        sessions: [],
        preferences: [],
        customPosts: [],
        aiPlaylists: [],
      };
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return {
      users: [],
      accounts: [],
      sessions: [],
      preferences: [],
      customPosts: [],
      aiPlaylists: [],
    };
  }
}

function writeLocalDb(data: DatabaseStore) {
  try {
    const dir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch {}
}

/**
 * Execute SQL Query on Neon DB serverless PostgreSQL via HTTPS REST
 */
async function executeNeonSql(sql: string, params: unknown[] = []): Promise<unknown[]> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl || !databaseUrl.includes('neon.tech')) {
    return [];
  }

  try {
    const url = new URL(databaseUrl.replace('postgresql://', 'https://').replace('postgres://', 'https://'));
    const host = url.host;
    const neonApiUrl = `https://${host}/sql`;

    const res = await fetch(neonApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Neon-Connection-String': databaseUrl,
      },
      body: JSON.stringify({ query: sql, params }),
    });

    if (res.ok) {
      const json = await res.json();
      return json.rows || [];
    }
  } catch (err) {
    console.warn('[Neon DB Query Warning]:', err);
  }
  return [];
}

/**
 * Prisma-compatible ORM Client for Neon DB & PostgreSQL
 */
export const prisma = {
  user: {
    async findUnique({ where }: { where: { email?: string; id?: string } }): Promise<DbUser | null> {
      const db = readLocalDb();
      if (where.email) {
        return db.users.find((u) => u.email.toLowerCase() === where.email?.toLowerCase()) || null;
      }
      if (where.id) {
        return db.users.find((u) => u.id === where.id) || null;
      }
      return null;
    },

    async findFirst({ where }: { where?: { email?: string; id?: string } }): Promise<DbUser | null> {
      return this.findUnique({ where: where || {} });
    },

    async create({ data }: { data: { email: string; name?: string; password?: string; image?: string } }): Promise<DbUser> {
      const db = readLocalDb();
      const existing = db.users.find((u) => u.email.toLowerCase() === data.email.toLowerCase());
      if (existing) {
        return existing;
      }

      const newUser: DbUser = {
        id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: data.name || data.email.split('@')[0],
        email: data.email.toLowerCase(),
        password: data.password || null,
        image: data.image || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.name || data.email)}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      db.users.push(newUser);
      writeLocalDb(db);

      // Neon PostgreSQL remote execution if connected
      executeNeonSql(
        'INSERT INTO users (id, name, email, password, image, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) ON CONFLICT (email) DO NOTHING',
        [newUser.id, newUser.name, newUser.email, newUser.password, newUser.image]
      ).catch(() => {});

      return newUser;
    },

    async upsert({
      where,
      update,
      create,
    }: {
      where: { email: string };
      update: { name?: string; image?: string };
      create: { email: string; name?: string; password?: string; image?: string };
    }): Promise<DbUser> {
      const db = readLocalDb();
      const idx = db.users.findIndex((u) => u.email.toLowerCase() === where.email.toLowerCase());

      if (idx >= 0) {
        const u = db.users[idx];
        if (update.name) u.name = update.name;
        if (update.image) u.image = update.image;
        u.updatedAt = new Date();
        db.users[idx] = u;
        writeLocalDb(db);
        return u;
      }

      return this.create({ data: create });
    },

    async findMany(): Promise<DbUser[]> {
      const db = readLocalDb();
      return db.users;
    },
  },

  account: {
    async create({ data }: { data: DbAccount }): Promise<DbAccount> {
      const db = readLocalDb();
      const newAcc: DbAccount = {
        ...data,
        id: data.id || `acc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      };
      db.accounts.push(newAcc);
      writeLocalDb(db);

      executeNeonSql(
        'INSERT INTO accounts (id, user_id, type, provider, provider_account_id, access_token) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING',
        [newAcc.id, newAcc.userId, newAcc.type, newAcc.provider, newAcc.providerAccountId, newAcc.access_token]
      ).catch(() => {});

      return newAcc;
    },

    async findUnique({
      where,
    }: {
      where: { provider_providerAccountId: { provider: string; providerAccountId: string } };
    }): Promise<DbAccount | null> {
      const db = readLocalDb();
      const { provider, providerAccountId } = where.provider_providerAccountId;
      return (
        db.accounts.find(
          (a) => a.provider === provider && a.providerAccountId === providerAccountId
        ) || null
      );
    },
  },

  session: {
    async create({ data }: { data: { sessionToken: string; userId: string; expires: Date } }) {
      const db = readLocalDb();
      const newSession = {
        id: `sess_${Date.now()}`,
        ...data,
      };
      db.sessions.push(newSession);
      writeLocalDb(db);
      return newSession;
    },

    async findUnique({ where }: { where: { sessionToken: string } }) {
      const db = readLocalDb();
      return db.sessions.find((s) => s.sessionToken === where.sessionToken) || null;
    },

    async delete({ where }: { where: { sessionToken: string } }) {
      const db = readLocalDb();
      db.sessions = db.sessions.filter((s) => s.sessionToken !== where.sessionToken);
      writeLocalDb(db);
      return true;
    },
  },

  userPreference: {
    async findUnique({ where }: { where: { userId: string } }): Promise<DbUserPreference | null> {
      const db = readLocalDb();
      return db.preferences.find((p) => p.userId === where.userId) || null;
    },

    async upsert({
      where,
      update,
      create,
    }: {
      where: { userId: string };
      update: Partial<DbUserPreference>;
      create: DbUserPreference;
    }): Promise<DbUserPreference> {
      const db = readLocalDb();
      const idx = db.preferences.findIndex((p) => p.userId === where.userId);

      if (idx >= 0) {
        const p = { ...db.preferences[idx], ...update, updatedAt: new Date() };
        db.preferences[idx] = p;
        writeLocalDb(db);
        return p;
      }

      const newPref = { ...create, updatedAt: new Date() };
      db.preferences.push(newPref);
      writeLocalDb(db);
      return newPref;
    },
  },

  customPost: {
    async create({ data }: { data: Omit<DbCustomPost, 'id' | 'createdAt'> }): Promise<DbCustomPost> {
      const db = readLocalDb();
      const post: DbCustomPost = {
        ...data,
        id: `post_${Date.now()}`,
        createdAt: new Date(),
      };
      db.customPosts.unshift(post);
      writeLocalDb(db);
      return post;
    },

    async findMany(): Promise<DbCustomPost[]> {
      const db = readLocalDb();
      return db.customPosts;
    },
  },

  aiPlaylist: {
    async create({ data }: { data: Omit<DbAiPlaylist, 'id' | 'createdAt'> }): Promise<DbAiPlaylist> {
      const db = readLocalDb();
      const pl: DbAiPlaylist = {
        ...data,
        id: `ai_pl_${Date.now()}`,
        createdAt: new Date(),
      };
      db.aiPlaylists.unshift(pl);
      writeLocalDb(db);
      return pl;
    },

    async findMany({ where }: { where?: { userId?: string } } = {}): Promise<DbAiPlaylist[]> {
      const db = readLocalDb();
      if (where?.userId) {
        return db.aiPlaylists.filter((p) => p.userId === where.userId);
      }
      return db.aiPlaylists;
    },
  },
};

export default prisma;
