<script lang="ts">
	import { onMount } from 'svelte';

	let funds: any[] = [];
	let allocationRules: any[] = [];
	let preview: any = null;
	let depositAmount = '';
	let loading = true;
	let saving = false;

	onMount(async () => {
		try {
			// Load funds and allocation rules
			const [fundsResponse, rulesResponse] = await Promise.all([
				fetch('/api/funds'),
				fetch('/api/allocation-rules?active=true')
			]);

			const fundsData = await fundsResponse.json();
			const rulesData = await rulesResponse.json();

			funds = fundsData.funds || [];
			allocationRules = rulesData.rules || [];

			// Initialize rules for funds that don't have them
			for (const fund of funds) {
				if (!allocationRules.find((r) => r.fundId === fund.id)) {
					allocationRules.push({
						id: `temp-${fund.id}`,
						fundId: fund.id,
						mode: 'percent',
						percentBp: 0,
						fixedCents: null,
						priority: allocationRules.length + 1,
						active: true,
						isNew: true
					});
				}
			}

			// Set default deposit amount to $1000 for preview
			depositAmount = '1000';
			await updatePreview();
		} catch (error) {
			console.error('Error loading data:', error);
		} finally {
			loading = false;
		}
	});

	const updatePreview = async () => {
		if (!depositAmount || parseFloat(depositAmount) <= 0) {
			preview = null;
			return;
		}

		try {
			const response = await fetch('/api/allocations', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					depositCents: Math.round(parseFloat(depositAmount) * 100),
					preview: true
				})
			});

			if (response.ok) {
				preview = await response.json();
			}
		} catch (error) {
			console.error('Error updating preview:', error);
		}
	};

	const saveRules = async () => {
		saving = true;
		try {
			// Save each rule
			for (const rule of allocationRules) {
				if (rule.isNew && rule.percentBp > 0) {
					// Create new rule
					delete rule.isNew;
					delete rule.id; // Remove temp ID
					await fetch('/api/allocation-rules', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify(rule)
					});
				} else if (!rule.isNew) {
					// Update existing rule
					await fetch('/api/allocation-rules', {
						method: 'PUT',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify(rule)
					});
				}
			}

			// Refresh the page to reload rules
			window.location.reload();
		} catch (error) {
			console.error('Error saving rules:', error);
			alert('Failed to save allocation rules');
		} finally {
			saving = false;
		}
	};

	const executeAllocation = async () => {
		if (!depositAmount || parseFloat(depositAmount) <= 0) {
			alert('Please enter a valid deposit amount');
			return;
		}

		const confirmed = confirm(
			`Execute allocation of $${depositAmount}? This will add funds to your accounts.`
		);
		if (!confirmed) return;

		try {
			const response = await fetch('/api/allocations', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					depositCents: Math.round(parseFloat(depositAmount) * 100),
					preview: false
				})
			});

			if (response.ok) {
				alert('Allocation executed successfully!');
				window.location.href = '/'; // Return to dashboard
			} else {
				const error = await response.json();
				alert(`Failed to execute allocation: ${error.error}`);
			}
		} catch (error) {
			console.error('Error executing allocation:', error);
			alert('Failed to execute allocation');
		}
	};

	const updateRuleValue = (ruleIndex: number, field: string, value: any) => {
		allocationRules[ruleIndex][field] = value;
		allocationRules = [...allocationRules]; // Trigger reactivity
		updatePreview();
	};

	const getFundName = (fundId: string) => {
		const fund = funds.find((f) => f.id === fundId);
		return fund ? fund.name : 'Unknown Fund';
	};

	const getFundIcon = (fundId: string) => {
		const fund = funds.find((f) => f.id === fundId);
		return fund ? fund.icon : '💰';
	};

	$: {
		if (depositAmount) {
			updatePreview();
		}
	}
</script>

<svelte:head>
	<title>Allocation Rules - Sinking Funds Manager</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<header class="mb-8">
		<h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Allocation Rules</h1>
		<p class="text-gray-600 dark:text-gray-300">Configure how your monthly deposits are allocated to funds</p>
	</header>

	{#if loading}
		<div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
			<p class="text-gray-500 dark:text-gray-400">Loading allocation rules...</p>
		</div>
	{:else}
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
			<!-- Rules Editor -->
			<div class="space-y-6">
				<div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
					<h2 class="text-xl font-semibold text-gray-800 dark:text-white mb-4">Fund Allocation Rules</h2>

					<div class="space-y-4">
						{#each allocationRules as rule, index}
							{@const fund = funds.find((f) => f.id === rule.fundId)}
							{#if fund}
								<div class="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
									<div class="flex items-center justify-between mb-3">
										<div class="flex items-center space-x-2">
											<span class="text-2xl">{fund.icon}</span>
											<h3 class="font-medium text-gray-800 dark:text-white">{fund.name}</h3>
										</div>
										<label class="flex items-center">
											<input
												type="checkbox"
												bind:checked={rule.active}
												on:change={() => updateRuleValue(index, 'active', rule.active)}
												class="mr-2"
											/>
											<span class="text-sm text-gray-600 dark:text-gray-300">Active</span>
										</label>
									</div>

									<div class="grid grid-cols-2 gap-4">
										<div>
											<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mode</label>
											<select
												bind:value={rule.mode}
												on:change={() => updateRuleValue(index, 'mode', rule.mode)}
												class="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
											>
												<option value="percent">Percentage</option>
												<option value="fixed">Fixed Amount</option>
												<option value="priority">Priority</option>
											</select>
										</div>

										{#if rule.mode === 'percent'}
											<div>
												<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
													>Percentage</label
												>
												<div class="flex items-center">
													<input
														type="number"
														min="0"
														max="100"
														step="0.1"
														value={rule.percentBp ? rule.percentBp / 100 : 0}
														on:input={(e) =>
															updateRuleValue(
																index,
																'percentBp',
																parseFloat(e.target.value) * 100 || 0
															)}
														class="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
													/>
													<span class="ml-2 text-gray-500 dark:text-gray-400">%</span>
												</div>
											</div>
										{:else if rule.mode === 'fixed'}
											<div>
												<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount</label>
												<div class="flex items-center">
													<span class="text-gray-500 dark:text-gray-400 mr-1">$</span>
													<input
														type="number"
														min="0"
														step="0.01"
														value={rule.fixedCents ? rule.fixedCents / 100 : 0}
														on:input={(e) =>
															updateRuleValue(
																index,
																'fixedCents',
																Math.round(parseFloat(e.target.value) * 100) || 0
															)}
														class="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
													/>
												</div>
											</div>
										{:else if rule.mode === 'priority'}
											<div>
												<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
												<input
													type="number"
													min="1"
													bind:value={rule.priority}
													on:change={() => updateRuleValue(index, 'priority', rule.priority)}
													class="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
												/>
											</div>
										{/if}
									</div>
								</div>
							{/if}
						{/each}
					</div>

					<div class="mt-6 flex space-x-4">
						<button
							on:click={saveRules}
							disabled={saving}
							class="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-6 py-2 rounded-md transition-colors"
						>
							{saving ? 'Saving...' : 'Save Rules'}
						</button>
					</div>
				</div>
			</div>

			<!-- Preview Panel -->
			<div class="space-y-6">
				<div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
					<h2 class="text-xl font-semibold text-gray-800 dark:text-white mb-4">Allocation Preview</h2>

					<div class="mb-4">
						<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Deposit Amount</label>
						<div class="flex items-center">
							<span class="text-gray-500 dark:text-gray-400 mr-2">$</span>
							<input
								type="number"
								min="0"
								step="0.01"
								bind:value={depositAmount}
								class="flex-1 rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
								placeholder="1000.00"
							/>
						</div>
					</div>

					{#if preview}
						<div class="space-y-3">
							<div class="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4">
								<div class="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Deposit</div>
								<div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
									${(preview.depositCents / 100).toFixed(2)}
								</div>
							</div>

							{#each preview.allocations as allocation}
								<div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
									<div class="flex items-center space-x-2">
										<span class="text-xl">{getFundIcon(allocation.fundId)}</span>
										<span class="font-medium text-gray-800 dark:text-white">{allocation.fundName}</span>
										<span class="text-xs bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded text-gray-600 dark:text-gray-300">
											{allocation.mode}
											{#if allocation.percentBp}
												({(allocation.percentBp / 100).toFixed(1)}%)
											{/if}
										</span>
									</div>
									<div class="font-semibold text-green-600 dark:text-green-400">
										${(allocation.amountCents / 100).toFixed(2)}
									</div>
								</div>
							{/each}

							<div class="border-t border-gray-200 dark:border-gray-600 pt-3 mt-4">
								<div class="flex justify-between text-sm">
									<span class="text-gray-700 dark:text-gray-300">Total Allocated:</span>
									<span class="font-semibold text-gray-900 dark:text-white">${(preview.totalAllocated / 100).toFixed(2)}</span>
								</div>
								{#if preview.remainingAmount > 0}
									<div class="flex justify-between text-sm text-orange-600 dark:text-orange-400">
										<span>Remaining:</span>
										<span class="font-semibold">${(preview.remainingAmount / 100).toFixed(2)}</span>
									</div>
								{/if}
							</div>
						</div>

						<div class="mt-6">
							<button
								on:click={executeAllocation}
								class="w-full bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-md transition-colors font-semibold"
							>
								Execute Allocation
							</button>
						</div>
					{:else}
						<div class="text-center text-gray-500 dark:text-gray-400 py-8">Enter a deposit amount to see preview</div>
					{/if}
				</div>
			</div>
		</div>
	{/if}
</div>
