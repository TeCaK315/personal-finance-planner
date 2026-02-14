import { MongoClient, ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'personal_finance_planner';
const BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);

const DEFAULT_CATEGORIES = [
  { name: 'Food & Dining', icon: 'utensils', color: '#ef4444' },
  { name: 'Transportation', icon: 'car', color: '#f59e0b' },
  { name: 'Shopping', icon: 'shopping-bag', color: '#8b5cf6' },
  { name: 'Entertainment', icon: 'film', color: '#ec4899' },
  { name: 'Bills & Utilities', icon: 'file-text', color: '#3b82f6' },
  { name: 'Healthcare', icon: 'heart', color: '#10b981' },
  { name: 'Education', icon: 'book', color: '#6366f1' },
  { name: 'Travel', icon: 'plane', color: '#14b8a6' },
  { name: 'Income', icon: 'dollar-sign', color: '#22c55e' },
  { name: 'Other', icon: 'more-horizontal', color: '#64748b' },
];

async function seedDatabase() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB_NAME);

    const usersCollection = db.collection('users');
    const existingUser = await usersCollection.findOne({ email: 'demo@example.com' });

    let demoUserId: ObjectId;

    if (!existingUser) {
      const passwordHash = await bcrypt.hash('demo123456', BCRYPT_SALT_ROUNDS);
      const demoUser = {
        email: 'demo@example.com',
        name: 'Demo User',
        passwordHash,
        preferences: {
          currency: 'USD',
          language: 'en',
          notifications: true,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await usersCollection.insertOne(demoUser);
      demoUserId = result.insertedId;
      console.log('Demo user created');
    } else {
      demoUserId = existingUser._id as ObjectId;
      console.log('Demo user already exists');
    }

    const categoriesCollection = db.collection('categories');
    const existingCategories = await categoriesCollection.find({ userId: demoUserId }).toArray();

    if (existingCategories.length === 0) {
      const categories = DEFAULT_CATEGORIES.map(cat => ({
        userId: demoUserId,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        isDefault: true,
        createdAt: new Date(),
      }));

      await categoriesCollection.insertMany(categories);
      console.log('Default categories created');
    } else {
      console.log('Categories already exist for demo user');
    }

    const budgetsCollection = db.collection('budgets');
    const existingBudgets = await budgetsCollection.find({ userId: demoUserId }).toArray();

    if (existingBudgets.length === 0) {
      const categories = await categoriesCollection.find({ userId: demoUserId }).toArray();
      const categoryLimits = categories.slice(0, 5).map(cat => ({
        categoryId: cat._id.toString(),
        categoryName: cat.name,
        limit: 500,
        spent: 0,
      }));

      const demoBudget = {
        userId: demoUserId,
        name: 'Monthly Budget',
        totalAmount: 3000,
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
        categoryLimits,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await budgetsCollection.insertOne(demoBudget);
      console.log('Demo budget created');
    } else {
      console.log('Budgets already exist for demo user');
    }

    console.log('Database seeding completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

seedDatabase();