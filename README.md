# Sinking Funds Manager

A gamified personal finance application built with SvelteKit to help users track spending and manage multiple savings goals through "sinking funds." The application provides clear visibility into where money goes each month and encourages better spending habits through gamification elements like progress achievements, streaks, and celebratory animations.

## 🎯 What are Sinking Funds?

Sinking funds are dedicated savings accounts for specific purposes or expenses. Instead of being surprised by irregular expenses like car repairs or annual subscriptions, you set aside money each month in advance. This application helps you:

- **Track spending** across multiple categories/funds
- **Build up savings** through rollover of unspent balances
- **Stay motivated** with gamification features
- **Plan ahead** for both expected and unexpected expenses

## ✨ Key Features

- **📁 Multiple Funds Management**: Create and manage multiple sinking funds with custom names, colors, and icons
- **💰 Flexible Allocations**: Set up monthly deposit rules using fixed amounts, percentages, or priority-based allocation
- **📊 Transaction Tracking**: Track expenses, income, and transfers between funds
- **🔄 Monthly Rollover**: Unspent balances automatically roll over to reward underspending
- **🎮 Gamification**: Earn badges for hitting milestones, maintain streaks, and level up your funds
- **🔒 Period Management**: Lock/unlock monthly periods to prevent accidental changes
- **📈 Reporting & Analytics**: View spending patterns and fund performance over time
- **🎨 Customizable Interface**: Choose from various color themes and icons for personalization

## 🛠️ Technology Stack

- **Frontend**: SvelteKit with TypeScript
- **UI Framework**: Skeleton UI components
- **Styling**: Tailwind CSS
- **Database**: SQLite with Prisma ORM
- **Development**: Vite, ESLint, Prettier

## 📋 Prerequisites

- Node.js 18 or later
- npm (comes with Node.js)

## 🚀 Getting Started

### 1. Clone and Install

```bash
git clone https://github.com/dylan-mccarthy/SinkingFundsDemo-CodingAgent.git
cd SinkingFundsDemo-CodingAgent
npm install
```

### 2. Database Setup

Initialize the database with Prisma:

```bash
# Generate Prisma client
npx prisma generate

# Create database and run migrations
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio to view the database
npx prisma studio
```

### 3. Development Server

Start the development server:

```bash
npm run dev

# Or start and automatically open in browser
npm run dev -- --open
```

The application will be available at `http://localhost:5173`

## 🔧 Available Scripts

### Development

```bash
npm run dev          # Start development server
npm run dev -- --open # Start dev server and open browser
```

### Building

```bash
npm run build        # Build for production
npm run preview      # Preview production build locally
```

### Code Quality

```bash
npm run check        # Run Svelte/TypeScript checks
npm run check:watch  # Run checks in watch mode
npm run lint         # Run ESLint and Prettier checks
npm run format       # Format code with Prettier
```

### Database Management

```bash
npx prisma studio           # Open database browser
npx prisma migrate dev      # Create and apply new migration
npx prisma migrate reset    # Reset database (⚠️ destroys data)
npx prisma db push         # Push schema changes without migration
```

## 📁 Project Structure

```
src/
├── routes/              # SvelteKit pages and API routes
│   ├── +layout.svelte  # Main application layout
│   ├── +page.svelte    # Home/Dashboard page
│   ├── api/            # Backend API endpoints
│   ├── funds/          # Fund management pages
│   ├── transactions/   # Transaction tracking pages
│   ├── allocations/    # Monthly allocation setup
│   ├── transfers/      # Fund transfer functionality
│   └── periods/        # Period management
├── lib/                # Shared components and utilities
│   └── components/     # Reusable Svelte components
├── app.html           # HTML template
├── app.css            # Global styles
└── app.d.ts           # TypeScript declarations

prisma/
├── schema.prisma      # Database schema
└── migrations/        # Database migration files

static/                # Static assets (images, icons, etc.)
```

## 🎮 How to Use

1. **Create Your First Fund**: Start by creating a sinking fund for a specific purpose (e.g., "Emergency Fund", "Car Maintenance", "Vacation")

2. **Set Up Allocations**: Configure how much money should go into each fund monthly - either fixed amounts or percentages

3. **Track Transactions**: Log expenses against funds and add income when needed

4. **Monthly Process**: At month-end, the system rolls over unspent balances and applies your allocation rules

5. **Monitor Progress**: Watch your funds grow and unlock achievements as you hit savings milestones

## 🏗️ Development Status

This project is currently in active development. The core functionality is implemented but some features may still be in progress. Please refer to the issues for the current development status.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following the existing code style
4. Run the code quality checks: `npm run lint && npm run check`
5. Commit your changes (`git commit -m 'Add some amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📄 License

This project is for demonstration purposes. Please check with the repository owner for licensing details.

---

**Happy Saving! 💰** Start building your financial future one fund at a time.
