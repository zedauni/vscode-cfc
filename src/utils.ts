import Color from 'colorjs.io';
import {
	DecorationOptions,
	l10n,
	TextEditor,
	window,
	Range,
	TextEditorDecorationType,
} from 'vscode';
import { AllowedOutputFormats, ColorConversionError, ConvertedColors } from './constants';

let decorationType: TextEditorDecorationType | null = null;

// Convert a string to AllowedOutputFormats
export function toAllowedOutputFormat(formatString: string): AllowedOutputFormats | null {
	if (Object.values(AllowedOutputFormats).includes(formatString as AllowedOutputFormats)) {
		return formatString as AllowedOutputFormats;
	}
	return null;
}

// Interface for color conversion options
export interface ConvertColorFormatsOptions {
	outputFormat?: AllowedOutputFormats;
	precision?: number;
	alpha?: boolean;
	shouldThrowException?: boolean;
}

/**
 * Regex to detect CSS color values in various formats:
 *
 * Hexadecimal:
 *    - 3 digits: #RGB (e.g., #eee)
 *    - 4 digits: #RGBA (e.g., #eee9)
 *    - 6 digits: #RRGGBB (e.g.,#eeeeee)
 *    - 8 digits: #RRGGBBAA (e.g.,#eeeeee59)
 *
 * Functional notations:
 *    - RGB: rgb(R, G, B) (e.g., rgb(238, 238, 238), rgb(93.33% 93.33% 93.33%))
 *    - RGBA: rgba(R, G, B, A) (e.g., rgba(238, 238, 238, 0.349), rgba(93.33%, 93.33%, 93.33%, 0.349))
 *    - HSL: hsl(H, S%, L%) (e.g., hsl(0, 0%, 93%), hsl(none, 0%, 92.94%))
 *    - HSLA: hsla(H, S%, L%, A) (e.g., hsla(0, 0%, 93%, 0.349), hsla(none, 0%, 92.94%, 0.349))
 *    - HWB: hwb(H, W%, B%) (e.g., hwb(0 93% 7%))
 *    - LAB: lab(L, A, B) (e.g., lab(93.75 0 0), lab(93.75 0 0 / 0.349))
 *    - LCH: lch(L, C, H) (e.g., lch(93.75 0 none), lch(93.75 0 none / 0.349))
 *    - OKLAB: oklab(L, A, B) (e.g., oklab(94.61% 0 0), oklab(94.61% 0 0 / 0.349))
 *    - OKLCH: oklch(L, C, H) (e.g., oklch(94.61% 0 none), oklch(94.61% 0 none / 0.349))
 *
 * Named colors:
 *    - CSS basic named colors (https://www.w3.org/wiki/CSS/Properties/color/keywords#Basic_Colors) + transparent and orange
 *    - aqua, black, blue, fuchsia, gray, green, lime, maroon, navy, olive, orange, purple, red, silver, teal, transparent, white, yellow
 *
 * The regex is case-insensitive and supports global matching.
 *
 * TODO: Add support for CSS color format function: color()
 */
export const colorRegex =
	/(?<!\w)(:\s*)?(#([0-9A-Fa-f]{3,4}){1,2}\b|(rgb|hsl|hwb|lab|lch|oklab|oklch)a?\s*\([^)]+\)|\b(aqua|black|blue|fuchsia|gray|green|lime|maroon|navy|olive|orange|purple|red|silver|teal|transparent|white|yellow))(?=\s*;|\s*$)/gi;

/**
 * Validate if a color string is a valid CSS color in any of the following formats:
 * LAB, LCH, OKLAB, OKLCH
 * 
 * Trying to match CSS Color Module Level 4 W3C Candidate Recommendation Draft, 13 February 2024
 * https://www.w3.org/TR/css-color-4/
 * 
 * @param {string} color The color string to validate.
 * @returns {boolean} Whether the color is valid or not.
 */
export function isValidLabLchOklabOklchColor(color: string): boolean {
	const cssColorRegex =
		/^(lab|lch|oklab|oklch)\(\s*((?:[+-]?\d+(?:\.\d+)?%?))\s+((?:[+-]?\d+(?:\.\d+)?))\s+((?:[+-]?\d+(?:\.\d+)?(?:deg|grad|rad|turn)?))(\s*\/\s*((?:[+-]?\d+(?:\.\d+)?%?)))?\s*\)$/i;

	const match = color.match(cssColorRegex);
	if (!match) {
		return false;
	}

	// match indices:
	// [1]: function name (lab, lch, oklab, oklch)
	// [2]: L parameter (can be a number or percentage)
	// [3]: second parameter (a for lab/oklab or C for lch/oklch)
	// [4]: third parameter (b for lab/oklab or H for lch/oklch), may include an angle unit
	// [6]: optional alpha value
	const [, format, LStr, param2Str, param3Str, , alphaStr] = match;

	// Helper: parse a value, stripping "%" if present.
	function parseValue(value: string): number | null {
		const num = value.endsWith('%') ? parseFloat(value.slice(0, -1)) : parseFloat(value);
		return isNaN(num) ? null : num;
	}

	const L = parseValue(LStr);
	const param2 = parseValue(param2Str);

	let param3: number | null = null;
	// Remove any angle unit from param3 if present.
	const angleMatch = param3Str.match(/^([+-]?\d+(?:\.\d+)?)(deg|grad|rad|turn)?$/i);
	if (angleMatch) {
		param3 = parseFloat(angleMatch[1]);
	} else {
		return false;
	}

	// Alpha is optional.
	let alpha: number | null = null;
	if (alphaStr) {
		alpha = parseValue(alphaStr);
	}

	// Ensure required parameters are present.
	if (L === null || param2 === null || param3 === null) {
		return false;
	}

	// Validate according to the format.
	switch (format.toLowerCase()) {
		case 'lab':
			// L: 0-100; a and b: -128 to 127.
			if (L < 0 || L > 100) {
				return false;
			}
			if (param2 < -128 || param2 > 127) {
				return false;
			}
			if (param3 < -128 || param3 > 127) {
				return false;
			}
			break;
		case 'lch':
			// L: 0-100; C: >= 0; H: 0-360.
			if (L < 0 || L > 100) {
				return false;
			}
			if (param2 < 0) {
				return false;
			}
			if (param3 < 0 || param3 > 360) {
				return false;
			}
			break;
		case 'oklab':
			// L: if percentage then 0-100; if number then 0-1; a and b: -0.4 to 0.4.
			if (LStr.endsWith('%')) {
				if (L < 0 || L > 100) {
					return false;
				}
			} else {
				if (L < 0 || L > 1) {
					return false;
				}
			}
			if (param2 < -0.4 || param2 > 0.4) {
				return false;
			}
			if (param3 < -0.4 || param3 > 0.4) {
				return false;
			}
			break;
		case 'oklch':
			// L: as oklab; C: >= 0; H: 0-360.
			if (LStr.endsWith('%')) {
				if (L < 0 || L > 100) {
					return false;
				}
			} else {
				if (L < 0 || L > 1) {
					return false;
				}
			}
			if (param2 < 0) {
				return false;
			}
			if (param3 < 0 || param3 > 360) {
				return false;
			}
			break;
		default:
			return false;
	}

	// Validate alpha if provided.
	if (alpha !== null) {
		if (alphaStr.endsWith('%')) {
			if (alpha < 0 || alpha > 100) {
				return false;
			}
		} else {
			if (alpha < 0 || alpha > 1) {
				return false;
			}
		}
	}

	return true;
}

/**
 * Validate if a color string is a valid color using the color.js library.
 *
 * @param {string} input - The color string to validate.
 * @returns {boolean} True if the input is a valid color, otherwise false.
 */
export function isValidColor(input: string): boolean {
	try {
		new Color(input);
		return true;
	} catch {
		return false;
	}
}

/**
/**
 * Convert a color from one format to another:
 * HEX, OKLCH, OKLAB, LCH, LAB, RGB, RGBA, HSL, HSLA, HWB
 * Using color.js library
 *
 * @param {string} input - The color string to convert.
 * @param {ConvertColorFormatsOptions} options - The options to use for the conversion.
 * @param {string} options.outputFormat - The output format to convert to. Defaults to null.
 * @param {number} options.precision - The number of digits to use for the color value. Defaults to 4.
 * @param {boolean} options.alpha - Whether to include the alpha channel in the conversion. Defaults to false.
 * @param {boolean} options.shouldThrowException - Whether to throw an exception if the input is not a valid color. Defaults to true.
 * @returns {string} The converted color string or an empty string if the input is not a valid color and shouldThrowException is false.
 */
export function getConvertedColor(
	input: string,
	options: ConvertColorFormatsOptions = {}
): string {
	const {
		outputFormat = null,
		precision = 4,
		alpha = false,
		shouldThrowException = true,
	} = options;

	try {
		const color = new Color(input);

		switch (outputFormat) {
			case AllowedOutputFormats.HEX:
				return color.to('srgb').toString({ format: 'hex', alpha: alpha });

			case AllowedOutputFormats.HSL:
				return color.to('hsl').toString({ precision: precision, alpha: alpha });

			case AllowedOutputFormats.HSLA:
				return color
					.to('hsl')
					.toString({ format: 'hsla', precision: precision, alpha: true });

			case AllowedOutputFormats.HWB:
				return color
					.to('srgb')
					.toString({ format: 'hwb', precision: precision, alpha: alpha });

			case AllowedOutputFormats.LAB:
				return color.to('lab').toString({ precision: precision, alpha: alpha });

			case AllowedOutputFormats.LCH:
				return color.to('lch').toString({ precision: precision, alpha: alpha });

			case AllowedOutputFormats.RGB:
				return color.to('srgb').toString({ precision: precision, alpha: alpha });

			case AllowedOutputFormats.RGBA:
				return color
					.to('srgb')
					.toString({ format: 'rgba', precision: precision, alpha: alpha });
			case AllowedOutputFormats.OKLAB:
				return color.to('oklab').toString({ precision: precision, alpha: alpha });

			default:
				return color.to('oklch').toString({ precision: precision, alpha: alpha });
		}
	} catch {
		if (!shouldThrowException) {
			return '';
		}

		throw new ColorConversionError(
			l10n.t({
				message: 'cfc.error.invalidColorFormat',
				args: [input],
				comment: '{0} is the invalid color format',
			})
		);
	}
}

/**
 * Convert a color from one format to following formats:
 * HEX, OKLCH, OKLAB, LCH, LAB, RGB, RGBA, HSL, HSLA, HWB
 * Using color.js library
 *
 * @param {string} input - The color string to convert.
 * @param {ConvertColorFormatsOptions} options - The options to use for the conversion.
 * @param {number} options.precision - The number of digits to use for the color value. Defaults to 4.
 * @param {boolean} options.alpha - Whether to include the alpha channel in the conversion. Defaults to false.
 * @param {boolean} options.shouldThrowException - Whether to throw an exception if the input is not a valid color. Defaults to true.
 * @returns {ConvertedColors[]} An array of objects with the following shape or an empty array if the input is not a valid color and shouldThrowException is false:
 * {
 *   format: string,
 *   value: string,
 * }
 */
export function getConvertedColors(
	input: string,
	options: ConvertColorFormatsOptions = {}
): ConvertedColors[] {
	const { precision = 4, alpha = false, shouldThrowException = true } = options;

	try {
		const color = new Color(input);
		return [
			{
				format: 'HEX',
				value: color.to('srgb').toString({ format: 'hex', alpha: alpha }),
			},
			{
				format: 'OKLCH',
				value: color.to('oklch').toString({ precision: precision, alpha: alpha }),
			},
			{
				format: 'OKLAB',
				value: color.to('oklab').toString({ precision: precision, alpha: alpha }),
			},
			{
				format: 'LCH',
				value: color.to('lch').toString({ precision: precision, alpha: alpha }),
			},
			{
				format: 'LAB',
				value: color.to('lab').toString({ precision: precision, alpha: alpha }),
			},
			{
				format: 'RGB',
				value: color.to('srgb').toString({ precision: precision, alpha: alpha }),
			},
			{
				format: 'RGBA',
				value: color.to('srgb').toString({
					format: 'rgba',
					precision: precision,
					alpha: alpha,
				}),
			},
			{
				format: 'HSL',
				value: color.to('hsl').toString({ precision: precision, alpha: alpha }),
			},
			{
				format: 'HSLA',
				value: color
					.to('hsl')
					.toString({ format: 'hsla', precision: precision, alpha: true }),
			},
			{
				format: 'HWB',
				value: color
					.to('srgb')
					.toString({ format: 'hwb', precision: precision, alpha: alpha }),
			},
		];
	} catch {
		if (!shouldThrowException) {
			return [];
		}

		throw new ColorConversionError(
			l10n.t({
				message: 'cfc.error.invalidColorFormat',
				args: [input],
				comment: '{0} is the invalid color format',
			})
		);
	}
}

/**
 * Highlights all OKLCH, OKLAB, LCH, LAB color values in a given TextEditor.
 *
 * @param editor The TextEditor to highlight colors in.
 *
 * @example
 * updateColorDecorations(vscode.window.activeTextEditor);
 */
export function updateColorDecorations(editor: TextEditor) {
	if (!editor) {
		return;
	}
	const regex = /oklch\(([^)]+)\)|oklab\(([^)]+)\)|lch\(([^)]+)\)|lab\(([^)]+)\)/g;

	const text = editor.document.getText();
	const colorMatches = text.matchAll(regex);

	const decorations: DecorationOptions[] = [];

	for (const match of colorMatches) {
		if (match.index === undefined) {
			continue;
		}

		const colorStr = match[0]; // Ex: "oklch(65% 0.2 200)"

		if (!isValidLabLchOklabOklchColor(colorStr)) {
			continue;
		}

		const startPos = editor.document.positionAt(match.index);
		const endPos = editor.document.positionAt(match.index + colorStr.length);

		const decoration: DecorationOptions = {
			range: new Range(startPos, endPos),
			renderOptions: {
				before: {
					contentText: ' ',
					// backgroundColor: rgbColor,
					backgroundColor: colorStr,
					width: '.8em',
					height: '.8em',
					margin: '.1em .2em 0',
					border: '.1em solid #000',
				},
				light: {
					before: {
						borderColor: '#000',
					},
				},
				dark: {
					before: {
						borderColor: '#eee',
					},
				},
			},
		};
		decorations.push(decoration);
	}

	if (!decorationType) {
		decorationType = window.createTextEditorDecorationType({});
	}

	editor.setDecorations(decorationType, decorations);
}

/**
 * Generates a random 32-character string, used as a nonce.
 *
 * @returns A 32-character string, randomly generated.
 */
export function getNonce() {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}
