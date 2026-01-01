import { createElement } from 'harmony-ui';
import { FileSelectorFile } from './file';
import { FileSelectorDirectory } from './fileselectordirectory';
import { defineFileSelectorTile, HTMLFileSelectorTileElement } from './fileselectortile';

export { FileSelectorDirectory } from './fileselectordirectory';

const FILTER_NAME_DELAY = 200;

export class FileSelector extends HTMLElement {
	#fileList?: FileSelectorFile;
	#tileView = false;
	#filter = { name: '' };
	#sortingDirection = 1;
	#htmlTiles: HTMLFileSelectorTileElement[] = [];
	#htmlDirectories: FileSelectorDirectory[] = [];
	#header: HTMLElement;
	#content: HTMLElement;
	#filterNameTimeout?: ReturnType<typeof setTimeout>;
	#initialized = false;
	constructor() {
		super();

		this.#header = createElement('div', { class: 'file-selector-header' });
		this.#content = createElement('div', { class: 'file-selector-content' });

		const htmlDisplayPropertiesSpan = createElement('span', { parent: this.#header });

		const treeViewId = 'display_tree_view';
		createElement('input', {
			parent: htmlDisplayPropertiesSpan,
			type: 'checkbox',
			id: treeViewId,
			checked: !this.#tileView,
			events: {
				change: () => this.tileView = !this.#tileView
			}
		});
		createElement('label', { i18n: '#display_tree_view', parent: htmlDisplayPropertiesSpan, htmlFor: treeViewId });

		const htmlFilter = createElement('div', { class: 'file-selector-filter', parent: this.#header });

		createElement('input', {
			parent: htmlFilter,
			events: {
				input: (event: Event) => {
					this.#filter.name = (event.target as HTMLInputElement).value;
					clearTimeout(this.#filterNameTimeout);
					this.#filterNameTimeout = setTimeout(() => this.refreshFilter(), FILTER_NAME_DELAY);
				}
			},
		});
	}

	fileSelected(file: FileSelectorFile): void {
		this.dispatchEvent(new CustomEvent('fileSelected', { detail: { file: file } }));
	}

	set fileList(fileList: FileSelectorFile) {
		this.#fileList = fileList;
		this.#initialized = false;
		this.#updateHtml();
	}

	set tileView(tileView: boolean) {
		this.#tileView = tileView;
		this.#initialized = false;
		this.#updateHtml();
	}

	connectedCallback(): void {
		this.append(this.#header, this.#content);
		this.#updateHtml();
	}

	#getFileList(root: FileSelectorFile): FileSelectorFile[] {
		const list = [];
		const stack = [root];
		root.path = '';
		const rootName = root.name;//.replace(/\/$/g, '');
		let current;
		do {
			current = stack.pop();
			if (current) {
				if (current.files) {
					for (const file of current.files) {
						const path2 = current.path?.replace(/\/$/g, '');//remove trailing /
						const name2 = current.name?.replace(/\/$/g, '');//remove trailing /
						if (current == root) {
							file.path = '/';
						} else {
							file.path = (path2 ? path2 + '/' + name2 : name2) + '/';
							file.root = rootName;
						}
						if (file.files) {
							stack.push(file);
						} else {
							list.push(file);
						}
					}
				}
			}
		} while (current);

		return list;
	}

	refreshFilter(): void {
		if (this.#tileView) {
			for (const tile of this.#htmlTiles) {
				tile.visible = this.#matchFilter(tile.file);
			}
		} else {
			for (const directory of this.#htmlDirectories) {
				directory.refreshFilter();
			}
		}
	}

	#sortItems(): void {
		if (this.#tileView) {
			this.#htmlTiles.sort(
				(a, b) => {
					const aname = a.file?.name;
					const bname = b.file?.name;
					if (aname && bname) {
						return aname < bname ? -this.#sortingDirection : this.#sortingDirection;
					}
					return 0;
				}
			);
			for (const tile of this.#htmlTiles) {
				this.#content.append(tile);
			}
		}
	}

	#matchFilter(file: FileSelectorFile | undefined): boolean {
		if (!file) {
			return false;
		}
		let ret = false;
		if (file.name?.toLowerCase().includes(this.#filter.name)) {
			ret = true;
		}
		return ret;
	}

	#updateHtml(): void {
		if (this.#initialized) {
			return;
		}

		defineFileSelectorTile();
		this.#content.replaceChildren();
		this.#htmlTiles = [];
		this.#htmlDirectories = [];

		if (this.#fileList?.files) {
			if (this.#tileView) {
				for (const rootFile of this.#fileList.files) {
					const fileList = this.#getFileList(rootFile);
					for (const file of fileList) {
						const tile = createElement('file-selector-tile', { parent: this.#content }) as HTMLFileSelectorTileElement;
						tile.selector = this;
						tile.setFile(file);
						this.#htmlTiles.push(tile);
						tile.visible = this.#matchFilter(file);
					}
				}
			} else {
				const expandDirectory = this.#fileList.files.length == 1;
				for (const rootFile of this.#fileList.files) {
					this.#getFileList(rootFile);//Just add path
					const root = createElement('file-selector-directory', { parent: this.#content }) as FileSelectorDirectory;
					root.selector = this;
					root.setFile(rootFile);
					this.#htmlDirectories.push(root);
					if (expandDirectory) {
						root.expand();
					}
				}

			}
		}

		this.#sortItems();
		this.#initialized = true;
	}

	get filter(): { name: string } {
		return this.#filter;
	}
}

if (customElements) {
	customElements.define('file-selector', FileSelector);
}
