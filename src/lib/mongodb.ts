import { MongoClient, Db } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MONGODB_URI to .env.local');
}

if (!process.env.MONGODB_DB_NAME) {
  throw new Error('Please add your MONGODB_DB_NAME to .env.local');
}

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME;

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = await MongoClient.connect(uri, {
    maxPoolSize: 10,
    minPoolSize: 5,
    maxIdleTimeMS: 30000,
  });

  const db = client.db(dbName);

  await createIndexes(db);

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

export async function getDb(): Promise<Db> {
  const { db } = await connectToDatabase();
  return db;
}

async function createIndexes(db: Db): Promise<void> {
  await db.collection('users').createIndex({ email: 1 }, { unique: true });

  await db.collection('transactions').createIndex({ userId: 1, date: -1 });
  await db.collection('transactions').createIndex({ userId: 1, type: 1 });
  await db.collection('transactions').createIndex({ userId: 1, category: 1 });

  await db.collection('budgets').createIndex({ userId: 1, month: 1 }, { unique: true });

  await db.collection('financial_goals').createIndex({ userId: 1, status: 1 });
  await db.collection('financial_goals').createIndex({ userId: 1, deadline: 1 });

  await db.collection('ai_recommendations').createIndex({ userId: 1, dismissed: 1, generatedAt: -1 });
  await db.collection('ai_recommendations').createIndex({ userId: 1, type: 1 });

  await db.collection('sessions').createIndex({ sessionId: 1 }, { unique: true });
  await db.collection('sessions').createIndex({ userId: 1 });
  await db.collection('sessions').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
}