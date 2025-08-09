<script lang="ts">
	// Dashboard page for Sinking Funds Manager
	import { onMount } from 'svelte';
	
	let funds: any[] = [];
	let totalBalance = 0;
	let recentTransactions: any[] = [];
	let loading = true;
	
	onMount(async () => {
		try {
			// Load funds from API
			const fundsResponse = await fetch('/api/funds');
			const fundsData = await fundsResponse.json();
			funds = fundsData.funds || [];
			
			// Load recent transactions
			const transactionsResponse = await fetch('/api/transactions');
			const transactionsData = await transactionsResponse.json();
			recentTransactions = (transactionsData.transactions || []).slice(0, 5); // Show only 5 most recent
			
			// Calculate total balance
			totalBalance = funds.reduce((sum, fund) => sum + fund.balance, 0);
		} catch (error) {
			console.error('Error loading data:', error);
		} finally {
			loading = false;
		}
	});
	
	const handleCreateFund = () => {
		// Navigate to fund creation page
		window.location.href = '/funds/create';
	};
	
	const handleAddTransaction = () => {
		// Navigate to transaction creation page
		window.location.href = '/transactions/create';
	};
	
	const handleStartNewMonth = async () => {
		const depositAmount = prompt('Enter monthly deposit amount (optional):');
		let depositCents = 0;
		
		if (depositAmount && parseFloat(depositAmount) > 0) {
			depositCents = Math.round(parseFloat(depositAmount) * 100);
		}
		
		const autoAllocate = depositCents > 0 && confirm('Automatically allocate this deposit according to your allocation rules?');
		
		try {
			const response = await fetch('/api/periods/start', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					depositCents,
					autoAllocate
				})
			});
			
			const result = await response.json();
			
			if (response.ok) {
				alert(result.message);
				window.location.reload(); // Refresh to show updated data
			} else {
				alert(`Failed to start new month: ${result.error}`);
			}
		} catch (error) {
			console.error('Error starting new month:', error);
			alert('Failed to start new month');
		}
	};
	
	const getFundById = (fundId: string) => {
		return funds.find(f => f.id === fundId);
	};
	
	const formatTransactionAmount = (transaction: any) => {
		const amount = (transaction.amountCents / 100).toFixed(2);
		switch (transaction.type) {
			case 'EXPENSE':
				return `-$${amount}`;
			case 'INCOME':
			case 'ALLOCATION':
				return `+$${amount}`;
			default:
				return `$${amount}`;
		}
	};
	
	const getTransactionTypeColor = (type: string) => {
		switch (type) {
			case 'EXPENSE':
				return 'text-red-600';
			case 'INCOME':
			case 'ALLOCATION':
				return 'text-green-600';
			default:
				return 'text-gray-600';
		}
	};
</script>

<svelte:head>
	<title>Dashboard - Sinking Funds Manager</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<header class="mb-8">
		<h1 class="text-3xl font-bold text-gray-900 mb-2">Sinking Funds Manager</h1>
		<p class="text-gray-600">Track your spending and build your savings with smart fund allocation</p>
	</header>

	<!-- Summary Cards -->
	<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
		<div class="bg-white rounded-lg shadow-md p-6">
			<h3 class="text-lg font-semibold text-gray-800 mb-2">Total Balance</h3>
			<p class="text-3xl font-bold text-green-600">${(totalBalance / 100).toFixed(2)}</p>
		</div>
		
		<div class="bg-white rounded-lg shadow-md p-6">
			<h3 class="text-lg font-semibold text-gray-800 mb-2">Active Funds</h3>
			<p class="text-3xl font-bold text-blue-600">{funds.length}</p>
		</div>
		
		<div class="bg-white rounded-lg shadow-md p-6">
			<h3 class="text-lg font-semibold text-gray-800 mb-2">This Month</h3>
			<p class="text-3xl font-bold text-purple-600">$0.00</p>
		</div>
	</div>

	<!-- Quick Actions -->
	<div class="mb-8">
		<h2 class="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
		<div class="flex flex-wrap gap-4">
			<button 
				on:click={handleCreateFund}
				class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors">
				Add Fund
			</button>
			<button 
				on:click={handleAddTransaction}
				class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors">
				Add Transaction
			</button>
			<button class="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md transition-colors">
				<a href="/allocations" class="text-white no-underline">Manage Allocations</a>
			</button>
			<button class="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-md transition-colors">
				<a href="/transfers" class="text-white no-underline">Transfer Between Funds</a>
			</button>
			<button 
				on:click={handleStartNewMonth}
				class="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md transition-colors">
				Start New Month
			</button>
			<button class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors">
				<a href="/periods" class="text-white no-underline">Manage Periods</a>
			</button>
		</div>
	</div>

	<!-- Placeholder for Funds List -->
	<div class="mb-8">
		<h2 class="text-xl font-semibold text-gray-800 mb-4">Your Funds</h2>
		{#if loading}
			<div class="bg-gray-50 rounded-lg p-8 text-center">
				<p class="text-gray-500">Loading funds...</p>
			</div>
		{:else if funds.length === 0}
			<div class="bg-gray-50 rounded-lg p-8 text-center">
				<p class="text-gray-500 mb-4">No funds yet. Create your first fund to get started!</p>
				<button 
					on:click={handleCreateFund}
					class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md transition-colors">
					Create Your First Fund
				</button>
			</div>
		{:else}
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{#each funds as fund}
					<div class="bg-white rounded-lg shadow-md p-6 border-l-4 hover:shadow-lg transition-shadow cursor-pointer" 
					     style="border-left-color: {fund.color}"
					     on:click={() => window.location.href = `/funds/${fund.id}`}>
						<div class="flex items-start justify-between mb-2">
							<h3 class="font-semibold text-gray-800">{fund.name}</h3>
							<span class="text-2xl">{fund.icon}</span>
						</div>
						<p class="text-2xl font-bold text-green-600 mb-2">${(fund.balance / 100).toFixed(2)}</p>
						{#if fund.targetCents > 0}
							<div class="mb-2">
								<div class="flex justify-between text-sm text-gray-600 mb-1">
									<span>Progress</span>
									<span>${(fund.targetCents / 100).toFixed(2)} goal</span>
								</div>
								<div class="w-full bg-gray-200 rounded-full h-2">
									<div 
										class="bg-blue-600 h-2 rounded-full" 
										style="width: {Math.min(100, (fund.balance / fund.targetCents) * 100)}%">
									</div>
								</div>
							</div>
						{/if}
						<p class="text-sm text-gray-600">{fund.description}</p>
						<div class="mt-2 text-xs text-gray-400">Click for details</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Recent Transactions -->
	<div>
		<h2 class="text-xl font-semibold text-gray-800 mb-4">Recent Transactions</h2>
		{#if loading}
			<div class="bg-gray-50 rounded-lg p-6 text-center">
				<p class="text-gray-500">Loading transactions...</p>
			</div>
		{:else if recentTransactions.length === 0}
			<div class="bg-gray-50 rounded-lg p-6 text-center">
				<p class="text-gray-500 mb-4">No transactions yet.</p>
				<button 
					on:click={handleAddTransaction}
					class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors">
					Add Your First Transaction
				</button>
			</div>
		{:else}
			<div class="bg-white rounded-lg shadow-md overflow-hidden">
				<table class="w-full">
					<thead class="bg-gray-50">
						<tr>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fund</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
						</tr>
					</thead>
					<tbody class="bg-white divide-y divide-gray-200">
						{#each recentTransactions as transaction}
							{@const fund = getFundById(transaction.fundId)}
							<tr>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
									{new Date(transaction.date).toLocaleDateString()}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
									{#if fund}
										{fund.icon} {fund.name}
									{:else}
										Unknown Fund
									{/if}
								</td>
								<td class="px-6 py-4 text-sm text-gray-900">
									<div>
										{#if transaction.payee}
											<span class="font-medium">{transaction.payee}</span>
										{:else}
											<span class="text-gray-500">{transaction.type}</span>
										{/if}
									</div>
									{#if transaction.note}
										<div class="text-gray-500 text-xs mt-1">{transaction.note}</div>
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
</div>
