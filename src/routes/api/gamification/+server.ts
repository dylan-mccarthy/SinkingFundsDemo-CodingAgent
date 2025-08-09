import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Helper function to calculate fund level based on balance
function calculateFundLevel(balanceCents: number): {
	level: number;
	progress: number;
	nextLevelAt: number;
} {
	// Level thresholds in cents: $100, $500, $1000, $2500, $5000, $10000, etc.
	const levels = [
		10000, // Level 1: $100
		50000, // Level 2: $500
		100000, // Level 3: $1000
		250000, // Level 4: $2500
		500000, // Level 5: $5000
		1000000, // Level 6: $10000
		2500000, // Level 7: $25000
		5000000, // Level 8: $50000
		10000000 // Level 9: $100000
	];

	let level = 0;
	let nextLevelAt = levels[0];

	for (let i = 0; i < levels.length; i++) {
		if (balanceCents >= levels[i]) {
			level = i + 1;
			nextLevelAt = levels[i + 1] || levels[i] * 2; // If max level, double it
		} else {
			nextLevelAt = levels[i];
			break;
		}
	}

	const currentLevelMin = level > 0 ? levels[level - 1] : 0;
	const progress =
		level > 0
			? ((balanceCents - currentLevelMin) / (nextLevelAt - currentLevelMin)) * 100
			: (balanceCents / nextLevelAt) * 100;

	return { level, progress: Math.min(100, progress), nextLevelAt };
}

// Helper function to calculate savings streaks
function calculateSavingsStreak(transactions: any[]): {
	currentStreak: number;
	longestStreak: number;
} {
	// Group transactions by month/year
	const monthlyData: { [key: string]: { income: number; expenses: number } } = {};

	for (const transaction of transactions) {
		const date = new Date(transaction.date);
		const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;

		if (!monthlyData[monthKey]) {
			monthlyData[monthKey] = { income: 0, expenses: 0 };
		}

		switch (transaction.type) {
			case 'EXPENSE':
			case 'TRANSFER_OUT':
				monthlyData[monthKey].expenses += transaction.amountCents;
				break;
			case 'INCOME':
			case 'ALLOCATION':
			case 'TRANSFER_IN':
				monthlyData[monthKey].income += transaction.amountCents;
				break;
		}
	}

	// Sort months chronologically
	const sortedMonths = Object.keys(monthlyData).sort();

	let currentStreak = 0;
	let longestStreak = 0;
	let tempStreak = 0;

	for (const monthKey of sortedMonths) {
		const data = monthlyData[monthKey];
		const netSavings = data.income - data.expenses;

		if (netSavings >= 0) {
			tempStreak++;
			if (monthKey === sortedMonths[sortedMonths.length - 1]) {
				currentStreak = tempStreak;
			}
		} else {
			longestStreak = Math.max(longestStreak, tempStreak);
			tempStreak = 0;
		}
	}

	longestStreak = Math.max(longestStreak, tempStreak);
	return { currentStreak, longestStreak };
}

// Helper function to calculate badges
function calculateBadges(funds: any[], transactions: any[]): any[] {
	const badges = [];

	// Balance-based badges
	const totalBalance = funds.reduce((sum, fund) => sum + fund.balance, 0);

	if (totalBalance >= 100000)
		badges.push({
			id: 'first_1000',
			name: 'First $1,000',
			emoji: '🎯',
			description: 'Saved your first $1,000'
		});
	if (totalBalance >= 500000)
		badges.push({
			id: 'halfway_5000',
			name: 'Halfway Hero',
			emoji: '🏃',
			description: 'Reached $5,000 in total savings'
		});
	if (totalBalance >= 1000000)
		badges.push({
			id: 'master_10000',
			name: 'Savings Master',
			emoji: '👑',
			description: 'Achieved $10,000 in total savings'
		});

	// Fund goal achievements
	const goalsReached = funds.filter((f) => f.targetCents > 0 && f.balance >= f.targetCents).length;
	if (goalsReached >= 1)
		badges.push({
			id: 'goal_crusher',
			name: 'Goal Crusher',
			emoji: '🎉',
			description: 'Reached your first fund goal'
		});
	if (goalsReached >= 3)
		badges.push({
			id: 'triple_threat',
			name: 'Triple Threat',
			emoji: '🔥',
			description: 'Reached 3 fund goals'
		});

	// Transaction-based badges
	if (transactions.length >= 10)
		badges.push({
			id: 'active_tracker',
			name: 'Active Tracker',
			emoji: '📊',
			description: 'Recorded 10+ transactions'
		});
	if (transactions.length >= 50)
		badges.push({
			id: 'transaction_hero',
			name: 'Transaction Hero',
			emoji: '⚡',
			description: 'Recorded 50+ transactions'
		});

	// Streak badges
	const streakData = calculateSavingsStreak(transactions);
	if (streakData.currentStreak >= 3)
		badges.push({
			id: 'streak_starter',
			name: 'Streak Starter',
			emoji: '🔥',
			description: '3-month savings streak'
		});
	if (streakData.currentStreak >= 6)
		badges.push({
			id: 'streak_master',
			name: 'Streak Master',
			emoji: '🌟',
			description: '6-month savings streak'
		});

	return badges;
}

export const GET: RequestHandler = async () => {
	try {
		const funds = globalThis.sinkingFunds || [];
		const transactions = globalThis.sinkingTransactions || [];

		// Calculate gamification data for each fund
		const fundGamification = funds.map((fund) => {
			const fundTransactions = transactions.filter((t) => t.fundId === fund.id);
			const levelData = calculateFundLevel(fund.balance);
			const streakData = calculateSavingsStreak(fundTransactions);

			return {
				fundId: fund.id,
				fundName: fund.name,
				level: levelData.level,
				levelProgress: levelData.progress,
				nextLevelAt: levelData.nextLevelAt,
				currentStreak: streakData.currentStreak,
				longestStreak: streakData.longestStreak
			};
		});

		// Calculate overall gamification stats
		const totalBalance = funds.reduce((sum, fund) => sum + fund.balance, 0);
		const overallLevelData = calculateFundLevel(totalBalance);
		const overallStreakData = calculateSavingsStreak(transactions);
		const badges = calculateBadges(funds, transactions);

		// Calculate total goals reached
		const goalsReached = funds.filter(
			(f) => f.targetCents > 0 && f.balance >= f.targetCents
		).length;
		const totalGoals = funds.filter((f) => f.targetCents > 0).length;

		return json({
			overall: {
				level: overallLevelData.level,
				levelProgress: overallLevelData.progress,
				nextLevelAt: overallLevelData.nextLevelAt,
				currentStreak: overallStreakData.currentStreak,
				longestStreak: overallStreakData.longestStreak,
				totalBalance,
				goalsReached,
				totalGoals,
				transactionCount: transactions.length
			},
			funds: fundGamification,
			badges: badges,
			achievements: {
				badgeCount: badges.length,
				totalSaved: totalBalance,
				activeStreaks: fundGamification.filter((f) => f.currentStreak > 0).length
			}
		});
	} catch (error) {
		console.error('Error calculating gamification data:', error);
		return json({ error: 'Failed to calculate gamification data' }, { status: 500 });
	}
};
