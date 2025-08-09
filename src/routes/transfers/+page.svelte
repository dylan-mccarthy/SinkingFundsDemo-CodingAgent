<script lang="ts">
	import { onMount } from 'svelte';
	
	let funds: any[] = [];
	let fromFundId = '';
	let toFundId = '';
	let amount = '';
	let note = '';
	let loading = true;
	let submitting = false;
	let errors: { [key: string]: string } = {};
	
	onMount(async () => {
		try {
			const response = await fetch('/api/funds');
			const data = await response.json();
			funds = data.funds || [];
			
			// Set default selections if we have funds
			if (funds.length >= 2) {
				fromFundId = funds[0].id;
				toFundId = funds[1].id;
			}
		} catch (error) {
			console.error('Error loading funds:', error);
		} finally {
			loading = false;
		}
	});
	
	const validateForm = () => {
		errors = {};
		
		if (!fromFundId) {
			errors.fromFundId = 'Please select a source fund';
		}
		
		if (!toFundId) {
			errors.toFundId = 'Please select a destination fund';
		}
		
		if (fromFundId === toFundId) {
			errors.toFundId = 'Cannot transfer to the same fund';
		}
		
		if (!amount || parseFloat(amount) <= 0) {
			errors.amount = 'Please enter a valid amount';
		}
		
		// Check if source fund has sufficient balance
		const fromFund = funds.find(f => f.id === fromFundId);
		if (fromFund && amount) {
			const amountCents = Math.round(parseFloat(amount) * 100);
			if (fromFund.balance < amountCents) {
				errors.amount = `Insufficient funds. Available: $${(fromFund.balance / 100).toFixed(2)}`;
			}
		}
		
		return Object.keys(errors).length === 0;
	};
	
	const handleTransfer = async () => {
		if (!validateForm()) {
			return;
		}
		
		submitting = true;
		
		try {
			const response = await fetch('/api/transfers', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					fromFundId,
					toFundId,
					amountCents: Math.round(parseFloat(amount) * 100),
					note
				})
			});
			
			const result = await response.json();
			
			if (response.ok) {
				alert(result.message);
				// Reset form
				fromFundId = funds.length >= 2 ? funds[0].id : '';
				toFundId = funds.length >= 2 ? funds[1].id : '';
				amount = '';
				note = '';
				errors = {};
				// Refresh fund data to show updated balances
				window.location.href = '/';
			} else {
				alert(`Transfer failed: ${result.error}`);
			}
		} catch (error) {
			console.error('Error executing transfer:', error);
			alert('Failed to execute transfer');
		} finally {
			submitting = false;
		}
	};
	
	const getFund = (fundId: string) => {
		return funds.find(f => f.id === fundId);
	};
	
	const getAvailableFunds = (excludeId?: string) => {
		return funds.filter(f => f.id !== excludeId);
	};
	
	$: fromFund = getFund(fromFundId);
	$: toFund = getFund(toFundId);
</script>

<svelte:head>
	<title>Transfer Funds - Sinking Funds Manager</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<header class="mb-8">
		<h1 class="text-3xl font-bold text-gray-900 mb-2">Transfer Between Funds</h1>
		<p class="text-gray-600">Move money between your sinking funds</p>
	</header>

	{#if loading}
		<div class="bg-gray-50 rounded-lg p-8 text-center">
			<p class="text-gray-500">Loading funds...</p>
		</div>
	{:else if funds.length < 2}
		<div class="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
			<h3 class="text-lg font-semibold text-yellow-800 mb-2">Not enough funds</h3>
			<p class="text-yellow-700 mb-4">You need at least 2 funds to make transfers.</p>
			<a href="/funds/create" class="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md transition-colors">
				Create Another Fund
			</a>
		</div>
	{:else}
		<div class="max-w-2xl mx-auto">
			<div class="bg-white rounded-lg shadow-md p-8">
				<form on:submit|preventDefault={handleTransfer} class="space-y-6">
					<!-- Source Fund -->
					<div>
						<label for="fromFund" class="block text-sm font-medium text-gray-700 mb-2">
							From Fund
						</label>
						<select 
							id="fromFund"
							bind:value={fromFundId}
							on:change={() => errors.fromFundId = ''}
							class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
							class:border-red-500={errors.fromFundId}
						>
							<option value="">Select source fund</option>
							{#each funds as fund}
								<option value={fund.id}>
									{fund.icon} {fund.name} - ${(fund.balance / 100).toFixed(2)}
								</option>
							{/each}
						</select>
						{#if errors.fromFundId}
							<p class="mt-1 text-sm text-red-600">{errors.fromFundId}</p>
						{/if}
						{#if fromFund}
							<p class="mt-2 text-sm text-gray-500">
								Available balance: ${(fromFund.balance / 100).toFixed(2)}
							</p>
						{/if}
					</div>

					<!-- Destination Fund -->
					<div>
						<label for="toFund" class="block text-sm font-medium text-gray-700 mb-2">
							To Fund
						</label>
						<select 
							id="toFund"
							bind:value={toFundId}
							on:change={() => errors.toFundId = ''}
							class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
							class:border-red-500={errors.toFundId}
						>
							<option value="">Select destination fund</option>
							{#each getAvailableFunds(fromFundId) as fund}
								<option value={fund.id}>
									{fund.icon} {fund.name} - ${(fund.balance / 100).toFixed(2)}
								</option>
							{/each}
						</select>
						{#if errors.toFundId}
							<p class="mt-1 text-sm text-red-600">{errors.toFundId}</p>
						{/if}
						{#if toFund}
							<p class="mt-2 text-sm text-gray-500">
								Current balance: ${(toFund.balance / 100).toFixed(2)}
							</p>
						{/if}
					</div>

					<!-- Transfer Amount -->
					<div>
						<label for="amount" class="block text-sm font-medium text-gray-700 mb-2">
							Transfer Amount
						</label>
						<div class="relative">
							<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
								<span class="text-gray-500">$</span>
							</div>
							<input 
								type="number" 
								id="amount"
								step="0.01"
								min="0.01"
								bind:value={amount}
								on:input={() => errors.amount = ''}
								placeholder="0.00"
								class="w-full pl-8 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
								class:border-red-500={errors.amount}
							>
						</div>
						{#if errors.amount}
							<p class="mt-1 text-sm text-red-600">{errors.amount}</p>
						{/if}
					</div>

					<!-- Note (Optional) -->
					<div>
						<label for="note" class="block text-sm font-medium text-gray-700 mb-2">
							Note (Optional)
						</label>
						<textarea 
							id="note"
							bind:value={note}
							rows="3"
							placeholder="Add a note about this transfer..."
							class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
						></textarea>
					</div>

					<!-- Transfer Preview -->
					{#if fromFund && toFund && amount && parseFloat(amount) > 0}
						<div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
							<h3 class="font-medium text-blue-900 mb-2">Transfer Preview</h3>
							<div class="space-y-2 text-sm">
								<div class="flex justify-between">
									<span>{fromFund.icon} {fromFund.name} (after transfer):</span>
									<span class="font-mono">
										${((fromFund.balance - parseFloat(amount) * 100) / 100).toFixed(2)}
									</span>
								</div>
								<div class="flex justify-between">
									<span>{toFund.icon} {toFund.name} (after transfer):</span>
									<span class="font-mono">
										${((toFund.balance + parseFloat(amount) * 100) / 100).toFixed(2)}
									</span>
								</div>
							</div>
						</div>
					{/if}

					<!-- Action Buttons -->
					<div class="flex space-x-4">
						<button 
							type="submit"
							disabled={submitting}
							class="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white py-2 px-4 rounded-md transition-colors font-semibold"
						>
							{submitting ? 'Processing...' : 'Execute Transfer'}
						</button>
						<button 
							type="button"
							on:click={() => window.history.back()}
							class="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-md transition-colors"
						>
							Cancel
						</button>
					</div>
				</form>
			</div>
		</div>
	{/if}
</div>