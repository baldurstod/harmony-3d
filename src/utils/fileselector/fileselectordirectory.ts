import { createElement, display, hide, show } from 'harmony-ui';

export class FileSelectorDirectory extends HTMLElement {
	#initialized = false;
	#expanded = false;
	#name = '';
	#childs = [];
	#sortingDirection = 1;
	#visible = true;
	#header;
	#content;
	#file;
	#selector;
	#parentDirectory: FileSelectorDirectory;

	constructor() {
		super();
		this.#header = createElement('div', {
			class: 'file-selector-directory-header',
			events: {
				click: (event) => {
					this.#expanded = !this.#expanded;
					this.#updateHtml();
					if (this.#expanded && this.#parentDirectory) {
						this.#parentDirectory.childExpanded(this);
					}
				}
			},
		});
		this.#content = createElement('div', { class: 'file-selector-directory-content' });
	}

	childExpanded(child) {
		for (let enumeratedChild of this.#content.children) {
			if (enumeratedChild.tagName == 'FILE-SELECTOR-DIRECTORY' && enumeratedChild != child) {
				enumeratedChild.collapse();
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

	setFile(file) {
		this.#file = file;
		this.#initialized = false;
		this.#updateHtml();
	}

	set selector(selector) {
		this.#selector = selector;
	}

	get file() {
		return this.#file;
	}

	connectedCallback() {
		this.append(this.#header, this.#content);
		this.#updateHtml();
	}

	set visible(visible) {
		this.#visible = visible;
		display(this, visible);
		if (visible) {
			this.#updateHtml();
		}
	}

	sort() {
		this.#childs.sort(
			(a, b) => {
				let aIsDir = a.tagName == 'FILE-SELECTOR-DIRECTORY';
				let bIsDir = b.tagName == 'FILE-SELECTOR-DIRECTORY';
				if (aIsDir) {
					if (bIsDir) {
						let aname = a.file.name;
						let bname = b.file.name;
						return aname < bname ? -this.#sortingDirection : this.#sortingDirection;
					} else {
						return -this.#sortingDirection;
					}
				} else {
					if (bIsDir) {
						return this.#sortingDirection;
					} else {
						let aname = a.file.name;
						let bname = b.file.name;
						return aname < bname ? -this.#sortingDirection : this.#sortingDirection;
					}
				}
			}
		);
		for (let child of this.#childs) {
			this.#content.append(child);
		}
	}

	refreshFilter() {
		let visible = false;

		if (this.#expanded) {
			for (let child of this.#childs) {
				visible = child.refreshFilter() || visible;
			}
		} else {
			visible = this.#matchFilter(this.#file);
		}
		this.#visible = visible;
		display(this, visible);
		return visible;
	}

	#matchFilter(file) {
		if (file.files) {
			for (let child of file.files) {
				if (this.#matchFilter(child)) {
					return true;
				}
			}
		} else {
			let filterName = this.#selector.filter.name;
			return file.name.toLowerCase().includes(filterName) || file.path.toLowerCase().includes(filterName);
		}
		return false;
	}

	#updateHtml() {
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
						let child;
						if (fileChilds) {
							child = document.createElement('file-selector-directory');
						} else {
							child = document.createElement('file-selector-file');
							//child.file = file;
						}
						child.selector = this.#selector;
						child.setFile(file);
						this.#content.append(child);
						child.#parentDirectory = this;
						this.#childs.push(child);
						if (fileChilds && l) {
							child.expand();
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
