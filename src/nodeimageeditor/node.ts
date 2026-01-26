import { saveFile } from 'harmony-browser-utils';
import { createElement } from 'harmony-ui';
import { MyEventTarget } from 'harmony-utils';
import { Graphics } from '../graphics/graphics2';
import { Material } from '../materials/material';
import { generateRandomUUID } from '../math/functions';
import { TEXTUREFLAGS_EIGHTBITALPHA, TEXTUREFLAGS_NOMIP } from '../sourceengine/source1/textures/vtfconstants';
import { VTFFile, VTFWriter } from '../sourceengine/source1/textures/vtfwriter';
import { RenderTarget } from '../textures/rendertarget';
import { imageDataToImage } from '../utils/imagedata';
import { GL_RGBA, GL_UNSIGNED_BYTE } from '../webgl/constants';
import { Input } from './input';
import { NodeImageEditor } from './nodeimageeditor';
import { NodeParam, NodeParamArray, NodeParamScalar, NodeParamValue } from './nodeparam';
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

export enum NodeEventType {
	Any = '*',
	ParamAdded = 'paramadded',
	ParamChanged = 'paramchanged',
}

export type NodeEvent = {
	eventName?: string;
	value?: NodeParam;
}

export type NodeContext = {
	previewSize?: number;
	updatePreview?: boolean;
}

export class Node extends MyEventTarget<NodeEventType, CustomEvent<NodeEvent>> {
	#hasPreview = false;
	readonly id = generateRandomUUID();
	readonly editor: NodeImageEditor;
	readonly inputs = new Map<string, Input>();
	readonly outputs = new Map<string, Output>();
	readonly params = new Map<string, NodeParam>();
	readonly previewPic = new Image(PREVIEW_PICTURE_SIZE, PREVIEW_PICTURE_SIZE);
	previewSize: number = PREVIEW_PICTURE_SIZE;
	#previewRenderTarget?: RenderTarget;
	#redrawState: DrawState = DrawState.Invalid;
	//#operation;
	protected material?: Material;
	#pixelArray?: Uint8ClampedArray;

	constructor(editor: NodeImageEditor, params?: any) {
		super();
		this.editor = editor;
		this.setParams(params);
	}

	addInput(inputId: string, inputType: number/*TODO: create enum*/, size = 1) {
		const input = new Input(this, inputId, inputType, size);
		this.inputs.set(inputId, input);
		this.invalidate();
		return input;
	}

	addOutput(outputId: string, outputType: number/*TODO: create enum*/) {
		const output = new Output(this, outputId, outputType);
		this.outputs.set(outputId, output);
		this.invalidate();
		return output;
	}

	getInput(inputId: string) {
		return this.inputs.get(inputId);
	}

	getOutput(outputId: string) {
		return this.outputs.get(outputId);
	}

	async operate(context: NodeContext) {
		throw 'This function must be overriden';
	}

	addParam(param: NodeParam) {
		this.params.set(param.name, param);
		this.#dispatchEvent(NodeEventType.ParamAdded, param);
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

	setParam(paramName: string, paramValue: NodeParamValue, paramIndex?: number) {
		const p = this.params.get(paramName);
		if (p) {
			if (paramIndex !== undefined) {
				(p.value as NodeParamArray)[paramIndex] = paramValue as NodeParamScalar;
			} else {
				p.value = paramValue;
			}
			this.#dispatchEvent(NodeEventType.ParamChanged, p);
		}
	}

	setPredecessor(inputId: string, predecessor: Node, predecessorOutputId: string) {
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
	}

	async validate(context: NodeContext) {
		if (this.#redrawState == DrawState.Invalid) {
			await this.operate(context);
			this.#redrawState = DrawState.Valid
		}
	}

	async revalidate(context: NodeContext): Promise<void> {
		this.invalidate();
		await this.validate(context);
	}

	async redraw(context: NodeContext) {
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
		const promiseFunction = (resolve: (arg0: boolean) => void) => {
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
			/*
			if (this.#operation && this.#operation.isValid) {
				return this.#operation.isValid(startingPoint);
			} else {
			*/
			const inputs = this.inputs;
			for (const i of inputs.values()) {
				if (!i.isValid(startingPoint)) {
					return false;
				}
			}
			//}
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

	#dispatchEvent(eventName: NodeEventType, eventDetail: NodeParam) {
		this.dispatchEvent(new CustomEvent<NodeEvent>(eventName, { detail: { value: eventDetail } }));
		this.dispatchEvent(new CustomEvent<NodeEvent>(NodeEventType.Any, { detail: { eventName: eventName } }));
	}

	updatePreview(context: NodeContext = {}) {
		if (!context.updatePreview) {
			return;
		}
		const previewSize = context.previewSize ?? this.previewSize;
		const renderTarget2 = this.#previewRenderTarget ?? new RenderTarget({ width: previewSize, height: previewSize, depthBuffer: false, stencilBuffer: false });
		if (this.#previewRenderTarget) {
			renderTarget2.resize(previewSize, previewSize);
		}
		this.#previewRenderTarget = renderTarget2;
		Graphics.pushRenderTarget(renderTarget2);
		if (this.material) {
			this.editor.render(this.material, previewSize, previewSize);
		}

		const pixelArray = new Uint8ClampedArray(previewSize * previewSize * 4);
		Graphics.glContext.readPixels(0, 0, previewSize, previewSize, GL_RGBA, GL_UNSIGNED_BYTE, pixelArray);
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

		Graphics.popRenderTarget();
	}

	async savePicture(filename: string = 'texture.png'): Promise<void> {
		await this.redraw({ previewSize: 2048 });

		const image = this.previewPic;

		const canvas = createElement('canvas', { width: image.width, height: image.height }) as HTMLCanvasElement;
		const ctx = canvas.getContext('2d');
		if (!ctx) {
			return;
		}
		ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
		canvas.toBlob((blob) => {
			if (blob) {
				saveFile(new File([blob], filename));
			}
		});//toDataURL
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
