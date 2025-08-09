import type { RequestHandler } from './$types';

// Helper function to escape CSV fields
function escapeCSVField(field: any): string {
	if (field === null || field === undefined) {
		return '';
	}

	const str = String(field);

	// If field contains comma, quote, or newline, wrap in quotes and escape quotes
	if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
		return `"${str.replace(/"/g, '""')}"`;
	}

	return str;
}

// Convert transactions to CSV format
function transactionsToCSV(transactions: any[], funds: any[]): string {
	const headers = [
		'Date',
		'Fund',
		'Type',
		'Amount',
		'Payee',
		'Note',
		'Tags',
		'Transfer Group ID',
		'Created At'
	];

	const csvRows = [headers.join(',')];

	for (const transaction of transactions) {
		const fund = funds.find((f) => f.id === transaction.fundId);
		const amount = transaction.amountCents / 100;
		const formattedAmount =
			transaction.type === 'EXPENSE' || transaction.type === 'TRANSFER_OUT' ? -amount : amount;

		const row = [
			escapeCSVField(new Date(transaction.date).toLocaleDateString()),
			escapeCSVField(fund ? `${fund.icon} ${fund.name}` : 'Unknown Fund'),
			escapeCSVField(transaction.type),
			escapeCSVField(formattedAmount.toFixed(2)),
			escapeCSVField(transaction.payee || ''),
			escapeCSVField(transaction.note || ''),
			escapeCSVField((transaction.tags || []).join('; ')),
			escapeCSVField(transaction.transferGroupId || ''),
			escapeCSVField(new Date(transaction.createdAt).toLocaleString())
		];

		csvRows.push(row.join(','));
	}

	return csvRows.join('\n');
}

export const GET: RequestHandler = async ({ url }) => {
	try {
		const exportType = url.searchParams.get('type') || 'transactions';

		if (exportType === 'transactions') {
			// Get transactions and funds
			const transactions = globalThis.sinkingTransactions || [];
			const funds = globalThis.sinkingFunds || [];

			// Filter by date range if provided
			let filteredTransactions = transactions;

			const startDate = url.searchParams.get('startDate');
			const endDate = url.searchParams.get('endDate');
			const fundId = url.searchParams.get('fundId');

			if (startDate) {
				const start = new Date(startDate);
				filteredTransactions = filteredTransactions.filter((t) => new Date(t.date) >= start);
			}

			if (endDate) {
				const end = new Date(endDate);
				filteredTransactions = filteredTransactions.filter((t) => new Date(t.date) <= end);
			}

			if (fundId) {
				filteredTransactions = filteredTransactions.filter((t) => t.fundId === fundId);
			}

			// Sort by date descending
			filteredTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

			// Convert to CSV
			const csvContent = transactionsToCSV(filteredTransactions, funds);

			// Generate filename
			const now = new Date();
			const dateStr = now.toISOString().split('T')[0];
			const filename = `sinking-funds-transactions-${dateStr}.csv`;

			// Return CSV response
			return new Response(csvContent, {
				headers: {
					'Content-Type': 'text/csv',
					'Content-Disposition': `attachment; filename="${filename}"`
				}
			});
		} else if (exportType === 'funds') {
			// Export funds summary
			const funds = globalThis.sinkingFunds || [];

			const headers = [
				'Name',
				'Description',
				'Current Balance',
				'Target Amount',
				'Progress %',
				'Icon',
				'Color',
				'Active',
				'Created At'
			];

			const csvRows = [headers.join(',')];

			for (const fund of funds) {
				const progressPercent =
					fund.targetCents > 0 ? ((fund.balance / fund.targetCents) * 100).toFixed(1) : '0.0';

				const row = [
					escapeCSVField(fund.name),
					escapeCSVField(fund.description || ''),
					escapeCSVField((fund.balance / 100).toFixed(2)),
					escapeCSVField(fund.targetCents ? (fund.targetCents / 100).toFixed(2) : ''),
					escapeCSVField(progressPercent),
					escapeCSVField(fund.icon || ''),
					escapeCSVField(fund.color || ''),
					escapeCSVField(fund.active ? 'Yes' : 'No'),
					escapeCSVField(new Date(fund.createdAt || '').toLocaleString())
				];

				csvRows.push(row.join(','));
			}

			const csvContent = csvRows.join('\n');
			const now = new Date();
			const dateStr = now.toISOString().split('T')[0];
			const filename = `sinking-funds-summary-${dateStr}.csv`;

			return new Response(csvContent, {
				headers: {
					'Content-Type': 'text/csv',
					'Content-Disposition': `attachment; filename="${filename}"`
				}
			});
		} else {
			return new Response(JSON.stringify({ error: 'Invalid export type' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' }
			});
		}
	} catch (error) {
		console.error('Error exporting data:', error);
		return new Response(JSON.stringify({ error: 'Failed to export data' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
};
