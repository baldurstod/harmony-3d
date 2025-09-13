import { display } from 'harmony-ui';
import { FileSelectorFile } from './file';
import { FileSelector } from './fileselector';

export class HTMLFileSelectorFileElement extends HTMLElement {
	#selector?: FileSelector;
	#file?: FileSelectorFile;

	constructor() {
		super();
		this.addEventListener('click', (event) => {
			if (this.#selector && this.#file) {
				this.#selector.fileSelected(this.#file);
			}
		});
	}

	setFile(file: FileSelectorFile) {
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
			this.innerText = this.#file.name;
		}
	}

	refreshFilter(): boolean {
		if (!this.#selector || !this.#file || !this.#file.path) {
			return false;
		}

		const filterName = this.#selector.filter.name;
		const visible = this.#file.name.toLowerCase().includes(filterName) || this.#file.path.toLowerCase().includes(filterName);
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
