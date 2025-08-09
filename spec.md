# Sinking Funds Manager – Product & Tech Specification

**Stack:** SvelteKit • Skeleton UI • Prisma ORM • SQLite

---

## 1) Purpose & Overview

The application is designed to help users **track spending** and provide **clear visibility** into where money goes each month, enabling better control over spending habits. The “sinking” aspect of the funds rewards underspending by allowing unspent balances to roll over, building up a cumulative amount that can be used in future months.

To encourage consistent use, the UI incorporates **gamification elements** such as progress achievements, streak rewards for logging transactions, and celebratory animations when targets are met or savings grow.

### Key Features

* Define multiple sinking funds with names, colors, icons, and optional targets.
* Set a global monthly deposit amount.
* Allocate deposits to funds by fixed amounts, percentages, or priority rules.
* Track transactions (expenses, incomes, transfers) against funds.
* Rollover remaining balances each month to reward underspending.
* Transfer between funds for flexibility.
* Lock/unlock monthly periods to prevent accidental changes.
* **Gamification:** badges for hitting savings milestones, streak counters for regular use, and level-up indicators for funds as they grow.

---

## 2) Functional Requirements

**Funds**

* CRUD operations, archive instead of delete when non-zero.
* Optional target and minimum reserve values.

**Allocations**

* Rules per fund: fixed, percent, or priority.
* Allocation preview for upcoming month.

**Transactions**

* Expense, Income, Transfer types.
* Transfer is atomic double-entry.
* Optional overspend prevention.

**Periods**

* Start-of-month job: rollover + allocations.
* End-of-month close and optional reopen with audit log.

**Reporting**

* Dashboard showing total balance, fund list, top funds, and recent transactions.
* Fund detail view with balance history to track spending patterns.
* CSV export for offline analysis.

**Settings**

* Currency (AUD default), timezone (Australia/Melbourne), monthly deposit day, overspend prevention.

**Gamification Features**

* **Savings Streaks:** consecutive months without overspending in a fund.
* **Achievement Badges:** hitting percentage-of-target milestones or savings goals.
* **Fund Level System:** funds “level up” as balances grow over time.
* **Visual Celebrations:** confetti or animations when major goals are achieved.

---

## 3) Data Model (Prisma)

```prisma
Datasource db { provider = "sqlite"; url = "file:./sinkingfunds.db" }
Generator client { provider = "prisma-client-js" }

enum TransactionType { EXPENSE INCOME TRANSFER_OUT TRANSFER_IN ALLOCATION }
enum PeriodStatus { OPEN CLOSED }

model User { id String @id @default(cuid()); email String @unique; passwordHash String; createdAt DateTime @default(now()); updatedAt DateTime @updatedAt }
model Fund { id String @id @default(cuid()); userId String; name String; description String?; color String?; icon String?; active Boolean @default(true); targetCents Int?; minReserveCents Int?; displayOrder Int @default(0); createdAt DateTime @default(now()); updatedAt DateTime @updatedAt }
model Period { id String @id @default(cuid()); userId String; year Int; month Int; status PeriodStatus @default(OPEN); startedAt DateTime; closedAt DateTime?; @@unique([userId, year, month]) }
model AllocationRule { id String @id @default(cuid()); userId String; fundId String; mode String; percentBp Int?; fixedCents Int?; priority Int @default(0); active Boolean @default(true); createdAt DateTime @default(now()); updatedAt DateTime @updatedAt }
model AllocationRun { id String @id @default(cuid()); userId String; periodId String; depositCents Int; executedAt DateTime @default(now()); hash String }
model AllocationLine { id String @id @default(cuid()); allocationRunId String; fundId String; amountCents Int }
model Transaction { id String @id @default(cuid()); userId String; periodId String?; fundId String?; type TransactionType; amountCents Int; date DateTime; payee String?; note String?; tags String[]; transferGroupId String?; createdAt DateTime @default(now()); updatedAt DateTime @updatedAt }
model AuditLog { id String @id @default(cuid()); userId String; action String; context String?; createdAt DateTime @default(now()) }
```

---

## 4) Algorithms

**Start of Month**

1. Create/open period.
2. Rollover balances to reward underspending.
3. Allocate deposit based on rules.

**Transfer**

* Create paired in/out transactions with same `transferGroupId`.

**Balance**

```
Start + ALLOCATION + INCOME + TRANSFER_IN - EXPENSE - TRANSFER_OUT
```

---

## 5) API Endpoints

* Auth: signup, login, logout.
* Funds: list, create, edit, archive/delete.
* Allocations: rules CRUD, preview.
* Periods: start, close, reopen.
* Transactions: list, add, transfer, edit, delete.
* Backup: export/import JSON.

---

## 6) UI/UX

**Top Bar:** month selector, quick actions, user menu.
**Sidebar:** dashboard, funds, transactions, allocations, reports, settings.
**Dashboard:** cards for total balance, deposit progress, top funds, recent activity, and spending vs. saving trends. Includes **gamification panel** showing active streaks, earned badges, and fund levels.
**Fund Cards:** balance, % to target, trend sparkline showing cumulative growth, current level, and progress toward next badge.
**Allocation Editor:** mode, value, priority, target, preview.
**Transactions List:** filters, CSV export, inline edit.
**Gamification UI:**

* Badge display with hover tooltips showing criteria.
* Progress bars for streaks.
* Level meter for each fund.
  **Styling:** rounded-2xl, soft shadows, accessible color contrast, celebratory animations.

---

## 7) Milestones

* **M0:** Project setup.
* **M1:** Funds & Transactions CRUD.
* **M2:** Period start (rollover + allocations), Allocation Editor.
* **M3:** Transfers, balances, fund detail.
* **M4:** Close/reopen period, audit log, CSV export.
* **M5:** UI polish, accessibility, gamification layer.

---

## 8) Acceptance Criteria

* Funds and allocation rules can be defined.
* Start Month runs rollover + allocations.
* Expenses and transfers adjust balances correctly.
* Periods can be closed/reopened with audit.
* Dashboard provides visibility of spending patterns and cumulative growth.
* Gamification features (streaks, badges, levels) update in real-time as criteria are met.
