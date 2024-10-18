import { createElement } from 'harmony-ui';
import { SaveFile } from 'harmony-browser-utils';

import { Input } from './input';
import { Output } from './output';

import { RenderTarget } from '../textures/rendertarget';
import { imageDataToImage } from '../utils/imagedata';
import { generateRandomUUID } from '../math/functions';
import { VTFWriter, VTFFile } from '../sourceengine/source1/textures/vtfwriter'
import { TEXTUREFLAGS_EIGHTBITALPHA, TEXTUREFLAGS_NOMIP } from '../sourceengine/source1/textures/vtfconstants'

import { GL_UNSIGNED_BYTE, GL_RGBA } from '../webgl/constants';
import { NodeImageEditor } from './nodeimageeditor';
import { Graphics } from '../graphics/graphics';
import { Material } from '../materials/material';
import { NodeParam } from './nodeparam';

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
	inputs = new Map();
	outputs = new Map();
	params = new Map<string, NodeParam>();
	previewPic = new Image(PREVIEW_PICTURE_SIZE, PREVIEW_PICTURE_SIZE);
	#previewSize = PREVIEW_PICTURE_SIZE;
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
		let input = new Input(this, inputId, inputType, size);
		this.inputs.set(inputId, input);
		this.invalidate();
		return input;
	}

	addOutput(outputId, outputType) {
		let output = new Output(this, outputId, outputType);
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

	async operate() {
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
		let p = this.params.get(paramName);
		if (p) {
			return p.value;
		}
		return null;
	}

	setParams(params?: any) {
		if (params) {
			for (let paramName in params) {
				let param = params[paramName];
				let p = this.params.get(paramName);
				if (p) {
					p.value = param;
				}
			}
			this.invalidate();
		}
	}

	setParam(paramName, paramValue, paramIndex?) {
		let p = this.params.get(paramName);
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
		let input = this.inputs.get(inputId);
		let output = predecessor.outputs.get(predecessorOutputId);

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
			for (let output of this.outputs.values()) {
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

	async redraw() {
		await this.operate();
		this.#redrawState = DrawState.Valid;
	}

	getInputCount() {
		return this.inputs.size;
	}

	activate() {
		throw 'fix me';
		/*
		NodeImageEditor.setFinalNode(this);
		if (this.#operation && this.#operation.neededPoints) {
			NodeImageEditor.setNeededPoints(this.#operation.neededPoints, this.#operation.proportional);
			if (!this.params.points) {
				this.params.points = [];
				for (var i = 0; i < this.#operation.neededPoints; i++) {
					this.params.points.push(vec2.create());
				}
			}
			NodeImageEditor.setPoints(this.params.points);
		} else {
			NodeImageEditor.setNeededPoints(0);
		}
			*/
	}

	remove(simpleWebGl) {
		throw 'fix me';
		/*
		var inputList = this.inputs;
		for (var inputIndex = 0; inputIndex < inputList.length; inputIndex++) {
			delete inputList[inputIndex]
		}
		if (this.output.outputTexture) {
			if (!NodeImageEditor.deleteTextureOnce) {
				simpleWebGl.deleteTexture(this.output.outputTexture);
				NodeImageEditor.deleteTextureOnce = true;
			}
		}

		if (this.#operation && this.#operation.cleanup) {
			this.#operation.cleanup(simpleWebGl);
		}
			*/
	}

	getType() {
		throw 'This function must be overriden';
	}

	ready() {
		let node = this;
		let promiseFunction = function (resolve, reject) {
			let callback = function () {
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
				let inputs = this.inputs;
				for (let i of inputs.values()) {
					if (!i.isValid(startingPoint)) {
						return false;
					}
				}
			}

		}
		return this.#redrawState == DrawState.Valid;
	}

	hasSuccessor() {
		for (let output of this.outputs.values()) {
			if (output.hasSuccessor()) {
				return true;
			}
		}
		return false;
	}

	successorsLength() {
		let max = 0;
		for (let output of this.outputs.values()) {
			let l = output.successorsLength();
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

	protected updatePreview() {
		let previewSize = this.#previewSize;
		let renderTarget2 = this.#previewRenderTarget ?? new RenderTarget({ width: previewSize, height: previewSize, depthBuffer: false, stencilBuffer: false });
		if (this.#previewRenderTarget) {
			renderTarget2.resize(previewSize, previewSize);
		}
		this.#previewRenderTarget = renderTarget2;
		Graphics.pushRenderTarget(renderTarget2);
		this.editor.render(this.material);

		let pixelArray = new Uint8ClampedArray(previewSize * previewSize * 4);
		Graphics.glContext.readPixels(0, 0, previewSize, previewSize, GL_RGBA, GL_UNSIGNED_BYTE, pixelArray);
		this.#pixelArray = new Uint8ClampedArray(pixelArray);

		//set alpha to 1
		for (let i = 3; i < pixelArray.length; i += 4) {
			pixelArray[i] = 255;
		}

		let imageData = new ImageData(pixelArray, previewSize, previewSize);
		try {
			imageDataToImage(imageData, this.previewPic);
		} catch (e) { }
		this.previewPic.width = previewSize;
		this.previewPic.height = previewSize;

		Graphics.popRenderTarget();
	}

	async savePicture() {
		this.#previewSize = 2048;
		await this.redraw();
		this.#previewSize = null;

		let image = this.previewPic;

		const canvas = createElement('canvas', { width: image.width, height: image.height });
		const ctx = canvas.getContext('2d');
		ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
		canvas.toBlob((blob) => SaveFile(new File([blob], 'texture.png')));//toDataURL
		//		SaveFile(new File([blob], 'texture.png'));
		this.previewPic.width = PREVIEW_PICTURE_SIZE;
		this.previewPic.height = PREVIEW_PICTURE_SIZE;
	}

	async saveVTF() {
		this.#previewSize = 2048;
		let vtfFile = new VTFFile(this.#previewSize, this.#previewSize);
		vtfFile.setFlag(TEXTUREFLAGS_EIGHTBITALPHA | TEXTUREFLAGS_NOMIP);
		await this.redraw();
		this.#previewSize = null;

		vtfFile.setImageData(this.#pixelArray);
		VTFWriter.writeAndSave(vtfFile, 'texture.vtf');
		this.previewPic.width = PREVIEW_PICTURE_SIZE;
		this.previewPic.height = PREVIEW_PICTURE_SIZE;
	}

	async toString(tabs = '') {
		let ret = [];
		let tabs1 = tabs + '\t';
		ret.push(tabs + this.constructor.name);
		for (let input of this.inputs.values()) {
			if (input.predecessor) {
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
