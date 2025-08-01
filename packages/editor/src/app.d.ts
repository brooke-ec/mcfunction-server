// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	interface Promise<T> {
		/**
		 * Displays a toast on rejection of the Promise
		 * @returns A Promise resolving to `void` if rejected
		 */
		catchToast(): Promise<T | never>;
	}
}

export {};
