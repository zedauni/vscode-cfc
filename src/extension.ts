import { convertColorCommand } from './command/convertColorCommand';
import { ViewsProvider } from './provider/ViewsProvider';
import { Store } from './Store';
import { Configs } from './ExtensionConfigs';
import { ColorHoverProvider } from './provider/ColorHoverProvider';
import { updateColorDecorations } from './utils';
import {
	commands,
	ExtensionContext,
	languages,
	TextEditor,
	window,
	workspace,
} from 'vscode';
import { supportedLanguages, ViewType } from './constants';

let timeout: NodeJS.Timeout | number | undefined = undefined;
let activeEditor = window.activeTextEditor;

export function activate(context: ExtensionContext) {
	context.globalState.setKeysForSync([
		Store.versionKey,
		Store.historyColorsKey,
		Store.favoritesColorsKey,
	]);

	const configs = new Configs(context).get();
	const store = new Store(context);

	const colorHistoryViewProvider = new ViewsProvider(
		context.extensionUri,
		store,
		ViewType.History
	);
	const colorFavoritesViewProvider = new ViewsProvider(
		context.extensionUri,
		store,
		ViewType.Favorites
	);

	if (configs.showModernColorPreview) {
		if (activeEditor) {
			triggerUpdateDecorations(false, activeEditor);
		}

		window.onDidChangeActiveTextEditor(
			(editor) => {
				activeEditor = editor;
				if (editor) {
					triggerUpdateDecorations(false, editor);
				}
			},
			null,
			context.subscriptions
		);

		workspace.onDidChangeTextDocument(
			(event) => {
				if (activeEditor && event.document === activeEditor.document) {
					triggerUpdateDecorations(true, activeEditor);
				}
			},
			null,
			context.subscriptions
		);
	}

	context.subscriptions.push(
		commands.registerCommand('cfc.convertColor', () =>
			convertColorCommand(configs, store, colorHistoryViewProvider)
		)
	);

	context.subscriptions.push(
		commands.registerCommand('cfc.addColorToHistory', (value) => {
			colorHistoryViewProvider.updateHistory(value);
		})
	);

	context.subscriptions.push(
		commands.registerCommand('cfc.addColorToFavorites', (value) => {
			colorHistoryViewProvider.updateFavorites(value);
		})
	);

	context.subscriptions.push(
		commands.registerCommand('cfc.clearHistory', () => {
			colorHistoryViewProvider.clearHistory();
		})
	);

	context.subscriptions.push(
		commands.registerCommand('cfc.clearFavorites', () => {
			colorHistoryViewProvider.clearFavorites();
		})
	);

	context.subscriptions.push(
		commands.registerCommand('cfc.refreshHistory', () => {
			colorHistoryViewProvider.refreshHistory();
		})
	);

	context.subscriptions.push(
		commands.registerCommand('cfc.refreshFavorites', () => {
			colorHistoryViewProvider.refreshFavorites();
		})
	);

	context.subscriptions.push(
		languages.registerHoverProvider(supportedLanguages, new ColorHoverProvider())
	);

	context.subscriptions.push(
		window.registerWebviewViewProvider(
			ViewsProvider.historyViewType,
			colorHistoryViewProvider
		)
	);

	context.subscriptions.push(
		window.registerWebviewViewProvider(
			ViewsProvider.favoritesViewType,
			colorFavoritesViewProvider
		)
	);
}

export function deactivate() {}

function triggerUpdateDecorations(throttle = false, editor: TextEditor) {
	if (!supportedLanguages.includes(editor.document.languageId)) {
		return;
	}

	if (timeout) {
		clearTimeout(timeout);
		timeout = undefined;
	}
	if (throttle) {
		timeout = setTimeout(() => updateColorDecorations(editor), 500);
	} else {
		updateColorDecorations(editor);
	}
}

export function helloTest() {
	window.showInformationMessage('Hello Test');
}
