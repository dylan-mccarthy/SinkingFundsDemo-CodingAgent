import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const data = await request.json();
	const { periodId, reason = '' } = data;
	
	if (!periodId) {
		return json({ error: 'Period ID is required' }, { status: 400 });
	}
	
	try {
		// Find the period to reopen
		const periods = globalThis.sinkingPeriods || [];
		const periodIndex = periods.findIndex(p => p.id === periodId);
		
		if (periodIndex === -1) {
			return json({ error: 'Period not found' }, { status: 404 });
		}
		
		const period = periods[periodIndex];
		
		if (period.status === 'OPEN') {
			return json({ error: 'Period is already open' }, { status: 400 });
		}
		
		// Reopen the period
		const reopenedAt = new Date().toISOString();
		periods[periodIndex] = {
			...period,
			status: 'OPEN',
			closedAt: null // Clear the closed timestamp
		};
		
		// Create audit log entry
		const auditEntry = {
			id: Math.random().toString(36).substr(2, 9),
			userId: 'user1',
			action: 'PERIOD_REOPEN',
			context: JSON.stringify({
				periodId: period.id,
				year: period.year,
				month: period.month,
				reopenedAt,
				originalClosedAt: period.closedAt,
				reason: reason || 'Manual period reopening'
			}),
			createdAt: reopenedAt
		};
		
		globalThis.sinkingAuditLogs = globalThis.sinkingAuditLogs || [];
		globalThis.sinkingAuditLogs.push(auditEntry);
		
		return json({
			success: true,
			period: periods[periodIndex],
			message: `Period ${period.year}-${period.month.toString().padStart(2, '0')} has been reopened`
		});
		
	} catch (error) {
		console.error('Error reopening period:', error);
		return json({ error: 'Failed to reopen period' }, { status: 500 });
	}
};