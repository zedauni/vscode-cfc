import { ExtensionContext } from "vscode";

export class Store {
	public static versionKey = 'cfc.version';
	public static historyColorsKey = 'cfc.history';
	public static favoritesColorsKey = 'cfc.favorites';

	// constructor
	constructor(private context: ExtensionContext) {}

	updateHistory(color: string, oldValue?: string) {
		const history = this.context.globalState.get<string[]>(Store.historyColorsKey, []);

		if (oldValue) {
			// Update history
			const currentIndex = history.indexOf(oldValue);

			if (color === '') {
				// Treat empty color as delete
				if (currentIndex !== -1) {
					history.splice(currentIndex, 1);
				}
			} else {
				if (currentIndex === -1) {
					// Color is not in history, add it
					history.push(color);
				} else {
					// Color is in history, update it
					history[currentIndex] = color;
				}
			}
		} else {
			// Add new color
			if (color != '' && !history.includes(color)) {
				history.push(color);
			}
		}

		this.context.globalState.update(Store.historyColorsKey, [...history].slice(-100));
	}

	getHistory(): string[] {
		return this.context.globalState.get<string[]>(Store.historyColorsKey, []);
	}

	clearHistory() {
		this.context.globalState.update(Store.historyColorsKey, []);
	}

	updateFavorites(color: string, oldValue?: string) {
		const favorites = this.context.globalState.get<string[]>(Store.favoritesColorsKey, []);

		if (oldValue) {
			// Update favorites
			const currentIndex = favorites.indexOf(oldValue);

			if (color === '') {
				// Treat empty color as delete
				if (currentIndex !== -1) {
					favorites.splice(currentIndex, 1);
				}
			} else {
				if (currentIndex === -1) {
					// Color is not in favorites, add it
					favorites.push(color);
				} else {
					// Color is in favorites, update it
					favorites[currentIndex] = color;
				}
			}
		} else {
			// Add new color
			if (!favorites.includes(color)) {
				favorites.push(color);
			}
		}

		this.context.globalState.update(Store.favoritesColorsKey, [...favorites].slice(-100));
	}

	getFavorites(): string[] {
		return this.context.globalState.get<string[]>(Store.favoritesColorsKey, []);
	}

	clearFavorites() {
		this.context.globalState.update(Store.favoritesColorsKey, []);
	}

	updateShowVersionInfo(value: string) {
		this.context.globalState.update(Store.versionKey, value);
	}

	getVersionInfo(): string {
		const currentVersion = this.context.extension.packageJSON.version;
		return this.context.globalState.get<string>(Store.versionKey, currentVersion);
	}
}
