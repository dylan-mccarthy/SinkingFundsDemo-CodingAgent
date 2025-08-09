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
			const response = await fetch('/api/funds');
			const data = await response.json();
			funds = data.funds || [];
			
			// Calculate total balance
			totalBalance = funds.reduce((sum, fund) => sum + fund.balance, 0);
		} catch (error) {
			console.error('Error loading funds:', error);
		} finally {
			loading = false;
		}
	});
	
	const handleCreateFund = () => {
		// Navigate to fund creation page
		window.location.href = '/funds/create';
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
			<button class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors">
				Add Transaction
			</button>
			<button class="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md transition-colors">
				Transfer Between Funds
			</button>
			<button class="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md transition-colors">
				Start New Month
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
					<div class="bg-white rounded-lg shadow-md p-6 border-l-4" style="border-left-color: {fund.color}">
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
					</div>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Recent Transactions -->
	<div>
		<h2 class="text-xl font-semibold text-gray-800 mb-4">Recent Transactions</h2>
		{#if recentTransactions.length === 0}
			<div class="bg-gray-50 rounded-lg p-6 text-center">
				<p class="text-gray-500">No transactions yet.</p>
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
							<tr>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
									{new Date(transaction.date).toLocaleDateString()}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.fund}</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.description}</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
									${(transaction.amount / 100).toFixed(2)}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
</div>
