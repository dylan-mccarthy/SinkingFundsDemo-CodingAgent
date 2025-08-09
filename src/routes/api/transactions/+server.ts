import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Simple in-memory store for transactions - will be replaced with Prisma later
const initialTransactions = [
	{
		id: '1',
		fundId: '1',
		type: 'ALLOCATION',
		amountCents: 100000, // $1000
		date: '2024-01-01T00:00:00Z',
		payee: 'Monthly Allocation',
		note: 'Emergency fund allocation',
		tags: ['allocation']
	},
	{
		id: '2',
		fundId: '2',
		type: 'ALLOCATION',
		amountCents: 50000, // $500
		date: '2024-01-01T00:00:00Z',
		payee: 'Monthly Allocation',
		note: 'Vacation fund allocation',
		tags: ['allocation']
	}
];

// Use a global variable to persist data across requests in dev mode
globalThis.sinkingTransactions = globalThis.sinkingTransactions || [...initialTransactions];

export const GET: RequestHandler = async ({ url }) => {
	let transactions = globalThis.sinkingTransactions;

	// Filter by fund if fundId parameter is provided
	const fundId = url.searchParams.get('fundId');
	if (fundId) {
		transactions = transactions.filter((t) => t.fundId === fundId);
	}

	// Sort by date descending (newest first)
	transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

	return json({ transactions });
};

export const POST: RequestHandler = async ({ request }) => {
	const data = await request.json();

	const newTransaction = {
		id: Math.random().toString(36).substr(2, 9),
		fundId: data.fundId,
		type: data.type || 'EXPENSE',
		amountCents: data.amountCents,
		date: data.date || new Date().toISOString(),
		payee: data.payee || '',
		note: data.note || '',
		tags: data.tags || [],
		transferGroupId: data.transferGroupId || null,
		createdAt: new Date().toISOString()
	};

	globalThis.sinkingTransactions.push(newTransaction);

	// Update fund balance
	if (globalThis.sinkingFunds) {
		const fund = globalThis.sinkingFunds.find((f) => f.id === data.fundId);
		if (fund) {
			switch (data.type) {
				case 'EXPENSE':
					fund.balance -= data.amountCents;
					break;
				case 'INCOME':
				case 'ALLOCATION':
					fund.balance += data.amountCents;
					break;
				case 'TRANSFER_OUT':
					fund.balance -= data.amountCents;
					break;
				case 'TRANSFER_IN':
					fund.balance += data.amountCents;
					break;
			}
		}
	}

	return json({ transaction: newTransaction }, { status: 201 });
};
