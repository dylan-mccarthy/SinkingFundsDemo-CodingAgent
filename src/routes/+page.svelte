<script lang="ts">
	// Dashboard page for Sinking Funds Manager
	import { onMount } from 'svelte';
	import GamificationPanel from '$lib/components/GamificationPanel.svelte';

	let funds: any[] = [];
	let totalBalance = 0;
	let recentTransactions: any[] = [];
	let loading = true;
	let showCelebration = false;

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

		const autoAllocate =
			depositCents > 0 &&
			confirm('Automatically allocate this deposit according to your allocation rules?');

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
		return funds.find((f) => f.id === fundId);
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

<div class="container mx-auto px-4 py-8 max-w-7xl">
	<header class="mb-8">
		<h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
			Sinking Funds Manager
		</h1>
		<p class="text-gray-600 dark:text-gray-400">
			Track your spending and build your savings with smart fund allocation
		</p>
	</header>

	<!-- Summary Cards -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
		<div
			class="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-2xl shadow-lg p-6 border border-green-200 dark:border-green-700/50 hover:shadow-xl transition-all duration-300"
		>
			<div class="flex items-center justify-between mb-3">
				<h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200">Total Balance</h3>
				<span class="text-2xl">💰</span>
			</div>
			<p class="text-3xl font-bold text-green-600 dark:text-green-400">
				${(totalBalance / 100).toFixed(2)}
			</p>
		</div>

		<div
			class="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl shadow-lg p-6 border border-blue-200 dark:border-blue-700/50 hover:shadow-xl transition-all duration-300"
		>
			<div class="flex items-center justify-between mb-3">
				<h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200">Active Funds</h3>
				<span class="text-2xl">📊</span>
			</div>
			<p class="text-3xl font-bold text-blue-600 dark:text-blue-400">{funds.length}</p>
		</div>

		<div
			class="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-2xl shadow-lg p-6 border border-purple-200 dark:border-purple-700/50 hover:shadow-xl transition-all duration-300"
		>
			<div class="flex items-center justify-between mb-3">
				<h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200">This Month</h3>
				<span class="text-2xl">📅</span>
			</div>
			<p class="text-3xl font-bold text-purple-600 dark:text-purple-400">$0.00</p>
		</div>

		<!-- Gamification Panel -->
		<div class="md:col-span-1">
			<GamificationPanel {showCelebration} />
		</div>
	</div>

	<!-- Quick Actions -->
	<div class="mb-8">
		<h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Quick Actions</h2>
		<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
			<button
				on:click={handleCreateFund}
				class="group relative bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 dark:from-blue-600 dark:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800 text-white px-6 py-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800"
			>
				<div class="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200">💰</div>
				<div class="text-sm font-semibold">Add Fund</div>
			</button>
			<button
				on:click={handleAddTransaction}
				class="group relative bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 dark:from-green-600 dark:to-green-700 dark:hover:from-green-700 dark:hover:to-green-800 text-white px-6 py-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-green-300 dark:focus:ring-green-800"
			>
				<div class="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200">📝</div>
				<div class="text-sm font-semibold">Add Transaction</div>
			</button>
			<button
				class="group relative bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 dark:from-purple-600 dark:to-purple-700 dark:hover:from-purple-700 dark:hover:to-purple-800 text-white px-6 py-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-purple-300 dark:focus:ring-purple-800"
			>
				<a href="/allocations" class="text-white no-underline">
					<div class="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200">
						⚖️
					</div>
					<div class="text-sm font-semibold">Manage Allocations</div>
				</a>
			</button>
			<button
				class="group relative bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 dark:from-indigo-600 dark:to-indigo-700 dark:hover:from-indigo-700 dark:hover:to-indigo-800 text-white px-6 py-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-indigo-300 dark:focus:ring-indigo-800"
			>
				<a href="/transfers" class="text-white no-underline">
					<div class="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200">🔄</div>
					<div class="text-sm font-semibold">Transfer Funds</div>
				</a>
			</button>
			<button
				on:click={handleStartNewMonth}
				class="group relative bg-gradient-to-br from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 dark:from-yellow-600 dark:to-yellow-700 dark:hover:from-yellow-700 dark:hover:to-yellow-800 text-white px-6 py-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-yellow-300 dark:focus:ring-yellow-800"
			>
				<div class="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200">📅</div>
				<div class="text-sm font-semibold">Start New Month</div>
			</button>
			<button
				class="group relative bg-gradient-to-br from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 dark:from-gray-700 dark:to-gray-800 dark:hover:from-gray-800 dark:hover:to-gray-900 text-white px-6 py-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
			>
				<a href="/periods" class="text-white no-underline">
					<div class="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200">⏰</div>
					<div class="text-sm font-semibold">Manage Periods</div>
				</a>
			</button>
		</div>
	</div>

	<!-- Your Funds -->
	<div class="mb-8">
		<h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Your Funds</h2>
		{#if loading}
			<div
				class="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 text-center border border-gray-200 dark:border-gray-700"
			>
				<p class="text-gray-500 dark:text-gray-400">Loading funds...</p>
			</div>
		{:else if funds.length === 0}
			<div
				class="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 text-center border border-gray-200 dark:border-gray-700"
			>
				<p class="text-gray-500 dark:text-gray-400 mb-4">
					No funds yet. Create your first fund to get started!
				</p>
				<button
					on:click={handleCreateFund}
					class="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-800"
				>
					Create Your First Fund
				</button>
			</div>
		{:else}
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{#each funds as fund}
					<a
						href="/funds/{fund.id}"
						class="group block bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-800"
						style="border-left: 4px solid {fund.color}"
					>
						<div class="flex items-start justify-between mb-4">
							<div class="flex items-center space-x-3">
								<span class="text-3xl group-hover:scale-110 transition-transform duration-200">
									{fund.icon}
								</span>
								<div>
									<h3 class="font-bold text-gray-800 dark:text-gray-200 text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
										{fund.name}
									</h3>
									<div class="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
										<span>Level {Math.max(1, Math.floor(fund.balance / 50000))}</span>
										<span>•</span>
										<span>Click for details</span>
									</div>
								</div>
							</div>
						</div>

						<div class="mb-4">
							<p class="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
								${(fund.balance / 100).toFixed(2)}
							</p>
							{#if fund.targetCents > 0}
								<div class="mb-3">
									<div class="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
										<span>Progress to Goal</span>
										<span>${(fund.targetCents / 100).toFixed(2)}</span>
									</div>
									<div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
										<div
											class="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
											style="width: {Math.min(100, (fund.balance / fund.targetCents) * 100)}%"
										></div>
									</div>
									<div class="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
										{Math.min(100, (fund.balance / fund.targetCents) * 100).toFixed(1)}%
									</div>
								</div>
							{/if}
							<p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
								{fund.description}
							</p>
						</div>

						<!-- Fund Level Indicator -->
						<div
							class="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700"
						>
							<div class="flex items-center space-x-2">
								<span class="text-lg">
									{#if fund.balance >= 500000}
										🏆
									{:else if fund.balance >= 250000}
										🌳
									{:else if fund.balance >= 100000}
										🌿
									{:else}
										🌱
									{/if}
								</span>
								<span class="text-xs text-gray-500 dark:text-gray-400">
									Level {Math.max(1, Math.floor(fund.balance / 50000))}
								</span>
							</div>
							{#if fund.balance >= fund.targetCents && fund.targetCents > 0}
								<span class="text-lg animate-pulse">🎉</span>
							{/if}
						</div>
					</a>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Recent Transactions -->
	<div>
		<h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Recent Transactions</h2>
		{#if loading}
			<div class="bg-gray-50 rounded-lg p-6 text-center">
				<p class="text-gray-500">Loading transactions...</p>
			</div>
		{:else if recentTransactions.length === 0}
			<div class="bg-gray-50 rounded-lg p-6 text-center">
				<p class="text-gray-500 mb-4">No transactions yet.</p>
				<button
					on:click={handleAddTransaction}
					class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors"
				>
					Add Your First Transaction
				</button>
			</div>
		{:else}
			<div class="bg-white rounded-2xl shadow-lg overflow-hidden">
				<table class="w-full">
					<thead class="bg-gradient-to-r from-gray-50 to-gray-100">
						<tr>
							<th
								class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
								>Date</th
							>
							<th
								class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
								>Fund</th
							>
							<th
								class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
								>Description</th
							>
							<th
								class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
								>Amount</th
							>
						</tr>
					</thead>
					<tbody class="bg-white divide-y divide-gray-100">
						{#each recentTransactions as transaction, index}
							{@const fund = getFundById(transaction.fundId)}
							<tr
								class="hover:bg-gray-50 transition-colors duration-200"
								style="animation-delay: {index * 100}ms;"
							>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
									{new Date(transaction.date).toLocaleDateString()}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
									{#if fund}
										<div class="flex items-center space-x-2">
											<span class="text-lg">{fund.icon}</span>
											<span class="font-medium">{fund.name}</span>
										</div>
									{:else}
										<span class="text-gray-500">Unknown Fund</span>
									{/if}
								</td>
								<td class="px-6 py-4 text-sm text-gray-900">
									<div>
										{#if transaction.payee}
											<span class="font-medium text-gray-900">{transaction.payee}</span>
										{:else}
											<span class="text-gray-500 capitalize"
												>{transaction.type.toLowerCase().replace('_', ' ')}</span
											>
										{/if}
									</div>
									{#if transaction.note}
										<div class="text-gray-500 text-xs mt-1 leading-relaxed">{transaction.note}</div>
									{/if}
								</td>
								<td
									class="px-6 py-4 whitespace-nowrap text-sm font-bold {getTransactionTypeColor(
										transaction.type
									)}"
								>
									<div class="flex items-center space-x-1">
										<span>{formatTransactionAmount(transaction)}</span>
										{#if transaction.type === 'TRANSFER_IN' || transaction.type === 'ALLOCATION'}
											<span class="text-green-500">↗️</span>
										{:else if transaction.type === 'TRANSFER_OUT' || transaction.type === 'EXPENSE'}
											<span class="text-red-500">↘️</span>
										{/if}
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
</div>
