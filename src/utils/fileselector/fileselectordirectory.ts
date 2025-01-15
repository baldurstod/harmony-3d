import { createElement, display, hide, show } from 'harmony-ui';
import { defineFileSelectorFile, HTMLFileSelectorFileElement } from './fileselectorfile';
import { FileSelectorFile } from './file';
import { FileSelector } from './fileselector';

export class FileSelectorDirectory extends HTMLElement {
	#initialized = false;
	#expanded = false;
	#name = '';
	#childs: Array<FileSelectorDirectory | HTMLFileSelectorFileElement> = [];
	#sortingDirection = 1;
	#visible = true;
	#header;
	#content;
	#file?: FileSelectorFile;
	#selector?: FileSelector;
	#parentDirectory?: FileSelectorDirectory;

	constructor() {
		super();
		this.#header = createElement('div', {
			class: 'file-selector-directory-header',
			events: {
				click: () => {
					this.#expanded = !this.#expanded;
					this.#updateHtml();
					if (this.#expanded && this.#parentDirectory) {
						this.#parentDirectory.#childExpanded(this);
					}
				}
			},
		});
		this.#content = createElement('div', { class: 'file-selector-directory-content' });
	}

	#childExpanded(child: FileSelectorDirectory) {
		for (let enumeratedChild of this.#content.children) {
			if (enumeratedChild.tagName == 'FILE-SELECTOR-DIRECTORY' && enumeratedChild != child) {
				(enumeratedChild as FileSelectorDirectory).collapse();
			}
		}
	}

	expand() {
		this.#expanded = true;
		this.#updateHtml();
	}

	collapse() {
		this.#expanded = false;
		hide(this.#content);
	}

	setFile(file: FileSelectorFile) {
		this.#file = file;
		this.#initialized = false;
		this.#updateHtml();
	}

	set selector(selector: FileSelector) {
		this.#selector = selector;
	}

	get file() {
		return this.#file;
	}

	connectedCallback() {
		this.append(this.#header, this.#content);
		this.#updateHtml();
	}

	set visible(visible: boolean) {
		this.#visible = visible;
		display(this, visible);
		if (visible) {
			this.#updateHtml();
		}
	}

	sort() {
		this.#childs.sort(
			(a: HTMLElement, b: HTMLElement): number => {
				let aIsDir = a.tagName == 'FILE-SELECTOR-DIRECTORY';
				let bIsDir = b.tagName == 'FILE-SELECTOR-DIRECTORY';
				if (aIsDir) {
					if (bIsDir) {
						let aname = (a as FileSelectorDirectory).file?.name;
						let bname = (b as FileSelectorDirectory).file?.name;
						if (aname && bname) {
							return aname < bname ? -this.#sortingDirection : this.#sortingDirection;
						}
					} else {
						return -this.#sortingDirection;
					}
				} else {
					if (bIsDir) {
						return this.#sortingDirection;
					} else {
						let aname = (a as HTMLFileSelectorFileElement).file?.name;
						let bname = (b as HTMLFileSelectorFileElement).file?.name;
						if (aname && bname) {
							return aname < bname ? -this.#sortingDirection : this.#sortingDirection;
						}
					}
				}
				return 0;
			}
		);
		for (let child of this.#childs) {
			this.#content.append(child);
		}
	}

	refreshFilter(): boolean {
		let visible = false;

		if (this.#expanded) {
			for (let child of this.#childs) {
				visible = child.refreshFilter() || visible;
			}
		} else {
			if (this.#file) {
				visible = this.#matchFilter(this.#file);
			}
		}
		this.#visible = visible;
		display(this, visible);
		return visible;
	}

	#matchFilter(file: FileSelectorFile) {
		if (file.files) {
			for (let child of file.files) {
				if (this.#matchFilter(child)) {
					return true;
				}
			}
		} else {
			let filterName = this.#selector?.filter.name ?? '';
			return file.name.toLowerCase().includes(filterName) || file.path?.toLowerCase().includes(filterName) || false;
		}
		return false;
	}

	#updateHtml() {
		defineFileSelectorFile();
		if (this.#file && !this.#initialized) {
			this.#name = this.#file.name.replace(/\/$/g, '');//remove trailing /
			if (this.#expanded) {
				this.#content.replaceChildren();
				this.#childs = [];

				if (this.#file && this.#file.files) {
					let files = this.#file.files;
					let l = files.length == 1;

					for (let file of files) {
						let fileChilds = file.files;
						let child: FileSelectorDirectory | HTMLFileSelectorFileElement;
						if (fileChilds) {
							child = document.createElement('file-selector-directory') as FileSelectorDirectory;
							child.#parentDirectory = this;
						} else {
							child = document.createElement('file-selector-file') as HTMLFileSelectorFileElement;
							//child.file = file;
						}
						if (this.#selector) {
							child.selector = this.#selector;
						}
						child.setFile(file);
						this.#content.append(child);
						this.#childs.push(child);
						if (fileChilds && l) {
							(child as FileSelectorDirectory).expand();
						}
					}
				}
				this.#initialized = true;
				this.sort();
			}

			if (this.#file) {
				this.#header.innerHTML = this.#name;
			}
		}

		if (this.#expanded) {
			show(this.#content);
			this.refreshFilter();
		} else {
			hide(this.#content);
		}
	}
}

if (customElements) {
	customElements.define('file-selector-directory', FileSelectorDirectory);
}
