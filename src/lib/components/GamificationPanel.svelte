<script lang="ts">
	import { onMount } from 'svelte';
	import { fly, scale } from 'svelte/transition';

	let gamificationData: any = null;
	let loading = true;
	let showBadges = false;
	let celebrationVisible = false;

	export let showCelebration = false;

	onMount(async () => {
		await loadGamificationData();

		// Show celebration if requested
		if (showCelebration) {
			setTimeout(() => {
				celebrationVisible = true;
				setTimeout(() => {
					celebrationVisible = false;
				}, 3000);
			}, 500);
		}
	});

	const loadGamificationData = async () => {
		try {
			const response = await fetch('/api/gamification');
			if (response.ok) {
				gamificationData = await response.json();
			}
		} catch (error) {
			console.error('Error loading gamification data:', error);
		} finally {
			loading = false;
		}
	};

	const getLevelBadge = (level: number) => {
		if (level === 0) return '🐣';
		if (level <= 2) return '🌱';
		if (level <= 4) return '🌿';
		if (level <= 6) return '🌳';
		if (level <= 8) return '🏆';
		return '👑';
	};

	const getLevelTitle = (level: number) => {
		if (level === 0) return 'Getting Started';
		if (level <= 2) return 'Saver';
		if (level <= 4) return 'Investor';
		if (level <= 6) return 'Achiever';
		if (level <= 8) return 'Master';
		return 'Legend';
	};
</script>

<!-- Celebration Animation -->
{#if celebrationVisible}
	<div
		class="fixed inset-0 z-50 pointer-events-none flex items-center justify-center"
		transition:scale={{ duration: 500 }}
	>
		<div
			class="bg-gradient-to-r from-yellow-400 via-pink-500 to-red-500 text-white px-8 py-4 rounded-full text-2xl font-bold shadow-2xl"
		>
			🎉 Goal Achieved! 🎉
		</div>
	</div>
{/if}

{#if loading}
	<div class="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-100">
		<div class="animate-pulse">
			<div class="h-4 bg-purple-200 rounded w-3/4 mb-2"></div>
			<div class="h-6 bg-purple-300 rounded w-1/2"></div>
		</div>
	</div>
{:else if gamificationData}
	<div
		class="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-100 shadow-lg"
	>
		<div class="flex items-center justify-between mb-4">
			<h3 class="text-lg font-semibold text-gray-800">🎮 Your Progress</h3>
			<button
				on:click={() => (showBadges = !showBadges)}
				class="text-sm bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded-full transition-colors"
			>
				{showBadges ? 'Hide' : 'Show'} Badges
			</button>
		</div>

		<!-- Overall Level -->
		<div class="mb-4" transition:fly={{ y: 20, duration: 300 }}>
			<div class="flex items-center justify-between mb-2">
				<div class="flex items-center space-x-2">
					<span class="text-2xl">{getLevelBadge(gamificationData.overall.level)}</span>
					<div>
						<div class="font-semibold text-gray-800">
							Level {gamificationData.overall.level}
							{getLevelTitle(gamificationData.overall.level)}
						</div>
						<div class="text-sm text-gray-600">
							Total: ${(gamificationData.overall.totalBalance / 100).toFixed(2)}
						</div>
					</div>
				</div>
				<div class="text-right">
					<div class="text-sm text-gray-600">Next Level</div>
					<div class="text-sm font-semibold">
						${(gamificationData.overall.nextLevelAt / 100).toFixed(2)}
					</div>
				</div>
			</div>

			<!-- Level Progress Bar -->
			<div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
				<div
					class="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-1000 ease-out"
					style="width: {gamificationData.overall.levelProgress}%"
				></div>
			</div>
			<div class="text-xs text-gray-500 mt-1 text-right">
				{gamificationData.overall.levelProgress.toFixed(1)}% to next level
			</div>
		</div>

		<!-- Stats Row -->
		<div class="grid grid-cols-3 gap-4 mb-4" transition:fly={{ y: 20, duration: 300, delay: 100 }}>
			<div class="text-center">
				<div class="text-2xl font-bold text-purple-600">
					{gamificationData.overall.currentStreak}
				</div>
				<div class="text-xs text-gray-600">Month Streak</div>
			</div>
			<div class="text-center">
				<div class="text-2xl font-bold text-blue-600">{gamificationData.badges.length}</div>
				<div class="text-xs text-gray-600">Badges Earned</div>
			</div>
			<div class="text-center">
				<div class="text-2xl font-bold text-green-600">
					{gamificationData.overall.goalsReached}/{gamificationData.overall.totalGoals}
				</div>
				<div class="text-xs text-gray-600">Goals Reached</div>
			</div>
		</div>

		<!-- Badges -->
		{#if showBadges}
			<div class="mt-4 border-t border-purple-200 pt-4" transition:fly={{ y: 20, duration: 300 }}>
				<h4 class="text-sm font-semibold text-gray-700 mb-3">🏆 Badges Earned</h4>
				{#if gamificationData.badges.length === 0}
					<div class="text-sm text-gray-500 text-center py-4">
						No badges earned yet. Keep saving to unlock achievements!
					</div>
				{:else}
					<div class="grid grid-cols-2 gap-2">
						{#each gamificationData.badges as badge, index}
							<div
								class="bg-white rounded-lg p-3 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
								transition:scale={{ delay: index * 100, duration: 300 }}
							>
								<div class="flex items-center space-x-2">
									<span class="text-2xl">{badge.emoji}</span>
									<div>
										<div class="text-sm font-semibold text-gray-800">{badge.name}</div>
										<div class="text-xs text-gray-600">{badge.description}</div>
									</div>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		{/if}

		<!-- Fund Level Indicators (Mini) -->
		{#if gamificationData.funds.length > 0}
			<div
				class="mt-4 border-t border-purple-200 pt-4"
				transition:fly={{ y: 20, duration: 300, delay: 200 }}
			>
				<h4 class="text-sm font-semibold text-gray-700 mb-2">Fund Levels</h4>
				<div class="space-y-2">
					{#each gamificationData.funds as fundData}
						<div class="flex items-center justify-between text-sm">
							<div class="flex items-center space-x-2">
								<span class="text-lg">{getLevelBadge(fundData.level)}</span>
								<span class="text-gray-700">{fundData.fundName}</span>
							</div>
							<div class="flex items-center space-x-2">
								<span class="text-gray-600">L{fundData.level}</span>
								{#if fundData.currentStreak > 0}
									<span class="text-orange-500">🔥{fundData.currentStreak}</span>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/if}
	</div>
{:else}
	<div class="bg-gray-50 rounded-2xl p-6 text-center">
		<div class="text-gray-500">Unable to load progress data</div>
	</div>
{/if}
