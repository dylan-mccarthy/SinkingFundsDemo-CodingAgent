<script lang="ts">
	import { page } from '$app/stores';
	import { themeStore } from '$lib/stores/theme';

	const navItems = [
		{ href: '/', label: 'Dashboard', icon: '🏠' },
		{ href: '/funds/create', label: 'Funds', icon: '💰' },
		{ href: '/transactions/create', label: 'Transactions', icon: '📝' },
		{ href: '/allocations', label: 'Allocations', icon: '⚖️' },
		{ href: '/transfers', label: 'Transfers', icon: '🔄' },
		{ href: '/periods', label: 'Periods', icon: '📅' }
	];

	let mobileMenuOpen = false;

	function isActive(href: string): boolean {
		if (href === '/') {
			return $page.url.pathname === '/';
		}
		return $page.url.pathname.startsWith(href);
	}
</script>

<nav class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="flex justify-between h-16">
			<!-- Logo and Brand -->
			<div class="flex items-center">
				<div class="flex-shrink-0">
					<h1 class="text-xl font-bold text-blue-600 dark:text-blue-400">💰 Sinking Funds</h1>
				</div>
			</div>

			<!-- Desktop Navigation -->
			<div class="hidden md:flex md:items-center md:space-x-4">
				{#each navItems as item}
					<a
						href={item.href}
						class="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 {isActive(
							item.href
						)
							? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
							: 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700'}"
					>
						<span class="mr-2">{item.icon}</span>
						{item.label}
					</a>
				{/each}

				<!-- Theme Toggle -->
				<button
					on:click={themeStore.toggle}
					class="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
					title="Toggle theme"
				>
					<span class="text-lg">🌓</span>
				</button>
			</div>

			<!-- Mobile menu button -->
			<div class="md:hidden flex items-center">
				<button
					on:click={() => (mobileMenuOpen = !mobileMenuOpen)}
					class="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
				>
					<span class="sr-only">Open menu</span>
					<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d={mobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
						/>
					</svg>
				</button>
			</div>
		</div>

		<!-- Mobile menu -->
		{#if mobileMenuOpen}
			<div class="md:hidden">
				<div class="px-2 pt-2 pb-3 space-y-1">
					{#each navItems as item}
						<a
							href={item.href}
							on:click={() => (mobileMenuOpen = false)}
							class="block px-3 py-2 rounded-lg text-base font-medium transition-colors duration-200 {isActive(
								item.href
							)
								? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
								: 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700'}"
						>
							<span class="mr-2">{item.icon}</span>
							{item.label}
						</a>
					{/each}
					<button
						on:click={themeStore.toggle}
						class="w-full text-left block px-3 py-2 rounded-lg text-base font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
					>
						<span class="mr-2">🌓</span>
						Toggle Theme
					</button>
				</div>
			</div>
		{/if}
	</div>
</nav>