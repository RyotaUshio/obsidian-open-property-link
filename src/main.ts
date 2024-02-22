import { FileView, PaneType, Plugin, WorkspaceLeaf, getLinkpath } from 'obsidian';
import { getAPI } from 'obsidian-dataview'

import { OpenPropertyLinkSettings, DEFAULT_SETTINGS, OpenPropertyLinkSettingTab } from 'settings';


export default class OpenPropertyLinkPlugin extends Plugin {
	settings: OpenPropertyLinkSettings;

	async onload() {
		await this.loadSettings();
		await this.saveSettings();
		this.addSettingTab(new OpenPropertyLinkSettingTab(this));

		this.registerEvent(this.app.workspace.on('file-open', (file) => {
			if (!file) return;

			const dv = getAPI(this.app);
			if (dv) {
				console.log('dv');
				const page = dv.page(file.path);
				if (!page) return;

				this.settings.properties
					.split(',')
					.map((prop) => prop.trim())
					.forEach((prop) => {
						const link = page[prop];
						if (link.constructor.name === 'Link') {
							let linktext = link.path;
							if (link.subpath) {
								linktext += '#' + link.subpath;
							}

							this.openLinkText(linktext, file.path, this.settings.howToOpen);
						}
					});
			} else {
				const cache = this.app.metadataCache.getFileCache(file);
				if (!cache) return;

				const links = cache.frontmatterLinks;
				if (!links) return;

				const properties = new Set(this.settings.properties.split(',').map((prop) => prop.trim()));

				for (const link of links) {
					if (properties.has(link.key)) {
						this.openLinkText(link.link, file.path, this.settings.howToOpen);
					}
				}
			}
		}));
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async openLinkText(linktext: string, sourcePath: string, newLeaf?: boolean | PaneType) {
		const file = this.app.metadataCache.getFirstLinkpathDest(getLinkpath(linktext), sourcePath);
		if (!file) return;

		let existingLeaf: WorkspaceLeaf | undefined;

		this.app.workspace.iterateAllLeaves((leaf) => {
			if (existingLeaf) return;

			const view = leaf.view;
			if (view instanceof FileView && view.file?.path === file.path) {
				existingLeaf = leaf;
			}
		});

		if (!existingLeaf) {
			await this.app.workspace.openLinkText(linktext, sourcePath, newLeaf);
			return;
		}

		if (this.settings.focusIfAlreadyOpened) {
			this.app.workspace.revealLeaf(existingLeaf);
		}
	}
}
