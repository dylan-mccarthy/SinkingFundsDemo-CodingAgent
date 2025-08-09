# Sinking Funds Manager - Copilot Instructions

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Project Status & Overview
This repository contains a gamified SvelteKit application for managing sinking funds (personal finance tracking). The project is currently in the **specification phase** - implementation has not yet begun. The complete product specification is located in `spec.md`.

**Stack:** SvelteKit • Skeleton UI • Prisma ORM • SQLite • TypeScript • Tailwind CSS

## Working Effectively

### Initial Project Setup (Not Yet Implemented)
When the project implementation begins, follow these exact commands:

```bash
# Install Node.js (if not available)
# Download from https://nodejs.org/dist/v20.11.0/node-v20.11.0-linux-x64.tar.xz
# Or use system package manager

# Create new SvelteKit project with full stack
npx sv create sinking-funds-app --template=demo --typescript --add=prettier,eslint,vitest,playwright,tailwindcss

# Navigate to project directory
cd sinking-funds-app

# Install dependencies - NEVER CANCEL: takes 1-2 minutes
npm install  # timeout: 180 seconds

# Add Skeleton UI and Prisma dependencies
npm install @skeletonlabs/skeleton @skeletonlabs/tw-plugin
npm install prisma @prisma/client sqlite3
npm install -D @types/node
```

### Database Setup with Prisma
```bash
# Initialize Prisma - creates prisma/ directory and schema
npx prisma init --datasource-provider sqlite

# Copy schema from spec.md to prisma/schema.prisma
# Generate Prisma client
npx prisma generate  # takes 10-20 seconds

# Create and run initial migration
npx prisma migrate dev --name init  # takes 5-15 seconds

# Seed database (if seeding script exists)
npx prisma db seed  # takes 5-10 seconds
```

### Build and Development Commands
```bash
# Development server - NEVER CANCEL: runs continuously
npm run dev  # timeout: unlimited, runs on http://localhost:5173

# Production build - NEVER CANCEL: takes 2-5 minutes for full build
npm run build  # timeout: 600 seconds

# Preview production build
npm run preview  # runs on http://localhost:4173

# Type checking
npm run check  # takes 10-30 seconds

# Linting and formatting - ALWAYS run before committing
npm run lint     # takes 5-15 seconds  
npm run format   # takes 5-10 seconds
```

### Testing Commands
```bash
# Unit tests with Vitest - NEVER CANCEL: takes 30-120 seconds
npm run test      # timeout: 180 seconds
npm run test:ui   # opens Vitest UI

# End-to-end tests with Playwright - NEVER CANCEL: takes 2-5 minutes
npm run test:e2e  # timeout: 600 seconds
```

### Database Operations
```bash
# View database in browser
npx prisma studio  # opens on http://localhost:5555

# Reset database (WARNING: destroys all data)
npx prisma migrate reset

# Apply schema changes
npx prisma db push  # takes 5-15 seconds
```

## Validation & Testing Scenarios

**CRITICAL**: After making any changes, ALWAYS run through these validation steps:

### Manual Testing Scenarios
1. **Fund Management Flow:**
   - Create a new fund with name, target amount, and color
   - Edit fund details
   - Archive/delete unused fund

2. **Transaction Flow:**
   - Add expense transaction to a fund
   - Add income transaction
   - Transfer money between funds
   - Verify balances update correctly

3. **Period Management:**
   - Start new month (rollover + allocations)
   - Close current period
   - Reopen closed period

4. **Gamification Features:**
   - Check badges display for savings milestones
   - Verify streak counters increment
   - Confirm fund level indicators update

5. **Basic UI Navigation:**
   - Navigate between dashboard, funds, transactions, settings
   - Verify responsive design on different screen sizes
   - Test dark/light theme switching (if implemented)

### Pre-commit Validation
```bash
# ALWAYS run these before committing changes:
npm run lint
npm run format  
npm run check
npm run test
# For UI changes, also run:
npm run test:e2e
```

## Key Files & Directories

### Project Structure (When Implemented)
```
sinking-funds-app/
├── src/
│   ├── routes/          # SvelteKit pages and API routes
│   ├── lib/             # Shared components and utilities
│   ├── app.html         # Main HTML template  
│   └── hooks.server.ts  # Server-side hooks
├── prisma/
│   ├── schema.prisma    # Database schema (copy from spec.md)
│   └── migrations/      # Database migration files
├── static/              # Static assets
├── tests/               # Playwright e2e tests
└── src/lib/components/  # Svelte components
```

### Critical Files to Review
- **`spec.md`** - Complete product specification with data models and requirements
- **`prisma/schema.prisma`** - Database schema definition
- **`src/routes/+layout.svelte`** - Main layout with navigation
- **`src/lib/components/`** - Reusable UI components
- **`package.json`** - Dependencies and scripts

## Development Guidelines

### Database Schema Validation
- ALWAYS verify Prisma schema matches the specification in `spec.md`
- Run `npx prisma validate` before migrations
- Test database operations in Prisma Studio before implementing in code

### Component Development
- Follow Skeleton UI component patterns
- Use Tailwind CSS for styling with `rounded-2xl`, soft shadows
- Implement accessibility features (ARIA labels, keyboard navigation)
- Add gamification animations using Svelte transitions

### API Route Development  
- Place API endpoints in `src/routes/api/`
- Use proper HTTP status codes and error handling
- Validate all inputs before database operations
- Implement proper authentication/authorization

## Common Issues & Solutions

### Build Failures
- **Prisma generate fails**: Run `npm install @prisma/client` first
- **TypeScript errors**: Run `npm run check` to identify issues
- **Missing dependencies**: Check `package.json` matches requirements

### Database Issues  
- **Schema sync errors**: Run `npx prisma db push` to sync
- **Migration conflicts**: Reset with `npx prisma migrate reset` (destroys data)
- **Connection errors**: Verify SQLite file permissions and path

### Development Server Issues
- **Port conflicts**: Change port with `npm run dev -- --port 5174`
- **Hot reload not working**: Restart dev server
- **Build performance**: Use `npm run dev -- --host` for network access

## Timeout Specifications

**CRITICAL - NEVER CANCEL these commands:**
- `npm install`: 180 seconds (3 minutes)
- `npm run build`: 600 seconds (10 minutes) 
- `npm run test:e2e`: 600 seconds (10 minutes)
- `npm run dev`: Unlimited (continuous process)

**Standard timeouts:**
- `npm run test`: 180 seconds (3 minutes)
- `npm run lint`: 60 seconds (1 minute)
- `npx prisma generate`: 60 seconds (1 minute)
- `npx prisma migrate`: 60 seconds (1 minute)

## Quick Reference Commands

```bash
# Common outputs for reference (to avoid repeated bash commands)
ls -la  # (when project exists)
.
..
.env
.env.example  
.gitignore
README.md
package.json
prisma/
src/
static/
svelte.config.js
tailwind.config.js
tsconfig.json
vite.config.ts

# package.json scripts (typical)
"scripts": {
  "dev": "vite dev",
  "build": "vite build", 
  "preview": "vite preview",
  "test": "vitest",
  "test:e2e": "playwright test",
  "check": "svelte-kit sync && svelte-check",
  "lint": "prettier --check . && eslint .",
  "format": "prettier --write ."
}
```

## Current State Note
**IMPORTANT**: This repository currently contains only the specification (`spec.md`). No implementation files exist yet. When beginning development, follow the "Initial Project Setup" section above to bootstrap the SvelteKit application with the required dependencies.