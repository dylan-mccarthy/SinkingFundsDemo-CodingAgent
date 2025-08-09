import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Simple in-memory store for allocation runs - will be replaced with Prisma later
globalThis.sinkingAllocationRuns = globalThis.sinkingAllocationRuns || [];

// Helper function to calculate allocations based on rules
function calculateAllocations(depositCents: number, rules: any[], funds: any[]) {
	const allocations = [];
	let remainingAmount = depositCents;
	
	// Sort rules by priority
	const sortedRules = rules.filter(r => r.active).sort((a, b) => a.priority - b.priority);
	
	// Phase 1: Handle fixed allocations first
	for (const rule of sortedRules.filter(r => r.mode === 'fixed')) {
		const fund = funds.find(f => f.id === rule.fundId);
		if (!fund) continue;
		
		const allocation = Math.min(rule.fixedCents, remainingAmount);
		if (allocation > 0) {
			allocations.push({
				fundId: rule.fundId,
				fundName: fund.name,
				amountCents: allocation,
				mode: 'fixed'
			});
			remainingAmount -= allocation;
		}
	}
	
	// Phase 2: Handle percentage allocations
	const percentRules = sortedRules.filter(r => r.mode === 'percent');
	const totalPercentBp = percentRules.reduce((sum, r) => sum + (r.percentBp || 0), 0);
	
	for (const rule of percentRules) {
		const fund = funds.find(f => f.id === rule.fundId);
		if (!fund) continue;
		
		// Calculate percentage of original deposit amount
		const percentageAmount = Math.floor((depositCents * rule.percentBp) / 10000);
		const allocation = Math.min(percentageAmount, remainingAmount);
		
		if (allocation > 0) {
			allocations.push({
				fundId: rule.fundId,
				fundName: fund.name,
				amountCents: allocation,
				mode: 'percent',
				percentBp: rule.percentBp
			});
			remainingAmount -= allocation;
		}
	}
	
	// Phase 3: Handle priority allocations with remaining amount
	const priorityRules = sortedRules.filter(r => r.mode === 'priority');
	for (const rule of priorityRules) {
		const fund = funds.find(f => f.id === rule.fundId);
		if (!fund || remainingAmount <= 0) continue;
		
		// For priority mode, allocate all remaining to highest priority fund
		allocations.push({
			fundId: rule.fundId,
			fundName: fund.name,
			amountCents: remainingAmount,
			mode: 'priority'
		});
		remainingAmount = 0;
		break; // Only allocate to first priority fund
	}
	
	return {
		allocations,
		totalAllocated: depositCents - remainingAmount,
		remainingAmount
	};
}

export const GET: RequestHandler = async ({ url }) => {
	// Get allocation runs history
	const runs = globalThis.sinkingAllocationRuns;
	
	// Sort by execution date descending (newest first)
	runs.sort((a, b) => new Date(b.executedAt).getTime() - new Date(a.executedAt).getTime());
	
	return json({ runs });
};

export const POST: RequestHandler = async ({ request }) => {
	const data = await request.json();
	const { depositCents, preview = false } = data;
	
	if (!depositCents || depositCents <= 0) {
		return json({ error: 'Valid deposit amount is required' }, { status: 400 });
	}
	
	// Get current allocation rules and funds
	const rules = globalThis.sinkingAllocationRules || [];
	const funds = globalThis.sinkingFunds || [];
	
	if (funds.length === 0) {
		return json({ error: 'No funds available for allocation' }, { status: 400 });
	}
	
	// Calculate allocations
	const result = calculateAllocations(depositCents, rules, funds);
	
	// If preview mode, return without executing
	if (preview) {
		return json({
			preview: true,
			depositCents,
			...result
		});
	}
	
	// Execute allocation
	const allocationRun = {
		id: Math.random().toString(36).substr(2, 9),
		userId: 'user1',
		periodId: null, // Will be set when period management is implemented
		depositCents,
		executedAt: new Date().toISOString(),
		hash: Math.random().toString(36).substr(2, 16),
		lines: result.allocations
	};
	
	// Save allocation run
	globalThis.sinkingAllocationRuns.push(allocationRun);
	
	// Create allocation transactions and update fund balances
	for (const allocation of result.allocations) {
		// Create allocation transaction
		const transaction = {
			id: Math.random().toString(36).substr(2, 9),
			fundId: allocation.fundId,
			type: 'ALLOCATION',
			amountCents: allocation.amountCents,
			date: new Date().toISOString(),
			payee: 'Monthly Allocation',
			note: `Allocation from ${(depositCents / 100).toFixed(2)} deposit`,
			tags: ['allocation'],
			transferGroupId: null,
			createdAt: new Date().toISOString()
		};
		
		globalThis.sinkingTransactions.push(transaction);
		
		// Update fund balance
		const fund = globalThis.sinkingFunds.find(f => f.id === allocation.fundId);
		if (fund) {
			fund.balance += allocation.amountCents;
		}
	}
	
	return json({
		success: true,
		allocationRun,
		...result
	}, { status: 201 });
};