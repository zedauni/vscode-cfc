import { env, l10n, window } from 'vscode';
import { ViewsProvider } from '../provider/ViewsProvider';
import { Store } from '../Store';
import { colorRegex, getConvertedColor, getConvertedColors } from '../utils';
import { ColorConversionError, ExtensionConfigs } from '../constants';

export async function convertColorCommand(
	configs: ExtensionConfigs,
	store: Store,
	colorHistoryViewProvider: ViewsProvider
) {
	const editor = window.activeTextEditor;

	if (editor) {
		const selection = editor.selection;
		const selectedText = editor.document.getText(selection);

		// Text selected
		if (selectedText.length > 0) {
			const convertedColor = getConvertedColor(selectedText, {
				outputFormat: configs.defaultFormat,
				shouldThrowException: false,
			});

			// Selected text is a valid color. Just convert it.
			if (convertedColor.length != 0) {
				// Update history
				store.updateHistory(
					convertedColor
				);
				// Refresh history webview view
				colorHistoryViewProvider.refreshHistory();

				editor.edit((editBuilder) => {
					editBuilder.replace(
						selection,
						convertedColor
					);
				});

				return;
			}

			// Selected text is not a valid color. Try to parse it and convert all detected colors.
			let textHasValidColor = false;
			const convertedText = selectedText.replace(colorRegex, (color) => {
				try {
					// Try to convert each detected color
					const convertedColor = getConvertedColor(color, {
						outputFormat: configs.defaultFormat,
					});

					textHasValidColor = true;

					// Update history
					store.updateHistory(convertedColor);
					// Refresh history webview view
					colorHistoryViewProvider.refreshHistory();

					return convertedColor;
				} catch {
					// If it fails, return the original color
					return color;
				}
			});

			if (textHasValidColor) {
				editor.edit((editBuilder) => {
					editBuilder.replace(selection, convertedText);
				});
			}

			return;
		}
	}

	// No selected text. Prompt user to enter a color
	const inputColor = await window.showInputBox({
		placeHolder: l10n.t('cfc.prompt.colorInputBoxPlaceholder'),
	});

	if (!inputColor) {
		return;
	}

	try {
		const conversions = getConvertedColors(inputColor);

		// Update history
		store.updateHistory(conversions.filter(({ format }) => format === 'OKLCH')[0].value);
		// Refresh history webview view
		colorHistoryViewProvider.refreshHistory();

		// Show quick pick menu so user can choose which format to copy
		const picked = await window.showQuickPick(
			conversions.map(({ format, value }) => `${format}: ${value}`),
			{ placeHolder: l10n.t('cfc.prompt.colorFormatQuickPickPlaceholder') }
		);
		if (picked) {
			await env.clipboard.writeText(picked.split(': ')[1]);
			window.showInformationMessage(l10n.t({
				message: 'cfc.message.copiedToClipboard',
				args: [picked],
				comment: '{0} is the picked color format, ex: oklch(22.38% 0.0547 252.7)'
			}));
		}
	} catch (error) {
		if (error instanceof ColorConversionError) {
			window.showErrorMessage(error.message);
		} else {
			window.showErrorMessage(
				l10n.t({
					message: 'cfc.error.invalidColor',
					args: [inputColor],
					comment: '{0} is the invalid color',
				}));
		}
	}
}
