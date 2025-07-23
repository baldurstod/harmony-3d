import { saveFile } from 'harmony-browser-utils';
import { createElement } from 'harmony-ui';
import { Graphics } from '../graphics/graphics';
import { Material } from '../materials/material';
import { generateRandomUUID } from '../math/functions';
import { TEXTUREFLAGS_EIGHTBITALPHA, TEXTUREFLAGS_NOMIP } from '../sourceengine/source1/textures/vtfconstants';
import { VTFFile, VTFWriter } from '../sourceengine/source1/textures/vtfwriter';
import { RenderTarget } from '../textures/rendertarget';
import { imageDataToImage } from '../utils/imagedata';
import { GL_RGBA, GL_UNSIGNED_BYTE } from '../webgl/constants';
import { Input } from './input';
import { NodeImageEditor } from './nodeimageeditor';
import { NodeParam } from './nodeparam';
import { Output } from './output';

enum DrawState {
	Invalid = 0,
	Valid,
}

export const NODE_PARAM_TYPE_INT = 1;
export const NODE_PARAM_TYPE_BOOL = 2;
export const NODE_PARAM_TYPE_FLOAT = 3;
export const NODE_PARAM_TYPE_RADIAN = 4;
export const NODE_PARAM_TYPE_DEGREE = 5;
export const NODE_PARAM_TYPE_STRING = 6;
export const NODE_PARAM_TYPE_VEC2 = 7;
export const NODE_PARAM_TYPE_STICKER_ADJUST = 8;

export const PREVIEW_PICTURE_SIZE = 256;

export class Node extends EventTarget {
	#hasPreview = false;
	id = generateRandomUUID();
	editor: NodeImageEditor;
	inputs = new Map<string, Input>();
	outputs = new Map<string, Output>();
	params = new Map<string, NodeParam>();
	previewPic = new Image(PREVIEW_PICTURE_SIZE, PREVIEW_PICTURE_SIZE);
	previewSize: number = PREVIEW_PICTURE_SIZE;
	#previewRenderTarget?: RenderTarget;
	autoRedraw = false;
	#redrawState: DrawState = DrawState.Invalid;
	#operation;
	protected material: Material;
	#pixelArray?: Uint8ClampedArray;

	constructor(editor: NodeImageEditor, params?: any) {
		super();
		this.editor = editor;
		this.setParams(params);
	}

	addInput(inputId, inputType, size = 1) {
		const input = new Input(this, inputId, inputType, size);
		this.inputs.set(inputId, input);
		this.invalidate();
		return input;
	}

	addOutput(outputId, outputType) {
		const output = new Output(this, outputId, outputType);
		this.outputs.set(outputId, output);
		this.invalidate();
		return output;
	}

	getInput(inputId) {
		return this.inputs.get(inputId);
	}

	getOutput(outputId) {
		return this.outputs.get(outputId);
	}

	async operate(context: any = {}) {
		throw 'This function must be overriden';
	}

	addParam(param: NodeParam) {
		this.params.set(param.name, param);
		this.#dispatchEvent('paramadded', param);
	}

	getParam(paramName: string) {
		return this.params.get(paramName);
	}

	getValue(paramName: string) {
		const p = this.params.get(paramName);
		if (p) {
			return p.value;
		}
		return null;
	}

	setParams(params?: any) {
		if (params) {
			for (const paramName in params) {
				const param = params[paramName];
				const p = this.params.get(paramName);
				if (p) {
					p.value = param;
				}
			}
			this.invalidate();
		}
	}

	setParam(paramName, paramValue, paramIndex?) {
		const p = this.params.get(paramName);
		if (p) {
			if (paramIndex != undefined) {
				p.value[paramIndex] = paramValue;
			} else {
				p.value = paramValue;
			}
			this.#dispatchEvent('paramchanged', p);
		}
	}

	setPredecessor(inputId, predecessor, predecessorOutputId) {
		const input = this.inputs.get(inputId);
		const output = predecessor.outputs.get(predecessorOutputId);

		if (input && output) {
			input.setPredecessor(output);
			this.invalidate();
		} else {
			console.error('Error : wrong predecessor', this, inputId, predecessor, predecessorOutputId);
		}
	}

	getParams() {
		return this.params;
	}

	invalidate() {
		// Invalidate only if valid to avoid recursion
		if (this.#redrawState != DrawState.Invalid) {
			this.#redrawState = DrawState.Invalid;
			for (const output of this.outputs.values()) {
				output.invalidate();
			}
		}
		if (this.autoRedraw) {
			this.redraw();
		}
	}

	async validate() {
		if (this.#redrawState == DrawState.Invalid) {
			await this.operate();
			this.#redrawState = DrawState.Valid
		}
	}

	async revalidate(): Promise<void> {
		this.invalidate();
		await this.validate();
	}

	async redraw(context: any = {}) {
		await this.operate(context);
		this.#redrawState = DrawState.Valid;
	}

	getInputCount() {
		return this.inputs.size;
	}

	getType() {
		throw 'This function must be overriden';
	}

	ready() {
		const node = this;
		const promiseFunction = resolve => {
			const callback = function () {
				if (node.isValid()) {
					resolve(true);
				} else {
					setTimeout(callback, 100);
				}
			}
			callback();
		}
		return new Promise(promiseFunction);
	}

	isValid(startingPoint?: Node) {
		if (startingPoint == this) {
			return true; // handle cyclic operation
		}
		startingPoint = startingPoint || this;
		if (this.#redrawState == DrawState.Valid) {
			if (this.#operation && this.#operation.isValid) {
				return this.#operation.isValid(startingPoint);
			} else {
				const inputs = this.inputs;
				for (const i of inputs.values()) {
					if (!i.isValid(startingPoint)) {
						return false;
					}
				}
			}

		}
		return this.#redrawState == DrawState.Valid;
	}

	hasSuccessor() {
		for (const output of this.outputs.values()) {
			if (output.hasSuccessor()) {
				return true;
			}
		}
		return false;
	}

	successorsLength() {
		let max = 0;
		for (const output of this.outputs.values()) {
			const l = output.successorsLength();
			if (l > max) {
				max = l;
			}
		}
		return max;
	}

	get title(): string {
		throw 'This function must be overriden';
	}

	#dispatchEvent(eventName, eventDetail) {
		this.dispatchEvent(new CustomEvent(eventName, { detail: { value: eventDetail } }));
		this.dispatchEvent(new CustomEvent('*', { detail: { eventName: eventName } }));
	}

	updatePreview(context: any = {}) {
		const previewSize = context.previewSize ?? this.previewSize;
		const renderTarget2 = this.#previewRenderTarget ?? new RenderTarget({ width: previewSize, height: previewSize, depthBuffer: false, stencilBuffer: false });
		if (this.#previewRenderTarget) {
			renderTarget2.resize(previewSize, previewSize);
		}
		this.#previewRenderTarget = renderTarget2;
		new Graphics().pushRenderTarget(renderTarget2);
		this.editor.render(this.material);

		const pixelArray = new Uint8ClampedArray(previewSize * previewSize * 4);
		new Graphics().glContext.readPixels(0, 0, previewSize, previewSize, GL_RGBA, GL_UNSIGNED_BYTE, pixelArray);
		this.#pixelArray = new Uint8ClampedArray(pixelArray);

		//set alpha to 1
		for (let i = 3; i < pixelArray.length; i += 4) {
			pixelArray[i] = 255;
		}

		const imageData = new ImageData(pixelArray, previewSize, previewSize);
		try {
			imageDataToImage(imageData, this.previewPic);
		} catch (e) { }
		this.previewPic.width = previewSize;
		this.previewPic.height = previewSize;

		new Graphics().popRenderTarget();
	}

	async savePicture(filename: string = 'texture.png') {
		await this.redraw({ previewSize: 2048 });

		const image = this.previewPic;

		const canvas = createElement('canvas', { width: image.width, height: image.height }) as HTMLCanvasElement;
		const ctx = canvas.getContext('2d');
		ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
		canvas.toBlob((blob) => saveFile(new File([blob], filename)));//toDataURL
		//		saveFile(new File([blob], 'texture.png'));
		this.previewPic.width = PREVIEW_PICTURE_SIZE;
		this.previewPic.height = PREVIEW_PICTURE_SIZE;
	}

	async saveVTF(filename: string = 'texture.vtf') {
		if (!this.#pixelArray) {
			return;
		}
		const vtfFile = new VTFFile(2048, 2048);
		vtfFile.setFlag(TEXTUREFLAGS_EIGHTBITALPHA | TEXTUREFLAGS_NOMIP);
		await this.redraw({ previewSize: 2048 });

		vtfFile.setImageData(this.#pixelArray);
		VTFWriter.writeAndSave(vtfFile, filename);
		this.previewPic.width = PREVIEW_PICTURE_SIZE;
		this.previewPic.height = PREVIEW_PICTURE_SIZE;
	}

	async toString(tabs = '') {
		const ret = [];
		const tabs1 = tabs + '\t';
		ret.push(tabs + this.constructor.name);
		for (const input of this.inputs.values()) {
			if (input.getPredecessor()) {
				ret.push(await input.toString(tabs1));
			}
		}
		return ret.join('\n');
	}

	dispose() {
		if (this.#previewRenderTarget) {
			this.#previewRenderTarget.dispose();
		}
		this.outputs.forEach((output) => output.dispose());
		this.outputs.clear();
	}

	set hasPreview(hasPreview) {
		this.#hasPreview = hasPreview;
	}

	get hasPreview() {
		return this.#hasPreview;
	}
}
