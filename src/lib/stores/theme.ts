import { writable } from 'svelte/store';
import { browser } from '$app/environment';

type Theme = 'light' | 'dark';

function createThemeStore() {
	const { subscribe, set, update } = writable<Theme>('light');

	return {
		subscribe,
		set: (theme: Theme) => {
			if (browser) {
				document.documentElement.setAttribute('data-theme', theme);
				if (theme === 'dark') {
					document.documentElement.classList.add('dark');
				} else {
					document.documentElement.classList.remove('dark');
				}
				localStorage.setItem('theme', theme);
			}
			set(theme);
		},
		toggle: () =>
			update((theme) => {
				const newTheme = theme === 'light' ? 'dark' : 'light';
				if (browser) {
					document.documentElement.setAttribute('data-theme', newTheme);
					if (newTheme === 'dark') {
						document.documentElement.classList.add('dark');
					} else {
						document.documentElement.classList.remove('dark');
					}
					localStorage.setItem('theme', newTheme);
				}
				return newTheme;
			}),
		init: () => {
			if (browser) {
				const stored = (localStorage.getItem('theme') as Theme) || 'light';
				const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
				const theme = stored || (prefersDark ? 'dark' : 'light');

				document.documentElement.setAttribute('data-theme', theme);
				if (theme === 'dark') {
					document.documentElement.classList.add('dark');
				} else {
					document.documentElement.classList.remove('dark');
				}
				set(theme);
			}
		}
	};
}

export const themeStore = createThemeStore();