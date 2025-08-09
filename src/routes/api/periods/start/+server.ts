import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const data = await request.json();
	const { depositCents, autoAllocate = false } = data;
	
	try {
		// Get current date for new period
		const now = new Date();
		const year = now.getFullYear();
		const month = now.getMonth() + 1;
		
		// Check if period already exists for this month
		const existingPeriod = (globalThis.sinkingPeriods || []).find(p => 
			p.year === year && p.month === month
		);
		
		if (existingPeriod) {
			return json({ error: 'Period already exists for this month' }, { status: 400 });
		}
		
		// Create new period
		const newPeriod = {
			id: Math.random().toString(36).substr(2, 9),
			userId: 'user1',
			year,
			month,
			status: 'OPEN',
			startedAt: now.toISOString(),
			closedAt: null
		};
		
		globalThis.sinkingPeriods = globalThis.sinkingPeriods || [];
		globalThis.sinkingPeriods.push(newPeriod);
		
		// Rollover: Fund balances remain the same (this rewards underspending)
		// No changes needed to fund balances - this is the "sinking" benefit
		
		let allocationResult = null;
		
		// Execute automatic allocation if requested and deposit amount provided
		if (autoAllocate && depositCents > 0) {
			// Get allocation rules and funds
			const rules = globalThis.sinkingAllocationRules || [];
			const funds = globalThis.sinkingFunds || [];
			
			// Calculate and execute allocation
			const allocationResponse = await fetch('/api/allocations', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					depositCents,
					preview: false
				})
			});
			
			if (allocationResponse.ok) {
				allocationResult = await allocationResponse.json();
				// Link allocation run to the new period
				if (allocationResult.allocationRun) {
					allocationResult.allocationRun.periodId = newPeriod.id;
					
					// Update the saved allocation run
					const runIndex = globalThis.sinkingAllocationRuns.findIndex(
						r => r.id === allocationResult.allocationRun.id
					);
					if (runIndex >= 0) {
						globalThis.sinkingAllocationRuns[runIndex].periodId = newPeriod.id;
					}
				}
			}
		}
		
		// Create audit log entry
		const auditEntry = {
			id: Math.random().toString(36).substr(2, 9),
			userId: 'user1',
			action: 'PERIOD_START',
			context: JSON.stringify({
				period: newPeriod,
				autoAllocate,
				depositCents: depositCents || 0,
				allocationExecuted: !!allocationResult
			}),
			createdAt: now.toISOString()
		};
		
		globalThis.sinkingAuditLogs = globalThis.sinkingAuditLogs || [];
		globalThis.sinkingAuditLogs.push(auditEntry);
		
		return json({
			success: true,
			period: newPeriod,
			allocation: allocationResult,
			message: `Started new period for ${year}-${month.toString().padStart(2, '0')}${autoAllocate && allocationResult ? ' with automatic allocation' : ''}`
		}, { status: 201 });
		
	} catch (error) {
		console.error('Error starting new period:', error);
		return json({ error: 'Failed to start new period' }, { status: 500 });
	}
};