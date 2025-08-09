import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Simple in-memory store - will be replaced with Prisma later
const initialFunds = [
	{
		id: '1',
		name: 'Emergency Fund',
		description: 'Emergency savings for unexpected expenses',
		color: '#ef4444',
		icon: '🚨',
		targetCents: 500000, // $5,000
		balance: 250000 // $2,500
	},
	{
		id: '2',
		name: 'Vacation',
		description: 'Saving for our next vacation',
		color: '#06b6d4',
		icon: '✈️',
		targetCents: 300000, // $3,000
		balance: 125000 // $1,250
	}
];

// Use a global variable to persist data across requests in dev mode
globalThis.sinkingFunds = globalThis.sinkingFunds || [...initialFunds];

export const GET: RequestHandler = async () => {
	return json({ funds: globalThis.sinkingFunds });
};

export const POST: RequestHandler = async ({ request }) => {
	const data = await request.json();

	const newFund = {
		id: Math.random().toString(36).substr(2, 9),
		name: data.name,
		description: data.description || '',
		color: data.color || '#06b6d4',
		icon: data.icon || '💰',
		targetCents: data.targetCents || 0,
		balance: 0,
		active: true,
		createdAt: new Date().toISOString()
	};

	globalThis.sinkingFunds.push(newFund);

	return json({ fund: newFund }, { status: 201 });
};
