# Personal Finance Planner

A modern, AI-powered personal finance management application built with Next.js, MongoDB, and OpenAI. Track your budgets, analyze spending patterns, and receive personalized financial recommendations.

## Features

- 📊 **Budget Management**: Create and track monthly/yearly budgets with category allocations
- 💰 **Transaction Tracking**: Record income and expenses with detailed categorization
- 🤖 **AI Recommendations**: Get personalized financial advice powered by OpenAI
- 📈 **Analytics Dashboard**: Visualize spending trends and financial health
- 🔔 **Smart Alerts**: Receive notifications when approaching budget limits
- 🎨 **Modern UI**: Beautiful glassmorphism design with Tailwind CSS
- 🔐 **Secure Authentication**: JWT-based authentication with bcrypt password hashing

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: MongoDB
- **AI**: OpenAI GPT-4
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Validation**: Zod
- **Authentication**: JWT + bcryptjs

## Prerequisites

- Node.js 18+ and npm
- MongoDB database (local or MongoDB Atlas)
- OpenAI API key

## Environment Variables

Create a `.env.local` file in the root directory:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=finance_planner

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-api-key
OPENAI_MODEL=gpt-4-turbo-preview

# Application Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000
NODE_ENV=development
```

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd personal-finance-planner
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (see above)

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   ├── budgets/           # Budget management pages
│   ├── transactions/      # Transaction pages
│   ├── recommendations/   # AI recommendations pages
│   └── analytics/         # Analytics pages
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── auth/             # Authentication components
│   ├── dashboard/        # Dashboard components
│   ├── budget/           # Budget components
│   ├── transactions/     # Transaction components
│   ├── recommendations/  # Recommendation components
│   └── analytics/        # Analytics components
├── contexts/             # React contexts
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
│   ├── mongodb.ts        # MongoDB connection
│   ├── openai.ts         # OpenAI client
│   ├── auth.ts           # Authentication utilities
│   ├── budget-calculator.ts  # Budget calculations
│   ├── recommendation-engine.ts  # AI recommendation engine
│   └── validators.ts     # Zod validation schemas
├── types/                # TypeScript type definitions
└── middleware.ts         # Next.js middleware
```

## API Routes

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Budgets
- `GET /api/budgets` - List all budgets
- `POST /api/budgets` - Create new budget
- `GET /api/budgets/[id]` - Get budget details
- `PUT /api/budgets/[id]` - Update budget
- `DELETE /api/budgets/[id]` - Delete budget
- `GET /api/budgets/[id]/health` - Get budget health metrics

### Transactions
- `GET /api/transactions` - List transactions (with filters)
- `POST /api/transactions` - Create transaction
- `GET /api/transactions/[id]` - Get transaction details
- `PUT /api/transactions/[id]` - Update transaction
- `DELETE /api/transactions/[id]` - Delete transaction
- `POST /api/transactions/bulk` - Bulk import transactions

### Categories
- `GET /api/categories` - List categories
- `POST /api/categories` - Create category
- `GET /api/categories/[id]` - Get category details
- `PUT /api/categories/[id]` - Update category
- `DELETE /api/categories/[id]` - Delete category

### Recommendations
- `POST /api/recommendations` - Generate AI recommendations
- `GET /api/recommendations/history` - Get recommendation history

### Analytics
- `GET /api/analytics/overview` - Get financial overview
- `GET /api/analytics/trends` - Get spending trends

### Alerts
- `GET /api/alerts` - Get budget alerts
- `POST /api/alerts/[id]/dismiss` - Dismiss alert

## Database Schema

The application uses MongoDB with the following collections:

- **users**: User accounts and authentication
- **categories**: Income/expense categories
- **budgets**: Budget plans with category allocations
- **transactions**: Financial transactions
- **recommendations**: AI-generated financial advice
- **alerts**: Budget alerts and notifications

See `supabase/schema.sql` for detailed schema documentation.

## Development

### Running Tests
```bash
npm test
```

### Building for Production
```bash
npm run build
npm start
```

### Linting
```bash
npm run lint
```

## Features in Detail

### Budget Calculator
- Create monthly or yearly budgets
- Allocate amounts to different categories
- Track spending against budget
- Real-time budget health scoring

### AI Recommendations
- Analyzes your spending patterns
- Identifies savings opportunities
- Provides actionable financial advice
- Personalized based on your data

### Analytics Dashboard
- Visual spending trends
- Category breakdown charts
- Income vs expenses comparison
- Savings rate tracking

### Smart Alerts
- Budget exceeded notifications
- Approaching limit warnings
- Unusual spending detection
- Savings opportunity alerts

## Security

- Passwords hashed with bcrypt (10 rounds)
- JWT tokens for authentication
- HTTP-only cookies for token storage
- Protected API routes with middleware
- Input validation with Zod schemas

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues, questions, or suggestions, please open an issue on GitHub.

## Acknowledgments

- OpenAI for AI-powered recommendations
- Vercel for Next.js framework
- MongoDB for database
- Tailwind CSS for styling
- Recharts for data visualization