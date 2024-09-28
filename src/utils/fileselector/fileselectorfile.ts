import { display } from 'harmony-ui';

export class FileSelectorFile extends HTMLElement {
	#selector;
	#file;
	#visible;
	constructor() {
		super();
		this.addEventListener('click', (event) => {
			if (this.#selector) {
				this.#selector.fileSelected(this.#file);
			}
		});
	}

	setFile(file) {
		this.#file = file;
		this.#updateHtml();
	}

	set selector(selector) {
		this.#selector = selector;
	}

	connectedCallback() {
		this.#updateHtml();
	}

	set visible(visible) {
		this.#visible = visible;
		display(this, visible);
		if (visible) {
			this.#updateHtml();
		}
	}

	#updateHtml() {
		if (this.#file) {
			this.innerHTML = this.#file.name;
		}
	}

	refreshFilter() {
		let filterName = this.#selector.filter.name;
		let visible = this.#file.name.toLowerCase().includes(filterName) || this.#file.path.toLowerCase().includes(filterName);
		this.visible = visible;
		return visible;
	}

	get file() {
		return this.#file;
	}
}

if (customElements) {
	customElements.define('file-selector-file', FileSelectorFile);
}
