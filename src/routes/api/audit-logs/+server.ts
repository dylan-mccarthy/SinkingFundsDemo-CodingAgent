import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	try {
		let logs = globalThis.sinkingAuditLogs || [];

		// Filter by action type if provided
		const action = url.searchParams.get('action');
		if (action) {
			logs = logs.filter((log) => log.action === action);
		}

		// Filter by date range if provided
		const startDate = url.searchParams.get('startDate');
		const endDate = url.searchParams.get('endDate');

		if (startDate) {
			const start = new Date(startDate);
			logs = logs.filter((log) => new Date(log.createdAt) >= start);
		}

		if (endDate) {
			const end = new Date(endDate);
			logs = logs.filter((log) => new Date(log.createdAt) <= end);
		}

		// Pagination
		const page = parseInt(url.searchParams.get('page') || '1');
		const limit = parseInt(url.searchParams.get('limit') || '50');
		const offset = (page - 1) * limit;

		// Sort by creation date descending (newest first)
		logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

		const totalCount = logs.length;
		const paginatedLogs = logs.slice(offset, offset + limit);

		return json({
			logs: paginatedLogs,
			pagination: {
				page,
				limit,
				total: totalCount,
				pages: Math.ceil(totalCount / limit)
			}
		});
	} catch (error) {
		console.error('Error fetching audit logs:', error);
		return json({ error: 'Failed to fetch audit logs' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request }) => {
	const data = await request.json();
	const { action, context = null } = data;

	if (!action) {
		return json({ error: 'Action is required' }, { status: 400 });
	}

	try {
		const auditEntry = {
			id: Math.random().toString(36).substr(2, 9),
			userId: 'user1',
			action,
			context: typeof context === 'string' ? context : JSON.stringify(context),
			createdAt: new Date().toISOString()
		};

		globalThis.sinkingAuditLogs = globalThis.sinkingAuditLogs || [];
		globalThis.sinkingAuditLogs.push(auditEntry);

		return json(
			{
				success: true,
				auditLog: auditEntry
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error('Error creating audit log:', error);
		return json({ error: 'Failed to create audit log' }, { status: 500 });
	}
};
