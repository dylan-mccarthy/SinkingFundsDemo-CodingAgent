import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Simple in-memory store for allocation rules - will be replaced with Prisma later
const initialRules = [
	{
		id: '1',
		userId: 'user1',
		fundId: '1',
		mode: 'percent',
		percentBp: 5000, // 50%
		fixedCents: null,
		priority: 1,
		active: true,
		createdAt: '2024-01-01T00:00:00Z',
		updatedAt: '2024-01-01T00:00:00Z'
	},
	{
		id: '2',
		userId: 'user1',
		fundId: '2',
		mode: 'percent',
		percentBp: 3000, // 30%
		fixedCents: null,
		priority: 2,
		active: true,
		createdAt: '2024-01-01T00:00:00Z',
		updatedAt: '2024-01-01T00:00:00Z'
	}
];

// Use a global variable to persist data across requests in dev mode
globalThis.sinkingAllocationRules = globalThis.sinkingAllocationRules || [...initialRules];

export const GET: RequestHandler = async ({ url }) => {
	let rules = globalThis.sinkingAllocationRules;
	
	// Filter by fund if fundId parameter is provided
	const fundId = url.searchParams.get('fundId');
	if (fundId) {
		rules = rules.filter(r => r.fundId === fundId);
	}
	
	// Filter by active status
	const activeOnly = url.searchParams.get('active');
	if (activeOnly === 'true') {
		rules = rules.filter(r => r.active);
	}
	
	// Sort by priority ascending (higher priority first)
	rules.sort((a, b) => a.priority - b.priority);
	
	return json({ rules });
};

export const POST: RequestHandler = async ({ request }) => {
	const data = await request.json();
	
	const newRule = {
		id: Math.random().toString(36).substr(2, 9),
		userId: 'user1',
		fundId: data.fundId,
		mode: data.mode, // 'fixed', 'percent', 'priority'
		percentBp: data.percentBp || null, // basis points (1/100th of a percent)
		fixedCents: data.fixedCents || null,
		priority: data.priority || 0,
		active: data.active !== false,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString()
	};

	// Validate mode-specific fields
	if (newRule.mode === 'percent' && !newRule.percentBp) {
		return json({ error: 'percentBp is required for percent mode' }, { status: 400 });
	}
	
	if (newRule.mode === 'fixed' && !newRule.fixedCents) {
		return json({ error: 'fixedCents is required for fixed mode' }, { status: 400 });
	}

	globalThis.sinkingAllocationRules.push(newRule);
	
	return json({ rule: newRule }, { status: 201 });
};

export const PUT: RequestHandler = async ({ request }) => {
	const data = await request.json();
	const ruleId = data.id;
	
	if (!ruleId) {
		return json({ error: 'Rule ID is required' }, { status: 400 });
	}
	
	const ruleIndex = globalThis.sinkingAllocationRules.findIndex(r => r.id === ruleId);
	if (ruleIndex === -1) {
		return json({ error: 'Rule not found' }, { status: 404 });
	}
	
	// Update the rule
	const updatedRule = {
		...globalThis.sinkingAllocationRules[ruleIndex],
		...data,
		updatedAt: new Date().toISOString()
	};
	
	globalThis.sinkingAllocationRules[ruleIndex] = updatedRule;
	
	return json({ rule: updatedRule });
};