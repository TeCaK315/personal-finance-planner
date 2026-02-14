import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'personal_finance_planner';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

if (!MONGODB_DB_NAME) {
  throw new Error('Please define the MONGODB_DB_NAME environment variable');
}

interface MongoConnection {
  client: MongoClient;
  db: Db;
}

let cachedConnection: MongoConnection | null = null;

export async function connectToDatabase(): Promise<MongoConnection> {
  if (cachedConnection) {
    return cachedConnection;
  }

  const client = new MongoClient(MONGODB_URI, {
    maxPoolSize: 10,
    minPoolSize: 5,
    maxIdleTimeMS: 30000,
  });

  await client.connect();
  const db = client.db(MONGODB_DB_NAME);

  cachedConnection = { client, db };

  await createIndexes(db);

  return cachedConnection;
}

export async function getDb(): Promise<Db> {
  const { db } = await connectToDatabase();
  return db;
}

export async function closeConnection(): Promise<void> {
  if (cachedConnection) {
    await cachedConnection.client.close();
    cachedConnection = null;
  }
}

async function createIndexes(db: Db): Promise<void> {
  await db.collection('users').createIndex({ email: 1 }, { unique: true });
  await db.collection('users').createIndex({ createdAt: 1 });

  await db.collection('categories').createIndex({ userId: 1 });
  await db.collection('categories').createIndex({ userId: 1, name: 1 }, { unique: true });
  await db.collection('categories').createIndex({ isDefault: 1 });

  await db.collection('budgets').createIndex({ userId: 1 });
  await db.collection('budgets').createIndex({ userId: 1, startDate: 1, endDate: 1 });
  await db.collection('budgets').createIndex({ endDate: 1 });

  await db.collection('transactions').createIndex({ userId: 1 });
  await db.collection('transactions').createIndex({ budgetId: 1 });
  await db.collection('transactions').createIndex({ categoryId: 1 });
  await db.collection('transactions').createIndex({ date: 1 });
  await db.collection('transactions').createIndex({ userId: 1, date: 1 });
  await db.collection('transactions').createIndex({ userId: 1, budgetId: 1, date: 1 });

  await db.collection('ai_recommendations').createIndex({ userId: 1 });
  await db.collection('ai_recommendations').createIndex({ userId: 1, isRead: 1 });
  await db.collection('ai_recommendations').createIndex({ userId: 1, isDismissed: 1 });
  await db.collection('ai_recommendations').createIndex({ createdAt: 1 });

  await db.collection('refresh_tokens').createIndex({ token: 1 }, { unique: true });
  await db.collection('refresh_tokens').createIndex({ userId: 1 });
  await db.collection('refresh_tokens').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
}