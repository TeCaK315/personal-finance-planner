import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'personal_finance_planner';

async function migrateDatabase() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB_NAME);

    console.log('Creating indexes...');

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

    console.log('Indexes created successfully');

    console.log('Checking for data migrations...');

    const usersWithoutPreferences = await db.collection('users').find({ preferences: { $exists: false } }).toArray();
    if (usersWithoutPreferences.length > 0) {
      console.log(`Migrating ${usersWithoutPreferences.length} users to add preferences...`);
      for (const user of usersWithoutPreferences) {
        await db.collection('users').updateOne(
          { _id: user._id },
          {
            $set: {
              preferences: {
                currency: 'USD',
                language: 'en',
                notifications: true,
              },
            },
          }
        );
      }
      console.log('User preferences migration completed');
    }

    console.log('Database migration completed successfully');
  } catch (error) {
    console.error('Error migrating database:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

migrateDatabase();