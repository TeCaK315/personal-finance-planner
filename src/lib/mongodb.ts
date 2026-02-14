import { MongoClient, Db } from 'mongodb';

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME;

  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not defined');
  }

  if (!dbName) {
    throw new Error('MONGODB_DB_NAME environment variable is not defined');
  }

  const client = new MongoClient(uri, {
    maxPoolSize: 10,
    minPoolSize: 2,
    maxIdleTimeMS: 30000,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });

  await client.connect();

  const db = client.db(dbName);

  cachedClient = client;
  cachedDb = db;

  await createIndexes(db);

  return { client, db };
}

export async function getDb(): Promise<Db> {
  const { db } = await connectToDatabase();
  return db;
}

async function createIndexes(db: Db): Promise<void> {
  const usersCollection = db.collection('users');
  await usersCollection.createIndex({ email: 1 }, { unique: true });
  await usersCollection.createIndex({ createdAt: 1 });

  const budgetsCollection = db.collection('budgets');
  await budgetsCollection.createIndex({ userId: 1 });
  await budgetsCollection.createIndex({ startDate: 1 });
  await budgetsCollection.createIndex({ endDate: 1 });
  await budgetsCollection.createIndex({ userId: 1, period: 1 });

  const transactionsCollection = db.collection('transactions');
  await transactionsCollection.createIndex({ userId: 1 });
  await transactionsCollection.createIndex({ budgetId: 1 });
  await transactionsCollection.createIndex({ date: 1 });
  await transactionsCollection.createIndex({ userId: 1, budgetId: 1, date: 1 });
  await transactionsCollection.createIndex({ categoryId: 1 });

  const categoriesCollection = db.collection('categories');
  await categoriesCollection.createIndex({ userId: 1 });
  await categoriesCollection.createIndex({ type: 1 });
  await categoriesCollection.createIndex({ isDefault: 1 });

  const recommendationsCollection = db.collection('recommendations');
  await recommendationsCollection.createIndex({ userId: 1 });
  await recommendationsCollection.createIndex({ generatedAt: 1 });
  await recommendationsCollection.createIndex({ priority: 1 });

  const sessionsCollection = db.collection('sessions');
  await sessionsCollection.createIndex({ token: 1 }, { unique: true });
  await sessionsCollection.createIndex({ userId: 1 });
  await sessionsCollection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
}