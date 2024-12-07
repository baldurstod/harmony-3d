import { display } from 'harmony-ui';
import { FileSelectorFile } from './file';
import { FileSelector } from './fileselector';

export class HTMLFileSelectorTileElement extends HTMLElement {
	#visible: boolean = true;
	#selector?: FileSelector;
	#file?: FileSelectorFile;

	constructor() {
		super();
		this.addEventListener('click', (event) => {
			if (this.#selector) {
				this.#selector.fileSelected(this.#file);
			}
		});
	}

	get file() {
		return this.#file;
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
		this.#visible = visible;
		display(this, visible);
		if (visible) {
			this.#updateHtml();
		}
	}

	#updateHtml() {
		if (this.#visible && this.#file) {
			this.innerHTML = this.#file.name;
		}
	}
}

let definedTile = false;
export function defineFileSelectorTile() {
	if (window.customElements && !definedTile) {
		customElements.define('file-selector-tile', HTMLFileSelectorTileElement);
		definedTile = true;
	}
}
