<script lang="ts">
	import { onMount } from 'svelte';
	
	let funds: any[] = [];
	let loading = true;
	let submitting = false;
	
	// Form data
	let fundId = '';
	let type = 'EXPENSE';
	let amount = '';
	let payee = '';
	let note = '';
	let date = new Date().toISOString().split('T')[0]; // Today's date in YYYY-MM-DD format
	
	const transactionTypes = [
		{ value: 'EXPENSE', label: 'Expense', description: 'Money spent from this fund', color: 'text-red-600' },
		{ value: 'INCOME', label: 'Income', description: 'Money added to this fund', color: 'text-green-600' }
	];
	
	onMount(async () => {
		try {
			// Load available funds
			const response = await fetch('/api/funds');
			const data = await response.json();
			funds = data.funds || [];
			
			// Select first fund by default
			if (funds.length > 0) {
				fundId = funds[0].id;
			}
		} catch (error) {
			console.error('Error loading funds:', error);
		} finally {
			loading = false;
		}
	});
	
	const handleSubmit = async () => {
		if (!fundId || !amount || amount.trim() === '') {
			alert('Please select a fund and enter an amount');
			return;
		}
		
		const amountCents = Math.round(parseFloat(amount) * 100);
		if (isNaN(amountCents) || amountCents <= 0) {
			alert('Please enter a valid positive amount');
			return;
		}
		
		submitting = true;
		
		try {
			const response = await fetch('/api/transactions', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					fundId,
					type,
					amountCents,
					payee,
					note,
					date: new Date(date).toISOString()
				})
			});
			
			if (response.ok) {
				// Redirect back to dashboard
				window.location.href = '/';
			} else {
				const error = await response.json();
				alert('Error creating transaction: ' + error.message);
			}
		} catch (error) {
			console.error('Error creating transaction:', error);
			alert('Error creating transaction');
		} finally {
			submitting = false;
		}
	};
	
	const handleCancel = () => {
		window.location.href = '/';
	};
	
	$: selectedFund = funds.find(f => f.id === fundId);
	$: selectedType = transactionTypes.find(t => t.value === type);
</script>

<svelte:head>
	<title>Add Transaction - Sinking Funds Manager</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<div class="max-w-2xl mx-auto">
		<header class="mb-8">
			<h1 class="text-3xl font-bold text-gray-900 mb-2">Add Transaction</h1>
			<p class="text-gray-600">Record an income or expense for one of your funds</p>
		</header>

		{#if loading}
			<div class="bg-gray-50 rounded-lg p-8 text-center">
				<p class="text-gray-500">Loading funds...</p>
			</div>
		{:else if funds.length === 0}
			<div class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
				<p class="text-yellow-800 mb-4">You need to create at least one fund before adding transactions.</p>
				<button 
					on:click={() => window.location.href = '/funds/create'}
					class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md transition-colors">
					Create Your First Fund
				</button>
			</div>
		{:else}
			<div class="bg-white rounded-lg shadow-md p-6">
				<form on:submit|preventDefault={handleSubmit}>
					<!-- Fund Selection -->
					<div class="mb-6">
						<label for="fund" class="block text-sm font-medium text-gray-700 mb-2">
							Fund *
						</label>
						<select
							id="fund"
							bind:value={fundId}
							class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							required>
							{#each funds as fund}
								<option value={fund.id}>
									{fund.icon} {fund.name} (${(fund.balance / 100).toFixed(2)})
								</option>
							{/each}
						</select>
						{#if selectedFund}
							<p class="text-sm text-gray-500 mt-1">
								Current balance: ${(selectedFund.balance / 100).toFixed(2)}
							</p>
						{/if}
					</div>

					<!-- Transaction Type -->
					<div class="mb-6">
						<label class="block text-sm font-medium text-gray-700 mb-2">
							Transaction Type *
						</label>
						<div class="space-y-2">
							{#each transactionTypes as transactionType}
								<label class="flex items-center">
									<input
										type="radio"
										bind:group={type}
										value={transactionType.value}
										class="mr-2"
									/>
									<span class="font-medium {transactionType.color}">
										{transactionType.label}
									</span>
									<span class="text-sm text-gray-500 ml-2">
										- {transactionType.description}
									</span>
								</label>
							{/each}
						</div>
					</div>

					<!-- Amount -->
					<div class="mb-6">
						<label for="amount" class="block text-sm font-medium text-gray-700 mb-2">
							Amount *
						</label>
						<div class="relative">
							<span class="absolute left-3 top-2 text-gray-500">$</span>
							<input
								id="amount"
								type="number"
								bind:value={amount}
								placeholder="0.00"
								step="0.01"
								min="0.01"
								class="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								required
							/>
						</div>
						{#if selectedType && selectedFund && amount}
							<p class="text-sm mt-1 {selectedType.color}">
								{selectedType.value === 'EXPENSE' ? 'Will reduce' : 'Will increase'} fund balance by ${parseFloat(amount || '0').toFixed(2)}
							</p>
						{/if}
					</div>

					<!-- Date -->
					<div class="mb-6">
						<label for="date" class="block text-sm font-medium text-gray-700 mb-2">
							Date *
						</label>
						<input
							id="date"
							type="date"
							bind:value={date}
							class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							required
						/>
					</div>

					<!-- Payee -->
					<div class="mb-6">
						<label for="payee" class="block text-sm font-medium text-gray-700 mb-2">
							Payee/Source
						</label>
						<input
							id="payee"
							type="text"
							bind:value={payee}
							placeholder="e.g., Grocery Store, Salary, Gift"
							class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						/>
					</div>

					<!-- Note -->
					<div class="mb-6">
						<label for="note" class="block text-sm font-medium text-gray-700 mb-2">
							Note
						</label>
						<textarea
							id="note"
							bind:value={note}
							placeholder="Optional description or details"
							rows="3"
							class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
						</textarea>
					</div>

					<!-- Summary -->
					{#if selectedFund && selectedType && amount}
						<div class="bg-gray-50 rounded-lg p-4 mb-6">
							<h3 class="font-medium text-gray-800 mb-2">Transaction Summary</h3>
							<div class="space-y-1 text-sm">
								<p><span class="text-gray-600">Fund:</span> {selectedFund.icon} {selectedFund.name}</p>
								<p><span class="text-gray-600">Type:</span> <span class="{selectedType.color}">{selectedType.label}</span></p>
								<p><span class="text-gray-600">Amount:</span> ${parseFloat(amount || '0').toFixed(2)}</p>
								<p><span class="text-gray-600">New Balance:</span> 
									${((selectedFund.balance + (selectedType.value === 'EXPENSE' ? -1 : 1) * parseFloat(amount || '0') * 100) / 100).toFixed(2)}
								</p>
							</div>
						</div>
					{/if}

					<!-- Action Buttons -->
					<div class="flex gap-4">
						<button
							type="submit"
							disabled={submitting || !fundId || !amount}
							class="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-md transition-colors">
							{submitting ? 'Adding Transaction...' : 'Add Transaction'}
						</button>
						<button
							type="button"
							on:click={handleCancel}
							class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
							Cancel
						</button>
					</div>
				</form>
			</div>
		{/if}
	</div>
</div>