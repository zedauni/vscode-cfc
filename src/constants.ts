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
