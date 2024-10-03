import { vec3 } from 'gl-matrix';
import { createElement, toggle, hide, show } from 'harmony-ui';
import 'harmony-ui/dist/define/harmony-color-picker';
import { FileSelector } from './fileselector/fileselector';
export { FileSelector } from './fileselector/fileselector';

const DATALIST_ID = 'interaction-datalist';

export class Interaction {
	static #htmlColorPicker: HTMLElement;
	static #htmlElement: HTMLElement;
	static #htmlInput: HTMLInputElement;
	static #htmlInputDataList: HTMLDataListElement;
	static #htmlFileSelector: HTMLElement;
	static #htmlColorPickeronDone: (color: any) => void;
	static #htmlColorPickeronChange: (color: any) => void;
	static #htmlColorPickerCancel: () => void;
	static {
		this.#htmlElement = document.createElement('div');
		this.#htmlElement.style.cssText = 'position:absolute;width: 400px;z-index: 10000;top: 0px;left:0px;';

		/*this.#htmlColorPicker = new Picker(
			{
				parent: this.#htmlElement,
				popup:false
			});

		this.#htmlColorPicker.hide();*/
		this.#htmlColorPicker = createElement('harmony-color-picker', {
			parent: this.#htmlElement,
			hidden: true,
			events: {
				change: event => {
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
		document.body.append(this.#htmlElement);

		this.#htmlInput = document.createElement('input');
		this.#htmlInput.style.cssText = 'pointer-events: all;';
		this.#htmlInput.setAttribute('list', DATALIST_ID);
		this.#htmlInputDataList = document.createElement('datalist');
		this.#htmlInputDataList.id = DATALIST_ID;

		this.#htmlElement.append(this.#htmlInput, this.#htmlInputDataList, this.#htmlColorPicker);
		this.#htmlInput.style.display = 'none';

		this.#htmlFileSelector = document.createElement('div');
		this.#htmlFileSelector.style.cssText = 'pointer-events: all;width: 100%;overflow: auto;height: 100%;';
		//this.#htmlElement.append(this.#htmlFileSelector);
		//this.#htmlFileSelector.style.display = 'none';
		this.hide();
	}

	static show() {
		this.#htmlElement.style.display = '';
		this.#htmlInput.style.display = 'none';
		hide(this.#htmlColorPicker);
	}

	static hide() {
		this.#htmlElement.style.display = 'none';
	}

	static async getRGB(x, y, defaultValue, onChange, onCancel) {
		this.show();
		//this.#htmlColorPicker.setOptions({alpha:false});
		show(this.#htmlColorPicker);

		let promiseResolve;
		let promiseReject;

		let promise = new Promise((resolve, reject) => {
			promiseResolve = resolve;
			promiseReject = reject;
		});
		this.#htmlColorPickeronDone = (color) => {
			let rgba = color.rgba;
			let c = vec3.fromValues(rgba[0] / 255, rgba[1] / 255, rgba[2] / 255);
			//console.error(color, color.rgba);
			promiseResolve(c);
			this.hide();
		};
		this.#htmlColorPickeronChange = (color) => {
			let rgba = color.rgba;
			let c = vec3.fromValues(rgba[0], rgba[1], rgba[2]);
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

	static async getString(list, defaultValue?) {
		this.show();
		this.#htmlInput.style.display = '';
		this.#htmlInput.value = defaultValue ? defaultValue : '';
		if (list) {
			let isMap = list.constructor.name == 'Map';
			this.#htmlInputDataList.innerHTML = '';
			for (let value of list) {
				let animOption = document.createElement('option');
				this.#htmlInputDataList.append(animOption);
				if (isMap) {
					animOption.innerHTML = value[0];
					animOption.value = value[1];
				} else {
					animOption.innerHTML = value;
				}
			}
		}

		this.#htmlInput.onchange = (event) => {
			for (let option of this.#htmlInputDataList.options) {
				if (option.value == (event.target as HTMLInputElement).value) {
					promiseResolve(option.value);
				}
			}
			this.#htmlInput.style.display = 'none';
		}

		let promiseResolve;
		let promiseReject;

		let promise = new Promise((resolve, reject) => {
			promiseResolve = resolve;
			promiseReject = reject;
		});
		return promise;
	}

	static async _expandFile(parent, files, callback, repository = '', path = '') {
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
									this._expandFile(f1, file.files, callback, file.name);
								} else {
									this._expandFile(f1, file.files, callback, repository, path + file.name + '/');
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

	static async selectFile(htmlContainer, fileList, callback) {
		//htmlContainer.append(this.#htmlFileSelector);
		//this.show();
		//this.#htmlFileSelector.style.display = '';
		this.#htmlFileSelector.innerHTML = '';
		htmlContainer.innerHTML = '';

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

	static get htmlElement() {
		return this.#htmlElement;
	}
}
