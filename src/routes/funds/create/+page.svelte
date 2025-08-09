<script lang="ts">
	import { goto } from '$app/navigation';
	
	let name = '';
	let description = '';
	let color = '#06b6d4';
	let icon = '💰';
	let targetAmount = '';
	let submitting = false;
	
	const iconOptions = ['💰', '🚨', '✈️', '🏠', '🚗', '🎓', '🎉', '🍕', '👕', '📱', '⚽', '🎵'];
	const colorOptions = [
		'#ef4444', '#f97316', '#eab308', '#22c55e', 
		'#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'
	];
	
	const handleSubmit = async () => {
		if (!name.trim()) {
			alert('Please enter a fund name');
			return;
		}
		
		submitting = true;
		
		try {
			const targetCents = targetAmount ? Math.round(parseFloat(targetAmount) * 100) : 0;
			
			const response = await fetch('/api/funds', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					name,
					description,
					color,
					icon,
					targetCents
				})
			});
			
			
			if (response.ok) {
				// Redirect back to dashboard
				window.location.href = '/';
			} else {
				const error = await response.json();
				alert('Error creating fund: ' + error.message);
			}
		} catch (error) {
			console.error('Error creating fund:', error);
			alert('Error creating fund');
		} finally {
			submitting = false;
		}
	};
	
	const handleCancel = () => {
		window.location.href = '/';
	};
</script>

<svelte:head>
	<title>Create Fund - Sinking Funds Manager</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<div class="max-w-2xl mx-auto">
		<header class="mb-8">
			<h1 class="text-3xl font-bold text-gray-900 mb-2">Create New Fund</h1>
			<p class="text-gray-600">Set up a new sinking fund to track your savings goals</p>
		</header>

		<div class="bg-white rounded-lg shadow-md p-6">
			<form on:submit|preventDefault={handleSubmit}>
				<!-- Fund Name -->
				<div class="mb-6">
					<label for="name" class="block text-sm font-medium text-gray-700 mb-2">
						Fund Name *
					</label>
					<input
						id="name"
						type="text"
						bind:value={name}
						placeholder="e.g., Emergency Fund, Vacation, Car Repair"
						class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						required
					/>
				</div>

				<!-- Description -->
				<div class="mb-6">
					<label for="description" class="block text-sm font-medium text-gray-700 mb-2">
						Description
					</label>
					<textarea
						id="description"
						bind:value={description}
						placeholder="Optional description of what this fund is for"
						rows="3"
						class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
					</textarea>
				</div>

				<!-- Icon Selection -->
				<div class="mb-6">
					<label class="block text-sm font-medium text-gray-700 mb-2">
						Icon
					</label>
					<div class="grid grid-cols-6 gap-2">
						{#each iconOptions as iconOption}
							<button
								type="button"
								on:click={() => icon = iconOption}
								class="p-3 text-2xl border rounded-md hover:bg-gray-50 {icon === iconOption ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}">
								{iconOption}
							</button>
						{/each}
					</div>
				</div>

				<!-- Color Selection -->
				<div class="mb-6">
					<label class="block text-sm font-medium text-gray-700 mb-2">
						Color
					</label>
					<div class="flex flex-wrap gap-2">
						{#each colorOptions as colorOption}
							<button
								type="button"
								on:click={() => color = colorOption}
								class="w-8 h-8 rounded-full border-2 {color === colorOption ? 'border-gray-800' : 'border-gray-300'}"
								style="background-color: {colorOption}">
							</button>
						{/each}
					</div>
				</div>

				<!-- Target Amount -->
				<div class="mb-6">
					<label for="target" class="block text-sm font-medium text-gray-700 mb-2">
						Target Amount (optional)
					</label>
					<div class="relative">
						<span class="absolute left-3 top-2 text-gray-500">$</span>
						<input
							id="target"
							type="number"
							bind:value={targetAmount}
							placeholder="0.00"
							step="0.01"
							min="0"
							class="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						/>
					</div>
					<p class="text-sm text-gray-500 mt-1">Set a savings goal to track your progress</p>
				</div>

				<!-- Preview -->
				<div class="mb-6">
					<label class="block text-sm font-medium text-gray-700 mb-2">
						Preview
					</label>
					<div class="bg-white border-2 border-gray-200 rounded-lg p-4 border-l-4" style="border-left-color: {color}">
						<div class="flex items-start justify-between mb-2">
							<h3 class="font-semibold text-gray-800">{name || 'Your Fund Name'}</h3>
							<span class="text-2xl">{icon}</span>
						</div>
						<p class="text-2xl font-bold text-green-600 mb-2">$0.00</p>
						{#if targetAmount}
							<div class="mb-2">
								<div class="flex justify-between text-sm text-gray-600 mb-1">
									<span>Progress</span>
									<span>${targetAmount} goal</span>
								</div>
								<div class="w-full bg-gray-200 rounded-full h-2">
									<div class="bg-blue-600 h-2 rounded-full" style="width: 0%"></div>
								</div>
							</div>
						{/if}
						<p class="text-sm text-gray-600">{description || 'Fund description will appear here'}</p>
					</div>
				</div>

				<!-- Action Buttons -->
				<div class="flex gap-4">
					<button
						type="submit"
						disabled={submitting || !name.trim()}
						class="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-md transition-colors">
						{submitting ? 'Creating...' : 'Create Fund'}
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
	</div>
</div>