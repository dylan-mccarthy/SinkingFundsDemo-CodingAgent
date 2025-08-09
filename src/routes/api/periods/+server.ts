import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Simple in-memory store for periods - will be replaced with Prisma later
const initialPeriods = [
	{
		id: '1',
		userId: 'user1',
		year: 2024,
		month: 1,
		status: 'OPEN',
		startedAt: '2024-01-01T00:00:00Z',
		closedAt: null
	}
];

// Use a global variable to persist data across requests in dev mode
globalThis.sinkingPeriods = globalThis.sinkingPeriods || [...initialPeriods];

export const GET: RequestHandler = async ({ url }) => {
	let periods = globalThis.sinkingPeriods;

	// Filter by status if provided
	const status = url.searchParams.get('status');
	if (status) {
		periods = periods.filter((p) => p.status === status);
	}

	// Get current period (open period for current month/year)
	const current = url.searchParams.get('current');
	if (current === 'true') {
		const now = new Date();
		const currentYear = now.getFullYear();
		const currentMonth = now.getMonth() + 1;

		let currentPeriod = periods.find(
			(p) => p.year === currentYear && p.month === currentMonth && p.status === 'OPEN'
		);

		// If no current period exists, create one
		if (!currentPeriod) {
			currentPeriod = {
				id: Math.random().toString(36).substr(2, 9),
				userId: 'user1',
				year: currentYear,
				month: currentMonth,
				status: 'OPEN',
				startedAt: new Date().toISOString(),
				closedAt: null
			};
			globalThis.sinkingPeriods.push(currentPeriod);
		}

		return json({ period: currentPeriod });
	}

	// Sort by year and month descending (newest first)
	periods.sort((a, b) => {
		if (a.year !== b.year) return b.year - a.year;
		return b.month - a.month;
	});

	return json({ periods });
};

export const POST: RequestHandler = async ({ request }) => {
	const data = await request.json();

	const newPeriod = {
		id: Math.random().toString(36).substr(2, 9),
		userId: 'user1',
		year: data.year,
		month: data.month,
		status: data.status || 'OPEN',
		startedAt: data.startedAt || new Date().toISOString(),
		closedAt: data.closedAt || null
	};

	globalThis.sinkingPeriods.push(newPeriod);

	return json({ period: newPeriod }, { status: 201 });
};
