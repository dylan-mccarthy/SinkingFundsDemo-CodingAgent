import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// This will be replaced with actual data store later
const getFundById = (id: string) => {
	// Mock implementation - would query database in real app
	const funds = [
		{
			id: '1',
			name: 'Emergency Fund',
			description: 'Emergency savings for unexpected expenses',
			color: '#ef4444',
			icon: '🚨',
			targetCents: 500000,
			balance: 250000
		},
		{
			id: '2',
			name: 'Vacation',
			description: 'Saving for our next vacation',
			color: '#06b6d4',
			icon: '✈️',
			targetCents: 300000,
			balance: 125000
		}
	];
	return funds.find((f) => f.id === id);
};

export const GET: RequestHandler = async ({ params }) => {
	const fund = getFundById(params.id);

	if (!fund) {
		return json({ error: 'Fund not found' }, { status: 404 });
	}

	return json({ fund });
};

export const PUT: RequestHandler = async ({ params, request }) => {
	const data = await request.json();
	const fund = getFundById(params.id);

	if (!fund) {
		return json({ error: 'Fund not found' }, { status: 404 });
	}

	// Update fund properties
	Object.assign(fund, {
		name: data.name || fund.name,
		description: data.description || fund.description,
		color: data.color || fund.color,
		icon: data.icon || fund.icon,
		targetCents: data.targetCents ?? fund.targetCents
	});

	return json({ fund });
};

export const DELETE: RequestHandler = async ({ params }) => {
	const fund = getFundById(params.id);

	if (!fund) {
		return json({ error: 'Fund not found' }, { status: 404 });
	}

	// In real app, we would archive instead of delete if balance > 0
	return json({ success: true });
};
