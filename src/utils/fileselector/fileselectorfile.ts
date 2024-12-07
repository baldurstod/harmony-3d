import { display } from 'harmony-ui';
import { FileSelector } from './fileselector';

export type File/*TODO: rename this type*/ = { name: string, path: string, childs: Array<File> };

export class HTMLFileSelectorFileElement extends HTMLElement {
	#selector?: FileSelector;
	#file?: File;
	constructor() {
		super();
		this.addEventListener('click', (event) => {
			if (this.#selector) {
				this.#selector.fileSelected(this.#file);
			}
		});
	}

	setFile(file: File) {
		this.#file = file;
		this.#updateHtml();
	}

	set selector(selector: FileSelector) {
		this.#selector = selector;
	}

	connectedCallback() {
		this.#updateHtml();
	}

	set visible(visible: boolean) {
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
		if (!this.#selector || !this.#file) {
			return false;
		}

		let filterName = this.#selector.filter.name;
		let visible = this.#file.name.toLowerCase().includes(filterName) || this.#file.path.toLowerCase().includes(filterName);
		this.visible = visible;
		return visible;
	}

	get file() {
		return this.#file;
	}
}

let definedFile = false;
export function defineFileSelectorFile() {
	if (window.customElements && !definedFile) {
		customElements.define('file-selector-file', HTMLFileSelectorFileElement);
		definedFile = true;
	}
}
