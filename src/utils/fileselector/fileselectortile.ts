import { display } from 'harmony-ui';
import { FileSelectorFile } from './file';
import { FileSelector } from './fileselector';

export class HTMLFileSelectorTileElement extends HTMLElement {
	#visible = true;
	#selector?: FileSelector;
	#file?: FileSelectorFile;

	constructor() {
		super();
		this.addEventListener('click', () => {
			if (this.#selector && this.#file) {
				this.#selector.fileSelected(this.#file);
			}
		});
	}

	get file(): FileSelectorFile | undefined {
		return this.#file;
	}

	setFile(file: FileSelectorFile): void {
		this.#file = file;
		this.#updateHtml();
	}

	set selector(selector: FileSelector) {
		this.#selector = selector;
	}

	connectedCallback(): void {
		this.#updateHtml();
	}

	set visible(visible: boolean) {
		this.#visible = visible;
		display(this, visible);
		if (visible) {
			this.#updateHtml();
		}
	}

	#updateHtml(): void {
		if (this.#visible && this.#file) {
			this.innerText = this.#file.name;
		}
	}
}

let definedTile = false;
export function defineFileSelectorTile(): void {
	if (window.customElements && !definedTile) {
		customElements.define('file-selector-tile', HTMLFileSelectorTileElement);
		definedTile = true;
	}
}
