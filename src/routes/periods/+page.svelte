<script lang="ts">
	import { onMount } from 'svelte';

	let periods: any[] = [];
	let auditLogs: any[] = [];
	let loading = true;
	let selectedPeriod: any = null;
	let actionReason = '';
	let showAuditLogs = false;

	onMount(async () => {
		await loadData();
	});

	const loadData = async () => {
		try {
			const [periodsResponse, auditResponse] = await Promise.all([
				fetch('/api/periods'),
				fetch('/api/audit-logs?limit=20')
			]);

			if (periodsResponse.ok) {
				const periodsData = await periodsResponse.json();
				periods = periodsData.periods || [];
			}

			if (auditResponse.ok) {
				const auditData = await auditResponse.json();
				auditLogs = auditData.logs || [];
			}
		} catch (error) {
			console.error('Error loading data:', error);
		} finally {
			loading = false;
		}
	};

	const closePeriod = async (period: any) => {
		if (
			!confirm(
				`Close period ${period.year}-${period.month.toString().padStart(2, '0')}? This will prevent further changes to this period.`
			)
		) {
			return;
		}

		const reason = prompt('Reason for closing (optional):') || 'Manual closure';

		try {
			const response = await fetch('/api/periods/close', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					periodId: period.id,
					reason
				})
			});

			const result = await response.json();

			if (response.ok) {
				alert(result.message);
				await loadData(); // Refresh data
			} else {
				alert(`Failed to close period: ${result.error}`);
			}
		} catch (error) {
			console.error('Error closing period:', error);
			alert('Failed to close period');
		}
	};

	const reopenPeriod = async (period: any) => {
		if (
			!confirm(
				`Reopen period ${period.year}-${period.month.toString().padStart(2, '0')}? This will allow changes to this period again.`
			)
		) {
			return;
		}

		const reason = prompt('Reason for reopening (optional):') || 'Manual reopening';

		try {
			const response = await fetch('/api/periods/reopen', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					periodId: period.id,
					reason
				})
			});

			const result = await response.json();

			if (response.ok) {
				alert(result.message);
				await loadData(); // Refresh data
			} else {
				alert(`Failed to reopen period: ${result.error}`);
			}
		} catch (error) {
			console.error('Error reopening period:', error);
			alert('Failed to reopen period');
		}
	};

	const downloadTransactionsCSV = () => {
		const url = '/api/export?type=transactions';
		const link = document.createElement('a');
		link.href = url;
		link.download = '';
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	const downloadFundsCSV = () => {
		const url = '/api/export?type=funds';
		const link = document.createElement('a');
		link.href = url;
		link.download = '';
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleString();
	};

	const getStatusBadge = (status: string) => {
		return status === 'OPEN' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
	};

	const getActionBadge = (action: string) => {
		switch (action) {
			case 'PERIOD_START':
				return 'bg-blue-100 text-blue-800';
			case 'PERIOD_CLOSE':
				return 'bg-red-100 text-red-800';
			case 'PERIOD_REOPEN':
				return 'bg-yellow-100 text-yellow-800';
			case 'TRANSFER_FUNDS':
				return 'bg-purple-100 text-purple-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	};
</script>

<svelte:head>
	<title>Period Management - Sinking Funds Manager</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<header class="mb-8">
		<h1 class="text-3xl font-bold text-gray-900 mb-2">Period Management</h1>
		<p class="text-gray-600">Manage monthly periods and view system audit logs</p>
	</header>

	{#if loading}
		<div class="bg-gray-50 rounded-lg p-8 text-center">
			<p class="text-gray-500">Loading periods and audit logs...</p>
		</div>
	{:else}
		<!-- Export Actions -->
		<div class="mb-8">
			<h2 class="text-xl font-semibold text-gray-800 mb-4">Data Export</h2>
			<div class="flex flex-wrap gap-4">
				<button
					on:click={downloadTransactionsCSV}
					class="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-md transition-colors"
				>
					📊 Export Transactions CSV
				</button>
				<button
					on:click={downloadFundsCSV}
					class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md transition-colors"
				>
					💰 Export Funds Summary CSV
				</button>
			</div>
		</div>

		<!-- Periods Management -->
		<div class="mb-8">
			<h2 class="text-xl font-semibold text-gray-800 mb-4">Periods</h2>
			{#if periods.length === 0}
				<div class="bg-gray-50 rounded-lg p-8 text-center">
					<p class="text-gray-500">No periods found.</p>
				</div>
			{:else}
				<div class="bg-white rounded-lg shadow-md overflow-hidden">
					<table class="w-full">
						<thead class="bg-gray-50">
							<tr>
								<th
									class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
									>Period</th
								>
								<th
									class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
									>Status</th
								>
								<th
									class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
									>Started</th
								>
								<th
									class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
									>Closed</th
								>
								<th
									class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
									>Actions</th
								>
							</tr>
						</thead>
						<tbody class="bg-white divide-y divide-gray-200">
							{#each periods as period}
								<tr class="hover:bg-gray-50">
									<td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
										{period.year}-{period.month.toString().padStart(2, '0')}
									</td>
									<td class="px-6 py-4 whitespace-nowrap">
										<span
											class="inline-flex px-2 py-1 text-xs font-semibold rounded-full {getStatusBadge(
												period.status
											)}"
										>
											{period.status}
										</span>
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
										{formatDate(period.startedAt)}
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
										{period.closedAt ? formatDate(period.closedAt) : '-'}
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm">
										{#if period.status === 'OPEN'}
											<button
												on:click={() => closePeriod(period)}
												class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs transition-colors"
											>
												Close
											</button>
										{:else}
											<button
												on:click={() => reopenPeriod(period)}
												class="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-xs transition-colors"
											>
												Reopen
											</button>
										{/if}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</div>

		<!-- Audit Log Toggle -->
		<div class="mb-4">
			<button
				on:click={() => (showAuditLogs = !showAuditLogs)}
				class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors"
			>
				{showAuditLogs ? 'Hide' : 'Show'} Audit Logs
			</button>
		</div>

		<!-- Audit Logs -->
		{#if showAuditLogs}
			<div>
				<h2 class="text-xl font-semibold text-gray-800 mb-4">Recent Audit Logs</h2>
				{#if auditLogs.length === 0}
					<div class="bg-gray-50 rounded-lg p-8 text-center">
						<p class="text-gray-500">No audit logs found.</p>
					</div>
				{:else}
					<div class="bg-white rounded-lg shadow-md overflow-hidden">
						<table class="w-full">
							<thead class="bg-gray-50">
								<tr>
									<th
										class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
										>Date</th
									>
									<th
										class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
										>Action</th
									>
									<th
										class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
										>Details</th
									>
								</tr>
							</thead>
							<tbody class="bg-white divide-y divide-gray-200">
								{#each auditLogs as log}
									<tr class="hover:bg-gray-50">
										<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
											{formatDate(log.createdAt)}
										</td>
										<td class="px-6 py-4 whitespace-nowrap">
											<span
												class="inline-flex px-2 py-1 text-xs font-semibold rounded-full {getActionBadge(
													log.action
												)}"
											>
												{log.action}
											</span>
										</td>
										<td class="px-6 py-4 text-sm text-gray-900">
											<div class="max-w-xs truncate">
												{log.context || 'No details available'}
											</div>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/if}
			</div>
		{/if}
	{/if}
</div>
