<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	
	let fund: any = null;
	let transactions: any[] = [];
	let loading = true;
	let balanceHistory: { date: string; balance: number }[] = [];
	
	$: fundId = $page.params.id;
	
	onMount(async () => {
		if (!fundId) return;
		
		try {
			// Load fund details and transactions
			const [fundResponse, transactionsResponse] = await Promise.all([
				fetch(`/api/funds/${fundId}`),
				fetch(`/api/transactions?fundId=${fundId}`)
			]);
			
			if (fundResponse.ok) {
				const fundData = await fundResponse.json();
				fund = fundData.fund;
			}
			
			if (transactionsResponse.ok) {
				const transactionsData = await transactionsResponse.json();
				transactions = transactionsData.transactions || [];
				
				// Calculate balance history
				calculateBalanceHistory();
			}
		} catch (error) {
			console.error('Error loading fund details:', error);
		} finally {
			loading = false;
		}
	});
	
	const calculateBalanceHistory = () => {
		if (!fund || transactions.length === 0) return;
		
		// Sort transactions by date (oldest first)
		const sortedTransactions = [...transactions].sort((a, b) => 
			new Date(a.date).getTime() - new Date(a.date).getTime()
		);
		
		let runningBalance = 0;
		balanceHistory = [];
		
		// Start with initial balance (before any transactions)
		balanceHistory.push({
			date: sortedTransactions[0]?.date || new Date().toISOString(),
			balance: 0
		});
		
		// Calculate running balance through each transaction
		for (const transaction of sortedTransactions) {
			switch (transaction.type) {
				case 'EXPENSE':
				case 'TRANSFER_OUT':
					runningBalance -= transaction.amountCents;
					break;
				case 'INCOME':
				case 'ALLOCATION':
				case 'TRANSFER_IN':
					runningBalance += transaction.amountCents;
					break;
			}
			
			balanceHistory.push({
				date: transaction.date,
				balance: runningBalance
			});
		}
	};
	
	const formatTransactionAmount = (transaction: any) => {
		const amount = (transaction.amountCents / 100).toFixed(2);
		switch (transaction.type) {
			case 'EXPENSE':
			case 'TRANSFER_OUT':
				return `-$${amount}`;
			case 'INCOME':
			case 'ALLOCATION':
			case 'TRANSFER_IN':
				return `+$${amount}`;
			default:
				return `$${amount}`;
		}
	};
	
	const getTransactionTypeColor = (type: string) => {
		switch (type) {
			case 'EXPENSE':
			case 'TRANSFER_OUT':
				return 'text-red-600';
			case 'INCOME':
			case 'ALLOCATION':
			case 'TRANSFER_IN':
				return 'text-green-600';
			default:
				return 'text-gray-600';
		}
	};
	
	const getTransactionTypeLabel = (type: string) => {
		switch (type) {
			case 'EXPENSE':
				return 'Expense';
			case 'INCOME':
				return 'Income';
			case 'ALLOCATION':
				return 'Allocation';
			case 'TRANSFER_OUT':
				return 'Transfer Out';
			case 'TRANSFER_IN':
				return 'Transfer In';
			default:
				return type;
		}
	};
	
	$: progressPercentage = fund && fund.targetCents > 0 
		? Math.min(100, (fund.balance / fund.targetCents) * 100) 
		: 0;
</script>

<svelte:head>
	<title>{fund ? `${fund.name} - Fund Details` : 'Fund Details'} - Sinking Funds Manager</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	{#if loading}
		<div class="bg-gray-50 rounded-lg p-8 text-center">
			<p class="text-gray-500">Loading fund details...</p>
		</div>
	{:else if !fund}
		<div class="bg-red-50 border border-red-200 rounded-lg p-6">
			<h3 class="text-lg font-semibold text-red-800 mb-2">Fund Not Found</h3>
			<p class="text-red-700 mb-4">The requested fund could not be found.</p>
			<a href="/" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors">
				Back to Dashboard
			</a>
		</div>
	{:else}
		<!-- Fund Header -->
		<header class="mb-8">
			<div class="flex items-center space-x-4 mb-4">
				<span class="text-4xl">{fund.icon}</span>
				<div>
					<h1 class="text-3xl font-bold text-gray-900">{fund.name}</h1>
					{#if fund.description}
						<p class="text-gray-600">{fund.description}</p>
					{/if}
				</div>
			</div>
			
			<div class="flex items-center space-x-2 text-sm text-gray-500">
				<a href="/" class="hover:text-blue-600">Dashboard</a>
				<span>•</span>
				<span>Fund Details</span>
			</div>
		</header>

		<!-- Fund Overview Cards -->
		<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
			<div class="bg-white rounded-lg shadow-md p-6 border-l-4" style="border-left-color: {fund.color}">
				<h3 class="text-lg font-semibold text-gray-800 mb-2">Current Balance</h3>
				<p class="text-3xl font-bold text-green-600">${(fund.balance / 100).toFixed(2)}</p>
			</div>
			
			{#if fund.targetCents > 0}
				<div class="bg-white rounded-lg shadow-md p-6">
					<h3 class="text-lg font-semibold text-gray-800 mb-2">Target Goal</h3>
					<p class="text-3xl font-bold text-blue-600">${(fund.targetCents / 100).toFixed(2)}</p>
					<div class="mt-2">
						<div class="flex justify-between text-sm text-gray-600 mb-1">
							<span>Progress</span>
							<span>{progressPercentage.toFixed(1)}%</span>
						</div>
						<div class="w-full bg-gray-200 rounded-full h-2">
							<div 
								class="bg-blue-600 h-2 rounded-full transition-all duration-300" 
								style="width: {progressPercentage}%">
							</div>
						</div>
					</div>
				</div>
			{/if}
			
			<div class="bg-white rounded-lg shadow-md p-6">
				<h3 class="text-lg font-semibold text-gray-800 mb-2">Transactions</h3>
				<p class="text-3xl font-bold text-purple-600">{transactions.length}</p>
			</div>
		</div>

		<!-- Quick Actions -->
		<div class="mb-8">
			<h2 class="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
			<div class="flex flex-wrap gap-4">
				<button class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors">
					<a href="/transactions/create?fundId={fund.id}" class="text-white no-underline">Add Transaction</a>
				</button>
				<button class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors">
					<a href="/transfers?fromFund={fund.id}" class="text-white no-underline">Transfer From This Fund</a>
				</button>
				<button class="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md transition-colors">
					<a href="/funds/{fund.id}/edit" class="text-white no-underline">Edit Fund</a>
				</button>
			</div>
		</div>

		<!-- Balance History (Simple Version) -->
		{#if balanceHistory.length > 1}
			<div class="mb-8">
				<h2 class="text-xl font-semibold text-gray-800 mb-4">Balance History</h2>
				<div class="bg-white rounded-lg shadow-md p-6">
					<div class="space-y-2">
						{#each balanceHistory.slice(-10).reverse() as entry}
							<div class="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
								<span class="text-gray-600">
									{new Date(entry.date).toLocaleDateString()}
								</span>
								<span class="font-mono font-semibold {entry.balance >= 0 ? 'text-green-600' : 'text-red-600'}">
									${(entry.balance / 100).toFixed(2)}
								</span>
							</div>
						{/each}
					</div>
				</div>
			</div>
		{/if}

		<!-- Transaction History -->
		<div>
			<h2 class="text-xl font-semibold text-gray-800 mb-4">Transaction History</h2>
			{#if transactions.length === 0}
				<div class="bg-gray-50 rounded-lg p-8 text-center">
					<p class="text-gray-500 mb-4">No transactions yet for this fund.</p>
					<button class="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-md transition-colors">
						<a href="/transactions/create?fundId={fund.id}" class="text-white no-underline">Add First Transaction</a>
					</button>
				</div>
			{:else}
				<div class="bg-white rounded-lg shadow-md overflow-hidden">
					<table class="w-full">
						<thead class="bg-gray-50">
							<tr>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
							</tr>
						</thead>
						<tbody class="bg-white divide-y divide-gray-200">
							{#each transactions as transaction}
								<tr class="hover:bg-gray-50">
									<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
										{new Date(transaction.date).toLocaleDateString()}
									</td>
									<td class="px-6 py-4 whitespace-nowrap">
										<span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full {
											transaction.type === 'EXPENSE' || transaction.type === 'TRANSFER_OUT' ? 'bg-red-100 text-red-800' :
											transaction.type === 'INCOME' || transaction.type === 'ALLOCATION' || transaction.type === 'TRANSFER_IN' ? 'bg-green-100 text-green-800' :
											'bg-gray-100 text-gray-800'
										}">
											{getTransactionTypeLabel(transaction.type)}
										</span>
									</td>
									<td class="px-6 py-4 text-sm text-gray-900">
										<div>
											{#if transaction.payee}
												<span class="font-medium">{transaction.payee}</span>
											{:else}
												<span class="text-gray-500">{getTransactionTypeLabel(transaction.type)}</span>
											{/if}
										</div>
										{#if transaction.note}
											<div class="text-gray-500 text-xs mt-1">{transaction.note}</div>
										{/if}
										{#if transaction.tags && transaction.tags.length > 0}
											<div class="flex space-x-1 mt-1">
												{#each transaction.tags as tag}
													<span class="inline-flex px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
														{tag}
													</span>
												{/each}
											</div>
										{/if}
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm font-medium {getTransactionTypeColor(transaction.type)}">
										{formatTransactionAmount(transaction)}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</div>
	{/if}
</div>