import { vec3, vec4 } from 'gl-matrix';
import { createElement, toggle, hide, show, defineHarmonyColorPicker, createShadowRoot } from 'harmony-ui';
import { FileSelector } from './fileselector/fileselector';
export { FileSelector } from './fileselector/fileselector';
import interactionCSS from '../css/interaction.css';
import { FileSelectorFile } from './fileselector/file';

const DATALIST_ID = 'interaction-datalist';

export class Interaction {
	static #instance: Interaction;
	#htmlColorPicker?: HTMLElement;
	#shadowRoot?: ShadowRoot;
	#htmlInput?: HTMLInputElement;
	#htmlInputDataList?: HTMLDataListElement;
	#htmlFileSelector?: HTMLElement;
	//#htmlColorPickeronDone?: (color: any) => void;
	#htmlColorPickeronChange?: (color: any) => void;
	#htmlColorPickerCancel?: () => void;

	constructor() {
		if (Interaction.#instance) {
			return Interaction.#instance;
		}
		Interaction.#instance = this;
	}

	#initHtml() {
		if (this.#shadowRoot) {
			return;
		}

		this.#shadowRoot = createShadowRoot('div', {
			parent: document.body,
			hidden: true,
			adoptStyle: interactionCSS
		});

		defineHarmonyColorPicker();
		this.#htmlColorPicker = createElement('harmony-color-picker', {
			parent: this.#shadowRoot,
			hidden: true,
			events: {
				change: (event: CustomEvent) => {
					if (this.#htmlColorPickeronChange) {
						this.#htmlColorPickeronChange(event.detail);
					}
				},
				ok: () => hide(this.#htmlColorPicker),
				cancel: () => {
					if (this.#htmlColorPickerCancel) {
						this.#htmlColorPickerCancel();
					}
					hide(this.#htmlColorPicker)
				},
			},
		});


		this.#htmlInput = createElement('input', {
			style: 'pointer-events: all;',
			list: DATALIST_ID,
			parent: this.#shadowRoot,
			hidden: true,
		}) as HTMLInputElement;

		this.#htmlInputDataList = createElement('datalist', {
			id: DATALIST_ID,
			parent: this.#shadowRoot,
		}) as HTMLDataListElement;


		this.#htmlFileSelector = createElement('div', {
			style: 'pointer-events: all;width: 100%;overflow: auto;height: 100%;',
		});
	}

	show() {
		this.#initHtml();
		show(this.#shadowRoot?.host as HTMLElement);
		hide(this.#htmlInput);
		hide(this.#htmlColorPicker);
	}

	hide() {
		hide(this.#shadowRoot?.host as HTMLElement);
	}

	async getColor(x: number, y: number, defaultValue?: vec4, onChange?: (color: vec4) => void, onCancel?: () => void) {
		this.show();
		//this.#htmlColorPicker.setOptions({alpha:false});
		show(this.#htmlColorPicker);

		let promiseResolve: (value: vec4) => void;

		let promise = new Promise<vec4>((resolve, reject) => {
			promiseResolve = resolve;
		});
		/*
		this.#htmlColorPickeronDone = (color) => {
			let rgba = color.rgba;
			let c = vec4.fromValues(rgba[0] / 255, rgba[1] / 255, rgba[2] / 255, 1.0);
			//console.error(color, color.rgba);
			promiseResolve(c);
			this.hide();
		};
		*/
		this.#htmlColorPickeronChange = (color) => {
			let rgba = color.rgba;
			let c = vec4.fromValues(rgba[0], rgba[1], rgba[2], rgba[3]);
			if (onChange) {
				onChange(c);
			}
		};
		this.#htmlColorPickerCancel = () => {
			if (onCancel) {
				onCancel();
			}
		};

		return promise;
	}

	getString(x: number, y: number, list: Set<string> | Array<string> | Map<string, string> | MapIterator<string>, defaultValue?: string): Promise<string> {
		this.show();
		show(this.#htmlInput);
		(this.#htmlInput as HTMLInputElement).value = defaultValue ? defaultValue : '';
		if (list) {
			let isMap = list.constructor.name == 'Map';
			(this.#htmlInputDataList as HTMLDataListElement).innerText = '';
			for (let value of list) {
				let animOption = document.createElement('option');
				(this.#htmlInputDataList as HTMLDataListElement).append(animOption);
				if (isMap) {
					animOption.innerHTML = value[0];
					animOption.value = value[1];
				} else {
					animOption.innerHTML = value as string;
				}
			}
		}

		let promiseResolve: (value: string) => void;
		(this.#htmlInput as HTMLInputElement).onchange = (event) => {
			for (let option of (this.#htmlInputDataList as HTMLDataListElement).options) {
				if (option.value == (event.target as HTMLInputElement).value) {
					promiseResolve(option.value);
				}
			}
			hide(this.#htmlInput);
		}


		let promise = new Promise<string>(resolve => {
			promiseResolve = resolve;
		});
		return promise;
	}

	/*
	async #expandFile(parent, files, callback, repository = '', path = '') {
		parent.replaceChildren();

		files.sort(
			(a, b) => {
				if (a.files) {
					if (!b.files) {
						return -1;
					}
				} else {
					if (b.files) {
						return 1;
					}
				}
				return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1;
			}
		);

		for (let file of files) {
			let f = document.createElement('div');
			f.className = 'file-explorer-file';
			parent.append(f);
			if (file.name) {
				let fheader = document.createElement('div');
				fheader.className = 'file-explorer-file-header';
				fheader.append(file.name);
				f.append(fheader);

				fheader.addEventListener('click', (event) => {
					if (event.target == fheader) {
						if (file.files) {
							if (!f.getAttribute('data-initialized')) {
								f.setAttribute('data-initialized', 'true');
								let f1 = document.createElement('div');
								f1.className = 'file-explorer-childs';
								if (repository == '') {
									this.#expandFile(f1, file.files, callback, file.name);
								} else {
									this.#expandFile(f1, file.files, callback, repository, path + file.name + '/');
								}
								//f1.style.display = 'none';
								f.addEventListener('click', (event) => {
									if (event.target == f) {
										toggle(f1);
									}
								});
								f.append(f1);
							}
						}
						console.error(path);
						callback({ repository: repository, path: path, name: file.name });
					}
				});
			}
		}
	}
		*/

	async selectFile(htmlContainer: HTMLElement, fileList: FileSelectorFile, callback: (repository: string, modelName: string) => void) {
		this.#initHtml();
		//htmlContainer.append(this.#htmlFileSelector);
		//this.show();
		//this.#htmlFileSelector.style.display = '';
		(this.#htmlFileSelector as HTMLElement).innerText = '';
		htmlContainer.innerText = '';

		//let value = await
		//this._expandFile(this.#htmlFileSelector, fileList.files, callback);
		//this.#htmlFileSelector.style.display = 'none';
		//this.hide();
		//return value;
		let fileSelector: FileSelector = document.createElement('file-selector') as FileSelector;//TODO: create only once
		htmlContainer.append(fileSelector);
		fileSelector.fileList = fileList;
		fileSelector.addEventListener('fileSelected', event => {
			let file = (event as CustomEvent).detail.file;
			callback(file.root, file.path + file.name);
		});
	}

	get htmlElement() {
		return this.#shadowRoot?.host as HTMLElement;
	}
}
