/**
 * Interface for color conversion results
 *
 * @interface ConvertedColors
 * @property {string} format - The output format of the color conversion
 * @property {string} value - The converted color value
 */
export interface ConvertedColors {
	format: string;
	value: string;
}

/**
 * Enum of allowed output formats for color conversion
 *
 * @enum {string} AllowedOutputFormats
 */
export enum AllowedOutputFormats {
	HEX = 'HEX',
	HSL = 'HSL',
	HSLA = 'HSLA',
	HWB = 'HWB',
	LAB = 'LAB',
	LCH = 'LCH',
	RGB = 'RGB',
	RGBA = 'RGBA',
	OKLCH = 'OKLCH',
	OKLAB = 'OKLAB',
}

/**
 * Enum representing the different view (webview view) types in the extension.
 *
 * @enum {string} ViewType
 * @readonly
 * @property {string} History - The view type for the colors history view.
 * @property {string} Favorites - The view type for the favorites colors view.
 */

export enum ViewType {
	History = 'cfc.colorsHistoryView',
	Favorites = 'cfc.colorsFavoritesView',
}

/**
 * List of supported languages
 *
 * This language identifiers are supported.
 * This extension can convert color formats within
 * these languages, when the cursor is on a color
 * or when a defined command is triggered.
 */
export const supportedLanguages = [
	'css',
	'scss',
	'less',
	'javascript',
	'typescript',
	'html',
	'twig',
	'vue',
	'tsx',
];

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
 * TODO: Add support for CSS color() functional notation (https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/color)
 */
export const colorRegex =
	/(?<!\w)(:\s*)?(#([0-9A-Fa-f]{3,4}){1,2}\b|(rgb|hsl|hwb|lab|lch|oklab|oklch)a?\s*\([^)]+\)|\b(aqua|black|blue|fuchsia|gray|green|lime|maroon|navy|olive|orange|purple|red|silver|teal|transparent|white|yellow))(?=\s*;|\s*$)/gi;

/**
 * Interface for extension configuration
 *
 * @interface ExtensionConfigs
 * @property {AllowedOutputFormats} defaultFormat - The default output format for the color conversion
 * @property {number} precision - The number of decimal places to round the color values to
 * @property {boolean} forceAlpha - Whether to include the alpha channel in the conversion
 * @property {boolean} showModernColorPreview - Whether to show the modern color preview
 */
export interface ExtensionConfigs {
	defaultFormat: AllowedOutputFormats;
	precision: number;
	forceAlpha: boolean;
	showModernColorPreview: boolean;
}

/**
 * Error class for color conversion
 *
 * @class ColorConversionError
 * @extends Error
 */
export class ColorConversionError extends Error {
	/**
	 * Creates an instance of ColorConversionError.
	 *
	 * @param {string} message - The error message
	 * @memberof ColorConversionError
	 */
	constructor(message: string) {
		super(message);
		this.name = 'ColorConversionError';
	}
}
