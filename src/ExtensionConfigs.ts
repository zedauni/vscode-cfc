import { ExtensionContext, workspace, WorkspaceConfiguration } from 'vscode';
import { toAllowedOutputFormat } from './utils';
import { AllowedOutputFormats, ExtensionConfigs } from './constants';

export class Configs {
	private config: WorkspaceConfiguration;
	private defaultFormat: AllowedOutputFormats;
	private precision: number;
	private forceAlpha: boolean;
	private showModernColorPreview: boolean;

	constructor(private context: ExtensionContext) {
		this.config = workspace.getConfiguration('vscodeCfc');
		this.precision = this.config.get<number>('precision', 4);
		this.defaultFormat =
			toAllowedOutputFormat(this.config.get<string>('defaultFormat', 'oklch')) ||
			AllowedOutputFormats.OKLCH;
		this.forceAlpha = this.config.get<boolean>('forceAlpha', false);
		this.showModernColorPreview = this.config.get<boolean>('showModernColorPreview', true);
	}

	get(): ExtensionConfigs {
		console.log(`CFC Precision: ${this.precision}`);
		console.log(`CFC Default Format: ${this.defaultFormat}`);
		console.log(`CFC Force Alpha: ${this.forceAlpha}`);
		console.log(`CFC Show Modern Color Preview: ${this.showModernColorPreview}`);

		return {
			precision: this.precision,
			defaultFormat: this.defaultFormat,
			forceAlpha: this.forceAlpha,
			showModernColorPreview: this.showModernColorPreview
		};
	}
}
