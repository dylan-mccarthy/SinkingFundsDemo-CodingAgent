import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const data = await request.json();
	const { fromFundId, toFundId, amountCents, note = '' } = data;
	
	// Validation
	if (!fromFundId || !toFundId || !amountCents) {
		return json({ error: 'fromFundId, toFundId, and amountCents are required' }, { status: 400 });
	}
	
	if (fromFundId === toFundId) {
		return json({ error: 'Cannot transfer to the same fund' }, { status: 400 });
	}
	
	if (amountCents <= 0) {
		return json({ error: 'Transfer amount must be greater than 0' }, { status: 400 });
	}
	
	try {
		// Get funds to validate they exist
		const funds = globalThis.sinkingFunds || [];
		const fromFund = funds.find(f => f.id === fromFundId);
		const toFund = funds.find(f => f.id === toFundId);
		
		if (!fromFund) {
			return json({ error: 'Source fund not found' }, { status: 404 });
		}
		
		if (!toFund) {
			return json({ error: 'Destination fund not found' }, { status: 404 });
		}
		
		// Check if source fund has sufficient balance
		if (fromFund.balance < amountCents) {
			return json({ 
				error: `Insufficient funds. Available: $${(fromFund.balance / 100).toFixed(2)}` 
			}, { status: 400 });
		}
		
		// Generate transfer group ID for double-entry bookkeeping
		const transferGroupId = Math.random().toString(36).substr(2, 16);
		const now = new Date().toISOString();
		
		// Create TRANSFER_OUT transaction (source fund)
		const transferOutTransaction = {
			id: Math.random().toString(36).substr(2, 9),
			userId: 'user1',
			periodId: null, // Will be set when period management is fully integrated
			fundId: fromFundId,
			type: 'TRANSFER_OUT',
			amountCents: amountCents,
			date: now,
			payee: `Transfer to ${toFund.name}`,
			note: note || `Transferred to ${toFund.name}`,
			tags: ['transfer'],
			transferGroupId: transferGroupId,
			createdAt: now,
			updatedAt: now
		};
		
		// Create TRANSFER_IN transaction (destination fund)
		const transferInTransaction = {
			id: Math.random().toString(36).substr(2, 9),
			userId: 'user1',
			periodId: null, // Will be set when period management is fully integrated
			fundId: toFundId,
			type: 'TRANSFER_IN',
			amountCents: amountCents,
			date: now,
			payee: `Transfer from ${fromFund.name}`,
			note: note || `Transferred from ${fromFund.name}`,
			tags: ['transfer'],
			transferGroupId: transferGroupId,
			createdAt: now,
			updatedAt: now
		};
		
		// Initialize transactions array if needed
		globalThis.sinkingTransactions = globalThis.sinkingTransactions || [];
		
		// Add both transactions atomically
		globalThis.sinkingTransactions.push(transferOutTransaction, transferInTransaction);
		
		// Update fund balances atomically
		fromFund.balance -= amountCents;
		toFund.balance += amountCents;
		
		// Create audit log entry
		const auditEntry = {
			id: Math.random().toString(36).substr(2, 9),
			userId: 'user1',
			action: 'TRANSFER_FUNDS',
			context: JSON.stringify({
				transferGroupId,
				fromFundId,
				toFundId,
				fromFundName: fromFund.name,
				toFundName: toFund.name,
				amountCents,
				note
			}),
			createdAt: now
		};
		
		globalThis.sinkingAuditLogs = globalThis.sinkingAuditLogs || [];
		globalThis.sinkingAuditLogs.push(auditEntry);
		
		return json({
			success: true,
			transferGroupId,
			transactions: [transferOutTransaction, transferInTransaction],
			updatedFunds: [
				{ id: fromFundId, newBalance: fromFund.balance },
				{ id: toFundId, newBalance: toFund.balance }
			],
			message: `Successfully transferred $${(amountCents / 100).toFixed(2)} from ${fromFund.name} to ${toFund.name}`
		}, { status: 201 });
		
	} catch (error) {
		console.error('Error executing transfer:', error);
		return json({ error: 'Failed to execute transfer' }, { status: 500 });
	}
};