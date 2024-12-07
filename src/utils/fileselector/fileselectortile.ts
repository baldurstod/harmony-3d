import { display } from 'harmony-ui';

export class HTMLFileSelectorTileElement extends HTMLElement {
	#visible;
	#file;
	#selector;

	constructor() {
		super();
		this.#visible = true;
		this.addEventListener('click', (event) => {
			if (this.#selector) {
				this.#selector.fileSelected(this.#file);
			}
		});
	}

	get file() {
		return this.#file;
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
