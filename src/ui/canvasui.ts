import { createElement, createShadowRoot } from 'harmony-ui';
import canvasUiCSS from '../css/canvasui.css';
import { CanvasAttributes } from '../graphics/graphics';
import { Graphics } from '../graphics/graphics2';

export type CanvasUiParams = {
	canvas?: CanvasAttributes | string;
	params?: CanvasUiParam[];
};

export enum CanvasUiType {
	Integer,
	Float,
	String,
	Boolean,
}

export interface CanvasUiValue { };

export type CanvasUiParam = {
	name: string,
	label: string,
	type: CanvasUiType,
	value?: CanvasUiValue,
	humanReadable?: boolean,
};

type CanvasUiParamInternal = {
	param: CanvasUiParam,
	element: HTMLElement,
};

export class CanvasUi {
	#top = 0;
	#left = 0;
	#width = 100;
	#height = 100;
	#canvas?: CanvasAttributes;
	//#html: HTMLElement;
	#shadowRoot: ShadowRoot;
	#params = new Map<string, CanvasUiParamInternal>();

	constructor(params: CanvasUiParams = {}) {
		//this.#html = createElement('div');
		this.#shadowRoot = createShadowRoot('div', {
			adoptStyle: canvasUiCSS,
			childs: [
				createElement('div'),
			],
		});

		if (params.canvas) {
			this.setCanvas(params.canvas);
		}
		if (params.params) {
			for (const param of params.params) {
				this.addParameter(param);
			}
		}
	}

	setCanvas(canvas: CanvasAttributes | string): void {
		let c: CanvasAttributes | null;
		if (typeof canvas === 'string') {
			c = Graphics.getCanvas(canvas);
			if (!c) {
				this.#canvas = undefined;
				return;
			}
		} else {
			c = canvas;
		}
		this.#setCanvas(c);
	}

	#setCanvas(canvas: CanvasAttributes | undefined): void {
		this.#canvas = canvas;
		if (canvas) {
			canvas.canvas.parentElement?.append(this.#shadowRoot.host);
		} else {
			this.#shadowRoot.host.remove();
		}
	}

	addParameter(param: CanvasUiParam): void {
		this.#params.set(param.name, {
			param,
			element: this.#createParam(param.type),
		});
	}

	#createParam(type: CanvasUiType): HTMLElement {

		const container = createElement('div', {
			parent: this.#shadowRoot,
		});

		switch (type) {
			case CanvasUiType.Float:
				const floatInput = createElement('input', { parent: container });

				return floatInput;
			default:
				throw new Error('Missing case in createParam');
		}
	}

	setValue(name: string, value: CanvasUiValue): void {
		const param = this.#params.get(name);
		if (!param) {
			return;
		}

		switch (param.param.type) {
			case CanvasUiType.Float:
				(param.element as HTMLInputElement).value = value as string;
				break
			default:
				throw new Error('Missing case in setValue');
		}


	}
}
