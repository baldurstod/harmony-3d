import { vec2, vec3 } from 'gl-matrix';
import { contentCopySVG, dragPanSVG, panZoomSVG, rotateSVG, zoomInSVG, zoomOutSVG } from 'harmony-svg';
import { createElement, defineHarmony2dManipulator, defineHarmonyToggleButton, HTMLHarmony2dManipulatorElement, HTMLHarmonyToggleButtonElement, ManipulatorDirection } from 'harmony-ui';
import { setTimeoutPromise } from 'harmony-utils';
import { Graphics } from '../../graphics/graphics';
import { DEG_TO_RAD, RAD_TO_DEG } from '../../math/constants';
import { TextureManager } from '../../textures/texturemanager';
import { GL_CLAMP_TO_EDGE, GL_LINEAR, GL_TEXTURE_2D } from '../../webgl/constants';
import { Input } from '../input';
import { Node } from '../node';
import { NodeParam, NodeParamArray, NodeParamType } from '../nodeparam';
import { ApplySticker } from '../operations/applysticker';
import { TextureLookup } from '../operations/texturelookup';
import { Output } from '../output';
import { NodeImageEditorGui } from './nodeimageeditorgui';

export const DELAY_BEFORE_REFRESH = 100;
const FLOAT_VALUE_DECIMALS = 3;

function dropFiles(evt: DragEvent, node: Node): void {
	const files = (evt.target as HTMLInputElement).files; // FileList object
	if (!files) {
		return;
	}

	// Loop through the FileList and render image files as thumbnails.
	for (let i = 0, f; f = files[i]; i++) {
		// Only process image files.
		if (!f.type.match('image.*')) {
			continue;
		}

		const reader = new FileReader();

		// Closure to capture the file information.
		reader.onload = (function (theFile) {
			return function (e) {
				const texture = TextureManager.createTexture({ minFilter: GL_LINEAR });

				if (node instanceof ApplySticker) {
					texture.wrapS = GL_CLAMP_TO_EDGE;
					texture.wrapT = GL_CLAMP_TO_EDGE;
				}
				texture.setParameters(Graphics.glContext, GL_TEXTURE_2D);

				const image = new Image();
				image.onload = () => {
					TextureManager.fillTextureWithImage(texture, image);
					(node as ApplySticker | TextureLookup).inputTexture = texture;
					node.invalidate();
					node.validate();
				};
				image.src = (e.target as FileReader).result?.toString() ?? '';
			};
		})(f);

		// Read in the image file as a data URL.
		reader.readAsDataURL(f);
	}
}

function dropFilesSpecular(evt: DragEvent, node: Node): void {
	const files = (evt.target as HTMLInputElement).files; // FileList object
	if (!files) {
		return;
	}

	// Loop through the FileList and render image files as thumbnails.
	for (let i = 0, f; f = files[i]; i++) {
		// Only process image files.
		if (!f.type.match('image.*')) {
			continue;
		}

		const reader = new FileReader();

		// Closure to capture the file information.
		reader.onload = (function (theFile) {
			return function (e) {
				const texture = TextureManager.createTexture({ minFilter: GL_LINEAR });

				if (node instanceof ApplySticker) {
					texture.wrapS = GL_CLAMP_TO_EDGE;
					texture.wrapT = GL_CLAMP_TO_EDGE;
				}
				texture.setParameters(Graphics.glContext, GL_TEXTURE_2D);

				const image = new Image();
				image.onload = () => {
					TextureManager.fillTextureWithImage(texture, image);
					const specular = node.getInput('specular');
					if (specular) {
						specular.value = texture;
					}
					//node.invalidate();
					node.validate();
				};
				image.src = (e.target as FileReader).result?.toString() ?? '';
			};
		})(f);

		// Read in the image file as a data URL.
		reader.readAsDataURL(f);
	}
}

export enum FlipDirection {
	FlipUp = 0,
	FlipDown,
	FlipLeft,
	FlipRight,
	FlipX,
	FlipY,
}

export class NodeGui {
	#expanded = true;
	#html!: HTMLElement;
	#htmlPreview!: HTMLElement;
	#htmlRectSelector!: HTMLHarmony2dManipulatorElement;
	#drag: string = '';
	#htmlParamsContainer!: HTMLElement;
	_ioGui = new Map<Input | Output, HTMLElement>();// TODO: set private
	#refreshTimeout: number = 0;
	#nodeChanged: () => void;
	#node: Node;
	#nodeImageEditorGui: NodeImageEditorGui;
	#dragStartClientX: number = 0;
	#dragStartClientY: number = 0;
	#htmlParams = new Map<string, HTMLElement | HTMLElement[]>();
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

	#handlePreviewDragOver(event: DragEvent) {
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
				dragover: (event: DragEvent) => this.#handlePreviewDragOver(event),
			}
		});

		if (this.#node.hasPreview) {
			this.#html.append(this.#htmlPreview);
		}

		for (const input of this.#node.inputs.values()) {
			htmlInputs.append(this.#createIo(input));
		}
		for (const output of this.#node.outputs.values()) {
			htmlOutputs.append(this.#createIo(output));
		}

		if (this.#node.hasPreview) {
			const htmlSavePicture = createElement('button', { i18n: '#save_picture' });
			htmlSavePicture.addEventListener('click', () => this.#node.savePicture());
			this.#html.append(htmlSavePicture);

			const htmlSaveVTF = createElement('button', { i18n: '#save_vtf' });
			htmlSaveVTF.addEventListener('click', () => this.#node.saveVTF());
			this.#html.append(htmlSaveVTF);
		}

		if ((this.#node instanceof TextureLookup) || this.#node instanceof ApplySticker) {
			const inputImage = createElement('input', { type: 'file', accept: 'image/*' });
			inputImage.addEventListener('input', (event) => dropFiles(event as DragEvent, this.#node));

			this.#htmlPreview.addEventListener('click', (event) => { if (event.target == this.#node.previewPic) { inputImage.click() } });
		}
		if (this.#node instanceof ApplySticker) {
			const htmlLoadStickerSpecular = createElement('button', { i18n: '#load_sticker_specular' });
			this.#html.append(htmlLoadStickerSpecular);

			const inputImage = createElement('input', { type: 'file', accept: 'image/*' });
			inputImage.addEventListener('input', (event) => dropFilesSpecular(event as DragEvent, this.#node));

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
		for (const [_, param] of this.#node.params) {
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
		let paramHtml: HTMLElement | HTMLElement[];

		if (index === undefined) {
			paramHtml = this.#htmlParams.get(param.name) ?? this.#createParamHTML(param, index);
		} else {
			paramHtml = (this.#htmlParams.get(param.name) as HTMLElement[])?.[index] ?? this.#createParamHTML(param, index);
		}

		if (Array.isArray(paramHtml)) {
			paramHtml = paramHtml[index!]!;
		}

		let value: any;
		if (index !== undefined) {
			value = (param.value as NodeParamArray)[index];
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
		const paramHtml = createElement('div', { class: 'node-image-editor-node-param' });
		const nameHtml = createElement('div', { parent: paramHtml, class: 'name' });
		let valueHtml: HTMLInputElement;


		if (param.type != NodeParamType.StickerAdjust) {
			valueHtml = createElement('input', {
				parent: paramHtml,
				events: {
					change: (event: Event) => this.#setParamValue(param, (event.target as HTMLInputElement).value, index)
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
			this.#htmlParamsValue.set(paramHtml, valueHtml);
		}

		nameHtml.innerText = param.name;

		if (param.type == NodeParamType.StickerAdjust) {
			defineHarmony2dManipulator();
			defineHarmonyToggleButton();

			createElement('div', {
				parent: paramHtml,
				childs: [
					createElement('div', {
						childs: [
							createElement('div', {
								childs: [
									createElement('button', {
										i18n: '#flip_up',
										class: 'sticker',
										$click: () => this.#flipSticker(FlipDirection.FlipUp),
									}),
									createElement('button', {
										i18n: '#flip_down',
										class: 'sticker',
										$click: () => this.#flipSticker(FlipDirection.FlipDown),
									}),
								],
							}),
							createElement('div', {
								childs: [
									createElement('button', {
										i18n: '#flip_left',
										class: 'sticker',
										$click: () => this.#flipSticker(FlipDirection.FlipLeft),
									}),
									createElement('button', {
										i18n: '#flip_right',
										class: 'sticker',
										$click: () => this.#flipSticker(FlipDirection.FlipRight),
									}),
								]
							}),
						],
					}),
					createElement('div', {
						childs: [


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
									change: (event: Event) => this.#htmlRectSelector.setMode({ translation: (event.target as HTMLHarmonyToggleButtonElement).state ? ManipulatorDirection.All : ManipulatorDirection.None }),
								}
							}) as HTMLHarmonyToggleButtonElement,

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
									change: (event: Event) => this.#htmlRectSelector.setMode({
										resize: (event.target as HTMLHarmonyToggleButtonElement).state ? ManipulatorDirection.All : ManipulatorDirection.None,
										scale: (event.target as HTMLHarmonyToggleButtonElement).state ? ManipulatorDirection.All : ManipulatorDirection.None,
									}),
								}
							}) as HTMLHarmonyToggleButtonElement,

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
									change: (event: Event) => this.#htmlRectSelector.setMode({ rotation: (event.target as HTMLHarmonyToggleButtonElement).state }),
								}
							}) as HTMLHarmonyToggleButtonElement,
						],
					}),
				],
			});

			this.#htmlRectSelector = this.#htmlRectSelector ?? createElement('harmony-2d-manipulator', {
				class: 'node-image-editor-sticker-selector',
				parent: this.#htmlPreview,
				events: {
					updateend: (event: CustomEvent) => {
						const parameters: Record<string, number> = { 'top left': 0, 'bottom left': 2, 'top right': 1 };
						const manipulator = event.target as HTMLHarmony2dManipulatorElement;
						for (const name in parameters) {
							const param = this.#node.getParam(name);
							if (param) {
								const rect = this.#htmlPreview.getBoundingClientRect();
								const corner = manipulator.getCorner(parameters[name]!);
								this.#setParamValue(param, `${corner.x / rect.width} ${corner.y / rect.width}`, undefined, false);
							}
						}
					},
				},
				attributes: {
					'min-width': "-Infinity",
					'min-height': "-Infinity",
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
			(this.#htmlParams.get(param.name) as HTMLElement[])[index] = paramHtml;
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

		const cross = vec2.cross(vec3.create(), AD, AC);
		const flip = cross[2] > 0
		const center = vec2.fromValues((C[0] + c1 * t) * rect.width, (C[1] + c2 * t) * rect.height);
		const width = vec2.len(AC) * rect.width * (flip ? -1 : 1);
		const height = vec2.len(AD) * rect.height;

		const angle = Math.atan2(AC[1], AC[0]) + (flip ? Math.PI : 0);

		this.#htmlRectSelector.set({
			rotation: angle,
			left: center[0],
			top: center[1],
			width: width,
			height: height
		});
	}

	#setParamValue(param: NodeParam, stringValue: string, index?: number, updateManipulator = true) {
		const node = this.#node;
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
				const arr = stringValue.split(' ');
				value = vec2.fromValues(Number(arr[0]), Number(arr[1]));
				break;
			default:
				value = Number(stringValue);
		}

		if (updateManipulator && (param.name == 'top left' || param.name == 'bottom left' || param.name == 'top right')) {
			this.#updateManipulator();
		}

		node.setParam(param.name, value, index);
		node.revalidate();
	}

	#createIo(io: Input | Output) {
		const html = createElement('div', { class: 'node-image-editor-node-io' });
		this._ioGui.set(io, html);
		return html;
	}

	#flipSticker(flip: FlipDirection): void {
		const topLeft = vec2.copy(vec2.create(), this.#node.getValue('top left') as vec2);
		const bottomLeft = vec2.copy(vec2.create(), this.#node.getValue('bottom left') as vec2);
		const topRight = vec2.copy(vec2.create(), this.#node.getValue('top right') as vec2);


		const newTopLeft = vec2.copy(vec2.create(), topLeft);
		const newBottomLeft = vec2.copy(vec2.create(), bottomLeft);
		const newTopRight = vec2.copy(vec2.create(), topRight);

		let delta: number;
		const top = vec2.sub(vec2.create(), topRight, topLeft);
		const left = vec2.sub(vec2.create(), bottomLeft, topLeft);
		const bottomRight = vec2.add(vec2.create(), top, bottomLeft);

		const topN = vec2.normalize(vec2.create(), top);
		const leftN = vec2.normalize(vec2.create(), left);

		switch (flip) {
			case FlipDirection.FlipUp:
				//delta = bottomLeft[1] - topLeft[1];
				//newBottomLeft[1] = topLeft[1] - delta;
				const DA = vec2.sub(vec2.create(), topLeft, bottomLeft);
				//const n1 = vec2.multiply(vec2.create(), vec2.dot(DA, topN));
				const v = vec2.scaleAndAdd(vec2.create(), DA, topN, -2 * vec2.dot(DA, topN));

				vec2.add(newBottomLeft, topLeft, v);

				//newBottomLeft[1] = topLeft[1] - delta;

				break;
			case FlipDirection.FlipDown:


				const AD = vec2.sub(vec2.create(), bottomLeft, topLeft);
				const v1 = vec2.scaleAndAdd(vec2.create(), AD, topN, -2 * vec2.dot(AD, topN));
				vec2.add(newTopLeft, bottomLeft, v1);
				vec2.add(newTopRight, bottomRight, v1);



				/*
				delta = bottomLeft[1] - topLeft[1];
				newTopLeft[1] = bottomLeft[1] + delta;
				newTopRight[1] = bottomLeft[1] + delta;
				*/
				break;
			case FlipDirection.FlipLeft:
				const CA = vec2.sub(vec2.create(), topLeft, topRight);
				const v2 = vec2.scaleAndAdd(vec2.create(), CA, leftN, -2 * vec2.dot(CA, leftN));
				vec2.add(newTopRight, topLeft, v2);
				//vec2.add(newTopRight, bottomRight, v1);
				break;
			case FlipDirection.FlipRight:
				const AC = vec2.sub(vec2.create(), topRight, topLeft);
				const v3 = vec2.scaleAndAdd(vec2.create(), AC, leftN, -2 * vec2.dot(AC, leftN));
				vec2.add(newTopLeft, topRight, v3);
				vec2.add(newBottomLeft, bottomRight, v3);
				break;
		}

		/*

				newTopLeft[1] = bottomLeft[1];
				newBottomLeft[1] = topLeft[1];
				newTopRight[1] = bottomLeft[1];
				*/


		//this.#setParamValue(param, `${corner.x / rect.width} ${corner.y / rect.width}`, undefined, false);
		const node = this.#node;
		node.setParam('top left', newTopLeft);
		node.setParam('bottom left', newBottomLeft);
		node.setParam('top right', newTopRight);

		this.#updateManipulator();
		node.revalidate();

		/*

		this.#htmlRectSelector.set({
			width: -0.06,
		});
		*/

	}
}
