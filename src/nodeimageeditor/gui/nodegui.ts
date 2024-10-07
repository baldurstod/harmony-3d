import { vec2 } from 'gl-matrix';
import { createElement, hide } from 'harmony-ui';

import { Graphics } from '../../graphics/graphics';
import { NODE_PARAM_TYPE_FLOAT, NODE_PARAM_TYPE_RADIAN, NODE_PARAM_TYPE_DEGREE, NODE_PARAM_TYPE_VEC2, NODE_PARAM_TYPE_STICKER_ADJUST, Node } from '../node';
import { ApplySticker } from '../operations/applysticker';
import { TextureLookup } from '../operations/texturelookup';
import { TextureManager } from '../../textures/texturemanager';
import { DEG_TO_RAD, RAD_TO_DEG } from '../../math/constants';
import { GL_TEXTURE_2D, GL_LINEAR, GL_CLAMP_TO_EDGE } from '../../webgl/constants';
import { NodeImageEditorGui } from './nodeimageeditorgui';

export const DELAY_BEFORE_REFRESH = 100;
const FLOAT_VALUE_DECIMALS = 3;

function dropFiles(evt, node) {
	let files = evt.target.files; // FileList object

	// Loop through the FileList and render image files as thumbnails.
	for (let i = 0, f; f = files[i]; i++) {
		// Only process image files.
		if (!f.type.match('image.*')) {
			continue;
		}

		let reader = new FileReader();

		// Closure to capture the file information.
		reader.onload = (function (theFile) {
			return function (e) {
				let texture = TextureManager.createTexture({ minFilter: GL_LINEAR });

				if (node instanceof ApplySticker) {
					texture.wrapS = GL_CLAMP_TO_EDGE;
					texture.wrapT = GL_CLAMP_TO_EDGE;
				}
				texture.setParameters(Graphics.glContext, GL_TEXTURE_2D);

				const image = new Image();
				image.onload = () => {
					TextureManager.fillTextureWithImage(texture, image);
					node.inputTexture = texture;
					node.invalidate();
					node.validate();
				};
				image.src = e.target.result.toString();
			};
		})(f);

		// Read in the image file as a data URL.
		reader.readAsDataURL(f);
	}
}

function dropFilesSpecular(evt, node) {
	let files = evt.target.files; // FileList object

	// Loop through the FileList and render image files as thumbnails.
	for (let i = 0, f; f = files[i]; i++) {
		// Only process image files.
		if (!f.type.match('image.*')) {
			continue;
		}

		let reader = new FileReader();

		// Closure to capture the file information.
		reader.onload = (function (theFile) {
			return function (e) {
				let texture = TextureManager.createTexture({ minFilter: GL_LINEAR });

				if (node instanceof ApplySticker) {
					texture.wrapS = GL_CLAMP_TO_EDGE;
					texture.wrapT = GL_CLAMP_TO_EDGE;
				}
				texture.setParameters(Graphics.glContext, GL_TEXTURE_2D);

				const image = new Image();
				image.onload = () => {
					TextureManager.fillTextureWithImage(texture, image);
					node.getInput('specular').value = texture;
					//node.invalidate();
					node.validate();
				};
				image.src = e.target.result.toString();
			};
		})(f);

		// Read in the image file as a data URL.
		reader.readAsDataURL(f);
	}
}


export class NodeGui {
	#expanded = true;
	#html: HTMLElement;
	#htmlPreview: HTMLElement;
	#htmlRectSelector: HTMLElement;
	#drag: string;
	#htmlParams;
	_ioGui = new Map();
	#refreshTimeout: NodeJS.Timeout;
	#nodeChanged: () => void;
	#node: Node;
	#nodeImageEditorGui: NodeImageEditorGui;
	#dragStartClientX: number;
	#dragStartClientY: number;
	constructor(nodeImageEditorGui: NodeImageEditorGui, node: Node) {
		this.#nodeChanged = () => {
			clearTimeout(this.#refreshTimeout);
			this.#refreshTimeout = setTimeout(() => this.#refreshHtml(), DELAY_BEFORE_REFRESH);
		}
		this.#nodeImageEditorGui = nodeImageEditorGui;
		this.#node = node;
		this.#initHtml();
		this.#node.addEventListener('*', this.#nodeChanged);
	}

	set expanded(expanded) {
		this.#expanded = expanded;
		this.#html.classList[!expanded ? 'add' : 'remove']('collapsed');
	}

	get expanded() {
		return this.#expanded;
	}

	get node() {
		return this.#node;
	}

	get html() {
		return this.#html;
	}

	set nodeImageEditorGui(nodeImageEditorGui: NodeImageEditorGui) {
		this.#nodeImageEditorGui = nodeImageEditorGui;
	}

	#handlePreviewDragOver(event) {
		event.preventDefault();
		console.log(event);
		switch (this.#drag) {
			case 'move':
				this.#htmlRectSelector.style.top = event.offsetY - this.#dragStartClientY + 'px';
				this.#htmlRectSelector.style.left = event.offsetX - this.#dragStartClientX + 'px';

				break;
			default:

		}

	}

	#initHtml() {
		this.#html = createElement('div', { class: 'node-image-editor-node' });

		const htmlTitle = createElement('div', { class: 'node-image-editor-node-title', innerHTML: this.#node.title });

		this.#htmlPreview = createElement('div', {
			class: 'node-image-editor-node-preview',
			child: this.#node.previewPic,
			events: {
				dragover: event => this.#handlePreviewDragOver(event),
			}
		});

		const htmlContent = createElement('div', { class: 'node-image-editor-node-content' });
		this.#htmlParams = createElement('div', { class: 'node-image-editor-node-params' });

		const htmlInputs = createElement('div', { class: 'node-image-editor-node-ios' });
		const htmlOutputs = createElement('div', { class: 'node-image-editor-node-ios' });

		htmlContent.append(htmlInputs, this.#htmlParams, htmlOutputs);
		this.#html.append(htmlTitle, htmlContent);
		if (this.#node.hasPreview) {
			this.#html.append(this.#htmlPreview);
		}

		for (let input of this.#node.inputs.values()) {
			htmlInputs.append(this._createIo(input));
		}
		for (let output of this.#node.outputs.values()) {
			htmlOutputs.append(this._createIo(output));
		}

		if (this.#node.hasPreview) {
			let htmlSavePicture = createElement('button', { i18n: '#save_picture' });
			htmlSavePicture.addEventListener('click', () => this.#node.savePicture());
			this.#html.append(htmlSavePicture);

			let htmlSaveVTF = createElement('button', { i18n: '#save_vtf' });
			htmlSaveVTF.addEventListener('click', () => this.#node.saveVTF());
			this.#html.append(htmlSaveVTF);
		}

		if ((this.#node instanceof TextureLookup) || this.#node instanceof ApplySticker) {
			let inputImage = createElement('input', { type: 'file', accept: 'image/*' });
			inputImage.addEventListener('input', (event) => dropFiles(event, this.#node));

			this.#htmlPreview.addEventListener('click', (event) => { if (event.target == this.#node.previewPic) { inputImage.click() } });
		}
		if (this.#node instanceof ApplySticker) {
			let htmlLoadStickerSpecular = createElement('button', { i18n: '#load_sticker_specular' });
			this.#html.append(htmlLoadStickerSpecular);

			let inputImage = createElement('input', { type: 'file', accept: 'image/*' });
			inputImage.addEventListener('input', (event) => dropFilesSpecular(event, this.#node));

			htmlLoadStickerSpecular.addEventListener('click', () => inputImage.click());
		}
		this.#refreshHtml();
	}

	#refreshHtml() {
		this.#htmlParams.innerHTML = '';
		for (let [paramName, param] of this.#node.params) {
			if (param.length) {
				for (let i = 0; i < param.length; ++i) {
					this.#htmlParams.append(this.#createParamHtml(param, i));
				}
			} else {
				this.#htmlParams.append(this.#createParamHtml(param));
			}
		}
	}

	#createParamHtml(param, index?: number) {
		let paramHtml = createElement('div', { class: 'node-image-editor-node-param' });
		let nameHtml = createElement('div', { parent: paramHtml });
		let valueHtml = createElement('input', {
			parent: paramHtml,
			events: {
				change: (event) => this.#setParamValue(param, event.target.value, index)
			}
		});

		nameHtml.innerHTML = param.name;
		let value;
		if (index != undefined) {
			value = param.value[index];
		} else {
			value = param.value;
		}
		switch (param.type) {
			case NODE_PARAM_TYPE_FLOAT:
			case NODE_PARAM_TYPE_DEGREE:
				value = Number(value).toFixed(FLOAT_VALUE_DECIMALS);
				break;
			case NODE_PARAM_TYPE_RADIAN:
				value = Number(value * RAD_TO_DEG).toFixed(FLOAT_VALUE_DECIMALS);
				break;
			case NODE_PARAM_TYPE_VEC2:
				value = `${Number(value[0]).toFixed(FLOAT_VALUE_DECIMALS)} ${Number(value[1]).toFixed(FLOAT_VALUE_DECIMALS)}`;
				break;
			case NODE_PARAM_TYPE_STICKER_ADJUST:
				//value = `${Number(param.value[0]).toFixed(FLOAT_VALUE_DECIMALS)} ${Number(param.value[1]).toFixed(FLOAT_VALUE_DECIMALS)}`;
				hide(valueHtml);

				this.#htmlRectSelector = createElement('div', {
					class: 'node-image-editor-sticker-selector',
					parent: this.#htmlPreview,
					style: 'top:0px;width:10%;height:10%;',
					childs: [
						createElement('div', {
							class: 'handle-move',
							draggable: true,
							events: {
								dragstart: event => { this.#drag = 'move'; this.#dragStartClientX = event.offsetX; this.#dragStartClientY = event.offsetY; },
								dragend: (event) => this.#drag = null,
							}
						}),
					]
				});
				hide(this.#htmlRectSelector);

				break;
		}
		valueHtml.value = value;

		return paramHtml;
	}

	#setParamValue(param, stringValue: string, index) {
		let node = this.#node;
		let value: any;
		switch (param.type) {
			case NODE_PARAM_TYPE_FLOAT:
			case NODE_PARAM_TYPE_DEGREE:
				value = Number(Number(stringValue).toFixed(FLOAT_VALUE_DECIMALS));
				break;
			case NODE_PARAM_TYPE_RADIAN:
				value = Number(stringValue) * DEG_TO_RAD;
				break;
			case NODE_PARAM_TYPE_VEC2:
				let arr = stringValue.split(' ');
				value = vec2.fromValues(Number(arr[0]), Number(arr[1]));
				break;
			default:
				value = Number(stringValue);
		}

		node.setParam(param.name, value, index);
		node.invalidate();
		node.validate();
	}

	_createIo(io) {
		let html = createElement('div', { class: 'node-image-editor-node-io' });
		this._ioGui.set(io, html);
		return html;
	}
}
