import { PaneType, PluginSettingTab, Setting } from 'obsidian';
import OpenPropertyLinkPlugin from 'main';


export interface OpenPropertyLinkSettings {
	properties: string;
	howToOpen: PaneType | boolean;
}

export const DEFAULT_SETTINGS: OpenPropertyLinkSettings = {
	properties: '',
	howToOpen: false,
};

// Inspired by https://stackoverflow.com/a/50851710/13613783
export type KeysOfType<Obj, Type> = NonNullable<{ [k in keyof Obj]: Obj[k] extends Type ? k : never }[keyof Obj]>;

export class OpenPropertyLinkSettingTab extends PluginSettingTab {
	constructor(public plugin: OpenPropertyLinkPlugin) {
		super(plugin.app, plugin);
	}

	display(): void {
		this.containerEl.empty();

		new Setting(this.containerEl)
			.setName('Properties')
			.setDesc('A comma-separeted list of property names. If either of these properties are found in the opened file and the value is a valid internal link, the link will be opened at the same time. If the linked file is already opened, nothing will happen.')
			.addText((text) => {
				text.inputEl.size = 30;
				text.setValue(this.plugin.settings.properties)
					.setPlaceholder('property1, property2, ...')
					.onChange(async (value) => {
						this.plugin.settings.properties = value;
						await this.plugin.saveSettings();
					});
			});

		new Setting(this.containerEl)
			.setName('How to open')
			.addDropdown((dropdown) => {
				dropdown
					.addOptions({
						'': 'Current tab',
						'tab': 'New tab',
						'split': 'Split right',
						'window': 'New window',
					})
					.setValue(this.plugin.settings.howToOpen === false ? '' : this.plugin.settings.howToOpen === true ? 'tab' : this.plugin.settings.howToOpen)
					.onChange(async (value: '' | PaneType) => {
						this.plugin.settings.howToOpen = value || false;
						await this.plugin.saveSettings();
					});
			});
	}
}
