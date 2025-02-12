import { vec2 } from 'gl-matrix';
import { createElement, defineHarmony2dManipulator, defineHarmonyToggleButton, hide, HTMLHarmony2dManipulatorElement, HTMLHarmonyToggleButtonElement, ManipulatorDirection } from 'harmony-ui';
import { Graphics } from '../../graphics/graphics';
import { Node } from '../node';
import { ApplySticker } from '../operations/applysticker';
import { TextureLookup } from '../operations/texturelookup';
import { TextureManager } from '../../textures/texturemanager';
import { DEG_TO_RAD, RAD_TO_DEG } from '../../math/constants';
import { GL_TEXTURE_2D, GL_LINEAR, GL_CLAMP_TO_EDGE } from '../../webgl/constants';
import { NodeImageEditorGui } from './nodeimageeditorgui';
import { NodeParam, NodeParamType } from '../nodeparam';
import { contentCopySVG, dragPanSVG, panZoomSVG, rotateSVG, zoomInSVG, zoomOutSVG } from 'harmony-svg';
import { setTimeoutPromise } from 'harmony-utils';

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
				texture.setParameters(new Graphics().glContext, GL_TEXTURE_2D);

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
				texture.setParameters(new Graphics().glContext, GL_TEXTURE_2D);

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
	#htmlRectSelector: HTMLHarmony2dManipulatorElement;
	#drag: string;
	#htmlParamsContainer: HTMLElement;
	_ioGui = new Map();
	#refreshTimeout: number;
	#nodeChanged: () => void;
	#node: Node;
	#nodeImageEditorGui: NodeImageEditorGui;
	#dragStartClientX: number;
	#dragStartClientY: number;
	#htmlParams = new Map<string, HTMLElement | Array<HTMLElement>>();
	#htmlParamsValue = new Map<HTMLElement, HTMLInputElement>();

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

	#increasePreviewSize() {
		if (this.#node) {
			this.#node.previewSize *= 2;
			this.#node.updatePreview();
			this.#nodeImageEditorGui.refresh();
		}
	}

	#decreasePreviewSize() {
		if (this.#node) {
			this.#node.previewSize /= 2;
			this.#node.updatePreview();
			this.#nodeImageEditorGui.refresh();
		}
	}

	#initHtml() {
		let htmlInputs: HTMLElement;
		let htmlOutputs: HTMLElement;
		this.#html = createElement('div', {
			class: 'node-image-editor-node',
			childs: [
				createElement('div', {
					class: 'node-image-editor-node-header',
					childs: [
						createElement('div', { class: 'node-image-editor-node-title', innerText: this.#node.title }),
						createElement('div', {
							class: 'node-image-editor-node-buttons',
							childs: [
								createElement('div', {
									innerHTML: zoomOutSVG,
									events: {
										click: () => this.#decreasePreviewSize(),
									}
								}),
								createElement('div', {
									innerHTML: zoomInSVG,
									events: {
										click: () => this.#increasePreviewSize(),
									}
								}),
							]
						}),
					],
				}),
				createElement('div', {
					class: 'node-image-editor-node-content',
					childs: [
						htmlInputs = createElement('div', { class: 'node-image-editor-node-ios' }),
						this.#htmlParamsContainer = createElement('div', { class: 'node-image-editor-node-params' }),
						htmlOutputs = createElement('div', { class: 'node-image-editor-node-ios' }),
					],
				}),
			]
		});


		this.#htmlPreview = createElement('div', {
			class: 'node-image-editor-node-preview',
			child: this.#node.previewPic,
			events: {
				dragover: event => this.#handlePreviewDragOver(event),
			}
		});

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
		this.#initResizeObserver();
	}

	#initResizeObserver() {
		const callback: ResizeObserverCallback = (entries, observer) => {
			entries.forEach(entry => {
				this.#updateManipulator();
			});
		};
		const resizeObserver = new ResizeObserver(callback);
		resizeObserver.observe(this.#htmlPreview);
	}

	#refreshHtml() {
		this.#htmlParamsContainer.innerText = '';
		for (let [_, param] of this.#node.params) {
			if (param.length && param.length > 1) {
				for (let i = 0; i < param.length; ++i) {
					this.#htmlParamsContainer.append(this.#getParamHTML(param, i));
				}
			} else {
				this.#htmlParamsContainer.append(this.#getParamHTML(param));
			}
		}
	}

	#getParamHTML(param: NodeParam, index?: number): HTMLElement {
		let paramHtml: HTMLElement | Array<HTMLElement>;

		if (index === undefined) {
			paramHtml = this.#htmlParams.get(param.name) ?? this.#createParamHTML(param, index);
		} else {
			paramHtml = this.#htmlParams.get(param.name)?.[index] ?? this.#createParamHTML(param, index);
		}

		if (Array.isArray(paramHtml)) {
			paramHtml = paramHtml[index];
		}

		let value: any;
		if (index != undefined) {
			value = param.value[index];
		} else {
			value = param.value;
		}

		const valueHtml = this.#htmlParamsValue.get(paramHtml);

		switch (param.type) {
			case NodeParamType.Float:
			case NodeParamType.Degree:
				value = Number(value).toFixed(FLOAT_VALUE_DECIMALS);
				break;
			case NodeParamType.Radian:
				value = Number(value * RAD_TO_DEG).toFixed(FLOAT_VALUE_DECIMALS);
				break;
			case NodeParamType.Vec2:
				value = `${Number(value[0]).toFixed(FLOAT_VALUE_DECIMALS)} ${Number(value[1]).toFixed(FLOAT_VALUE_DECIMALS)}`;
				break;
			case NodeParamType.StickerAdjust:
				this.#updateManipulator();
				break;
		}


		if (valueHtml) {
			valueHtml.value = value;
		}
		return paramHtml;
	}

	#createParamHTML(param: NodeParam, index?: number): HTMLElement {
		let paramHtml = createElement('div', { class: 'node-image-editor-node-param' });
		let nameHtml = createElement('div', { parent: paramHtml });
		let valueHtml: HTMLInputElement;


		if (param.type != NodeParamType.StickerAdjust) {
			valueHtml = createElement('input', {
				parent: paramHtml,
				events: {
					change: (event) => this.#setParamValue(param, event.target.value, index)
				}
			}) as HTMLInputElement;
			createElement('span', {
				class: 'copy-button',
				parent: paramHtml,
				innerHTML: contentCopySVG,
				events: {
					click: async () => {
						await navigator.clipboard.writeText(valueHtml.value);
						valueHtml.classList.add('flash');
						await setTimeoutPromise(1500);
						valueHtml.classList.remove('flash');
					},
				}
			});
		}

		nameHtml.innerText = param.name;
		this.#htmlParamsValue.set(paramHtml, valueHtml);

		if (param.type == NodeParamType.StickerAdjust) {
			defineHarmony2dManipulator();
			defineHarmonyToggleButton();

			createElement('harmony-toggle-button', {
				class: 'sticker',
				parent: paramHtml,
				state: true,
				childs: [
					createElement('div', {
						slot: 'off',
						innerHTML: dragPanSVG,
					}),
					createElement('div', {
						slot: 'on',
						innerHTML: dragPanSVG,
					}),
				],
				events: {
					change: (event) => this.#htmlRectSelector.setMode({ translation: event.target.state ? ManipulatorDirection.All : ManipulatorDirection.None }),
				}
			}) as HTMLHarmonyToggleButtonElement;

			createElement('harmony-toggle-button', {
				class: 'sticker',
				parent: paramHtml,
				state: true,
				childs: [
					createElement('div', {
						slot: 'off',
						innerHTML: panZoomSVG,
					}),
					createElement('div', {
						slot: 'on',
						innerHTML: panZoomSVG,
					}),
				],
				events: {
					change: (event) => this.#htmlRectSelector.setMode({ resize: event.target.state ? ManipulatorDirection.All : ManipulatorDirection.None, scale: event.target.state ? ManipulatorDirection.All : ManipulatorDirection.None }),
				}
			}) as HTMLHarmonyToggleButtonElement;

			createElement('harmony-toggle-button', {
				class: 'sticker',
				parent: paramHtml,
				state: true,
				childs: [
					createElement('div', {
						slot: 'off',
						innerHTML: rotateSVG,
					}),
					createElement('div', {
						slot: 'on',
						innerHTML: rotateSVG,
					}),
				],
				events: {
					change: (event) => this.#htmlRectSelector.setMode({ rotation: event.target.state }),
				}
			}) as HTMLHarmonyToggleButtonElement;

			this.#htmlRectSelector = this.#htmlRectSelector ?? createElement('harmony-2d-manipulator', {
				class: 'node-image-editor-sticker-selector',
				parent: this.#htmlPreview,
				events: {
					updateend: (event: CustomEvent) => {
						const parameters = { 'top left': 0, 'bottom left': 2, 'top right': 1 };
						const manipulator = event.target as HTMLHarmony2dManipulatorElement;
						for (let name in parameters) {
							const param = this.#node.getParam(name);
							if (param) {
								const rect = this.#htmlPreview.getBoundingClientRect();
								const corner = manipulator.getCorner(parameters[name]);
								this.#setParamValue(param, `${corner.x / rect.width} ${corner.y / rect.width}`, undefined, false);
							}
						}
					},
				}
			}) as HTMLHarmony2dManipulatorElement;
			this.#updateManipulator();
		}

		if (index === undefined) {
			this.#htmlParams.set(param.name, paramHtml);
		} else {
			if (!this.#htmlParams.has(param.name)) {
				this.#htmlParams.set(param.name, []);
			}
			this.#htmlParams.get(param.name)[index] = paramHtml;
		}

		return paramHtml;
	}

	#updateManipulator() {
		const rect = this.#htmlPreview.getBoundingClientRect();
		const A = this.#node.getValue('top left') as vec2;
		const D = this.#node.getValue('bottom left') as vec2;
		const C = this.#node.getValue('top right') as vec2;

		if (!A || !D || !C) {
			return;
		}
		const AC = vec2.sub(vec2.create(), C, A);
		const AD = vec2.sub(vec2.create(), D, A);
		const B = vec2.add(vec2.create(), AC, D);

		const a1 = B[0] - A[0];
		const a2 = B[1] - A[1];
		const c1 = D[0] - C[0];
		const c2 = D[1] - C[1];

		const t = (a2 * C[0] - a2 * A[0] - a1 * C[1] + a1 * A[1]) / (-a2 * c1 + a1 * c2);

		const center = vec2.fromValues((C[0] + c1 * t) * rect.width, (C[1] + c2 * t) * rect.height);
		const width = vec2.len(AC) * rect.width;
		const height = vec2.len(AD) * rect.height;

		const angle = Math.atan2(AC[1], AC[0]);

		this.#htmlRectSelector.set({
			rotation: angle,
			left: center[0],
			top: center[1],
			width: width,
			height: height,
		});
	}

	#setParamValue(param: NodeParam, stringValue: string, index?: number, updateManipulator = true) {
		let node = this.#node;
		let value: any;
		switch (param.type) {
			case NodeParamType.Float:
			case NodeParamType.Degree:
				value = Number(Number(stringValue).toFixed(FLOAT_VALUE_DECIMALS));
				break;
			case NodeParamType.Radian:
				value = Number(stringValue) * DEG_TO_RAD;
				break;
			case NodeParamType.Vec2:
				let arr = stringValue.split(' ');
				value = vec2.fromValues(Number(arr[0]), Number(arr[1]));
				break;
			default:
				value = Number(stringValue);
		}

		if (updateManipulator && (param.name == 'top left' || param.name == 'bottom left' || param.name == 'top right')) {
			this.#updateManipulator();
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
