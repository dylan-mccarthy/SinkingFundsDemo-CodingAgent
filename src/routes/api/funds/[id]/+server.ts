import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Use the same global store as the main funds API
const getFundById = (id: string) => {
	// Ensure the global store exists
	if (!globalThis.sinkingFunds) {
		globalThis.sinkingFunds = [];
	}
	return globalThis.sinkingFunds.find((f: any) => f.id === id);
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

	// Ensure the global store exists
	if (!globalThis.sinkingFunds) {
		globalThis.sinkingFunds = [];
	}

	const fundIndex = globalThis.sinkingFunds.findIndex((f: any) => f.id === params.id);

	if (fundIndex === -1) {
		return json({ error: 'Fund not found' }, { status: 404 });
	}

	// Update fund properties
	const fund = globalThis.sinkingFunds[fundIndex];
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
	// Ensure the global store exists
	if (!globalThis.sinkingFunds) {
		globalThis.sinkingFunds = [];
	}

	const fundIndex = globalThis.sinkingFunds.findIndex((f: any) => f.id === params.id);

	if (fundIndex === -1) {
		return json({ error: 'Fund not found' }, { status: 404 });
	}

	// Remove fund from the global store
	globalThis.sinkingFunds.splice(fundIndex, 1);

	return json({ success: true });
};
