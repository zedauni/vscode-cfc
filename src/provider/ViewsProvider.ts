import {
	CancellationToken,
	l10n,
	SnippetString,
	Uri,
	Webview,
	WebviewView,
	WebviewViewProvider,
	WebviewViewResolveContext,
	window,
} from 'vscode';
import { Store } from '../Store';
import { getNonce, isValidColor } from '../utils';
import { ViewType } from '../constants';

export class ViewsProvider implements WebviewViewProvider {
	public static readonly historyViewType: string = ViewType.History;
	public static readonly favoritesViewType: string = ViewType.Favorites;

	private _view?: WebviewView;

	constructor(
		private readonly extensionUri: Uri,
		private store: Store,
		private viewType: ViewType
	) {}

	public resolveWebviewView(
		webviewView: WebviewView,
		_context: WebviewViewResolveContext,
		_token: CancellationToken
	) {
		this._view = webviewView;

		webviewView.webview.options = {
			// Allow scripts in the webview
			enableScripts: true,

			localResourceRoots: [this.extensionUri],
		};

		webviewView.webview.html =
			this.viewType === ViewType.History
				? this._getHtmlForHistoryWebview(webviewView.webview)
				: this._getHtmlForFavoritesWebview(webviewView.webview);

		webviewView.webview.onDidReceiveMessage(async (data) => {
			switch (data.type) {
				case 'colorSelected': {
					window.activeTextEditor?.insertSnippet(new SnippetString(data.value));
					break;
				}
				case 'historyColorAdded': {
					this.updateHistory(data.value);
					break;
				}
				case 'favoritesColorAdded': {
					this.updateFavorites(data.value);
					break;
				}
				case 'historyColorUpdated': {
					this.updateHistory(data.value, data.oldValue);
					break;
				}
				case 'favoritesColorUpdated': {
					this.updateFavorites(data.value, data.oldValue);
					break;
				}
				case 'historyRefreshRequested': {
					this.refreshHistory();
					break;
				}
				case 'favoritesRefreshRequested': {
					this.refreshFavorites();
					break;
				}
			}
		});
	}

	public updateHistory(value: string, oldValue?: string) {
		if (
			(oldValue === null || value !== '') && // Adding color or Updating existing color and new color is empty (delete)
			!isValidColor(value) // and color is not valid
		) {
			window.showWarningMessage(
				l10n.t({
					message: 'cfc.warning.invalidColor',
					args: [value],
					comment: '{0} is the invalid color',
				})
			);
			return;
		}

		this.store.updateHistory(value, oldValue);
		if (this._view) {
			this._view.show?.(true);
			this._view.webview.postMessage({
				type: 'refreshHistory',
				value: this.store.getHistory(),
			});
		}
	}

	public updateFavorites(value: string, oldValue?: string) {
		if (
			(oldValue === null || value !== '') && // Adding color or Updating existing color and new color is empty (delete)
			!isValidColor(value) // and color is not valid
		) {
			window.showWarningMessage(
				l10n.t({
					message: 'cfc.warning.invalidColor',
					args: [value],
					comment: '{0} is the invalid color',
				})
			);
			return;
		}

		this.store.updateFavorites(value, oldValue);
		if (this._view) {
			this._view.show?.(true);
			this._view.webview.postMessage({
				type: 'refreshFavorites',
				value: this.store.getFavorites(),
			});
		}
	}

	public refreshHistory() {
		if (this._view) {
			this._view.show?.(true);
			this._view.webview.postMessage({
				type: 'refreshHistory',
				value: this.store.getHistory(),
			});
		}
	}

	public refreshFavorites() {
		if (this._view) {
			this._view.show?.(true);
			this._view.webview.postMessage({
				type: 'refreshFavorites',
				value: this.store.getFavorites(),
			});
		}
	}

	public async clearHistory() {
		const confirm = await window.showWarningMessage(
			l10n.t('cfc.prompt.clearHistoryConfirmationRequest'),
			{ modal: true },
			'Yes',
			'No'
		);

		if (confirm === 'Yes') {
			this.store.clearHistory();
		}
		this.refreshHistory();
	}

	public async clearFavorites() {
		const confirm = await window.showWarningMessage(
			l10n.t('cfc.prompt.clearFavoritesConfirmationRequest'),
			{ modal: true },
			'Yes',
			'No'
		);

		if (confirm === 'Yes') {
			this.store.clearFavorites();
		}
		this.refreshFavorites();
	}

	private _getHtmlForHistoryWebview(webview: Webview) {
		const i18nMessages = {};

		// Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
		const scriptUri = webview.asWebviewUri(
			Uri.joinPath(this.extensionUri, 'resources', 'js', 'history.js')
		);
		// Do the same for the stylesheet.
		const styleMainUri = webview.asWebviewUri(
			Uri.joinPath(this.extensionUri, 'resources', 'css', 'main.css')
		);

		// Use a nonce to only allow a specific script to be run.
		const nonce = getNonce();

		return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${
					webview.cspSource
				}; script-src 'nonce-${nonce}';">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link href="${styleMainUri}" rel="stylesheet">
				<title>${l10n.t('cfc.webview.historyWebviewViewTitle')}</title>
			</head>
			<body>
				<ul class="color-list">
				</ul>
				<script nonce="${nonce}">const i18nMessages = ${JSON.stringify(i18nMessages)};</script>
				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
	}
	private _getHtmlForFavoritesWebview(webview: Webview) {
		const i18nMessages = {
			addColor: l10n.t('cfc.webview.addColor'),
		};

		// Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
		const scriptUri = webview.asWebviewUri(
			Uri.joinPath(this.extensionUri, 'resources', 'js', 'favorites.js')
		);
		// Do the same for the stylesheet.
		const styleMainUri = webview.asWebviewUri(
			Uri.joinPath(this.extensionUri, 'resources', 'css', 'main.css')
		);

		// Use a nonce to only allow a specific script to be run.
		const nonce = getNonce();

		return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${
					webview.cspSource
				}; script-src 'nonce-${nonce}';">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link href="${styleMainUri}" rel="stylesheet">
				<title>${l10n.t('cfc.webview.favoritesWebviewViewTitle')}</title>
			</head>
			<body>
				<ul class="color-list">
				</ul>
				<form id="add-color-form">
				</form>
				<script nonce="${nonce}">const i18nMessages = ${JSON.stringify(i18nMessages)};</script>
				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
	}
}