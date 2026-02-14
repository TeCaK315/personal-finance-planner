import { MongoClient, Db } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env.local');
}

if (!process.env.MONGODB_DB_NAME) {
  throw new Error('Please add your MongoDB database name to .env.local');
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
    maxIdleTimeMS: 60000,
    serverSelectionTimeoutMS: 5000,
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
  const usersCollection = db.collection('users');
  await usersCollection.createIndex({ email: 1 }, { unique: true });

  const categoriesCollection = db.collection('categories');
  await categoriesCollection.createIndex({ userId: 1, type: 1 });

  const budgetsCollection = db.collection('budgets');
  await budgetsCollection.createIndex({ userId: 1, status: 1 });
  await budgetsCollection.createIndex({ userId: 1, startDate: 1, endDate: 1 });

  const transactionsCollection = db.collection('transactions');
  await transactionsCollection.createIndex({ userId: 1, date: -1 });
  await transactionsCollection.createIndex({ userId: 1, budgetId: 1 });
  await transactionsCollection.createIndex({ userId: 1, categoryId: 1 });
  await transactionsCollection.createIndex({ userId: 1, type: 1, date: -1 });

  const recommendationsCollection = db.collection('recommendations');
  await recommendationsCollection.createIndex({ userId: 1, status: 1, createdAt: -1 });
  await recommendationsCollection.createIndex({ userId: 1, priority: 1 });

  const alertsCollection = db.collection('alerts');
  await alertsCollection.createIndex({ userId: 1, dismissed: 1, createdAt: -1 });
  await alertsCollection.createIndex({ userId: 1, severity: 1 });
}