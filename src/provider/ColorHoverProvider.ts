import { HoverProvider, TextDocument, Position, MarkdownString, Hover } from 'vscode';
import { colorRegex, getConvertedColors } from '../utils';

export class ColorHoverProvider implements HoverProvider {
	provideHover(document: TextDocument, position: Position) {
		const range = document.getWordRangeAtPosition(
			position,
			colorRegex
		);
		if (!range) {
			return;
		}

		const colorText = document.getText(range);

		try {
			const conversions = getConvertedColors(colorText);

			const hoverText = new MarkdownString(
				conversions.map(({ format, value }) => `**${format}:** ${value}`).join('\n\n')
			);

			return new Hover(hoverText);
		} catch {
			/**
			 * TODO : Add exception handling
			 */
		}
	}
}
