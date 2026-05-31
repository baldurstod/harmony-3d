import { ReadonlyVec4, vec4 } from 'gl-matrix';
import { createElement, createShadowRoot, defineHarmonyColorPicker, hide, HTMLHarmonyColorPickerElement, show } from 'harmony-ui';
import interactionCSS from '../css/interaction.css';
import { FileSelectorFile } from './fileselector/file';
import { FileSelector } from './fileselector/fileselector';
export { FileSelector } from './fileselector/fileselector';

const DATALIST_ID = 'interaction-datalist';

export class Interaction {
	static #htmlColorPicker?: HTMLHarmonyColorPickerElement;
	static #shadowRoot?: ShadowRoot;
	static #htmlInner?: HTMLElement;
	static #htmlInput?: HTMLInputElement;
	static #htmlInputDataList?: HTMLDataListElement;
	static #htmlFileSelector?: HTMLElement;
	static #htmlColorPickeronChange?: (color: any) => void;
	static #htmlColorPickerCancel?: () => void;
	static #enableClosing = false;

	static #initHTML(): HTMLElement {
		if (this.#shadowRoot) {
			return this.#shadowRoot.host as HTMLElement;
		}

		this.#shadowRoot = createShadowRoot('div', {
			parent: document.body,
			hidden: true,
			adoptStyle: interactionCSS,
			child: this.#htmlInner = createElement('div', {
				class: 'inner',
				$click: (event: Event) => event.stopPropagation(),
			}),
		});

		document.body.addEventListener('click', (event: Event) => { if (this.#enableClosing) { this.hide() } });

		defineHarmonyColorPicker();
		this.#htmlColorPicker = createElement('harmony-color-picker', {
			parent: this.#htmlInner,
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
		}) as HTMLHarmonyColorPickerElement;

		this.#htmlInput = createElement('input', {
			style: 'pointer-events: all;',
			list: DATALIST_ID,
			parent: this.#htmlInner,
			hidden: true,
		}) as HTMLInputElement;

		this.#htmlInputDataList = createElement('datalist', {
			id: DATALIST_ID,
			parent: this.#htmlInner,
		}) as HTMLDataListElement;


		this.#htmlFileSelector = createElement('div', {
			style: 'pointer-events: all;width: 100%;overflow: auto;height: 100%;',
		});

		return this.#shadowRoot.host as HTMLElement;
	}

	static show(): void {
		show(this.#initHTML());
		hide(this.#htmlInput);
		hide(this.#htmlColorPicker);
		// Debounce
		this.#enableClosing = false;
		setTimeout(() => this.#enableClosing = true, 0);
	}

	static hide(): void {
		hide(this.#shadowRoot?.host as (HTMLElement | undefined));
	}

	static getColor(x: number, y: number, defaultValue?: ReadonlyVec4 | null, onChange?: (color: vec4) => void, onCancel?: () => void): void {
		this.show();
		//this.#htmlColorPicker.setOptions({alpha:false});
		if (defaultValue) {
			this.#htmlColorPicker?.setRgba((defaultValue as [number, number, number, number]));
		}
		show(this.#htmlColorPicker);

		/*
		let promiseResolve: (value: vec4) => void;

		const promise = new Promise<vec4>(resolve => {
			promiseResolve = resolve;
		});
		*/
		/*
		this.#htmlColorPickeronDone = (color) => {
			let rgba = color.rgba;
			let c = vec4.fromValues(rgba[0] / 255, rgba[1] / 255, rgba[2] / 255, 1.0);
			//console.error(color, color.rgba);
			promiseResolve(c);
			this.hide();
		};
		*/
		this.#htmlColorPickeronChange = (color): void => {
			const rgba = color.rgba;
			const c = vec4.fromValues(rgba[0], rgba[1], rgba[2], rgba[3]);
			if (onChange) {
				onChange(c);
			}
		};
		this.#htmlColorPickerCancel = (): void => {
			if (onCancel) {
				onCancel();
			}
		};

		return;
	}

	static getString(x: number, y: number, list: Set<string> | string[] | Map<string, string> | MapIterator<string>, defaultValue?: string): Promise<string> {
		this.show();
		show(this.#htmlInput);
		(this.#htmlInput as HTMLInputElement).value = defaultValue ? defaultValue : '';
		if (list) {
			const isMap = list.constructor.name == 'Map';
			(this.#htmlInputDataList as HTMLDataListElement).innerText = '';
			for (const value of list) {
				const animOption = document.createElement('option');
				(this.#htmlInputDataList as HTMLDataListElement).append(animOption);
				if (isMap) {
					animOption.innerText = value[0];
					animOption.value = value[1];
				} else {
					animOption.innerText = value as string;
					animOption.value = value as string;
				}
			}
		}

		let promiseResolve: (value: string) => void;
		(this.#htmlInput as HTMLInputElement).onchange = (event): void => {
			for (const option of (this.#htmlInputDataList as HTMLDataListElement).options) {
				if (option.value == (event.target as HTMLInputElement).value) {
					promiseResolve(option.value);
				}
			}
			hide(this.#htmlInput);
		}


		const promise = new Promise<string>(resolve => {
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

	static selectFile(htmlContainer: HTMLElement, fileList: FileSelectorFile, callback: (repository: string, modelName: string) => void): void {
		this.#initHTML();
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
		const fileSelector: FileSelector = document.createElement('file-selector') as FileSelector;//TODO: create only once
		htmlContainer.append(fileSelector);
		fileSelector.fileList = fileList;
		fileSelector.addEventListener('fileSelected', event => {
			const file = (event as CustomEvent).detail.file;
			callback(file.root, file.path + file.name);
		});
	}

	static get htmlElement(): HTMLElement {
		return this.#shadowRoot?.host as (HTMLElement | undefined) ?? this.#initHTML();
	}
}
