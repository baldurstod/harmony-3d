import { Millisecond } from 'harmony-types';
import { Entity } from '../entities/entity';
import { RenderContext } from '../interfaces/rendercontext';

export type GraphicsEvent =
	'mousemove'
	| 'mousedown'
	| 'mouseup'
	| 'mouseclick'
	| 'mousedblclick'
	| 'wheel'
	| 'resize'
	| 'pick'
	| 'tick'
	| 'keydown'
	| 'keyup'
	| 'touchstart'
	| 'touchmove'
	| 'touchcancel'
	;


export interface GraphicTickEvent {
	delta: number,
	time: Millisecond,
	speed: number,
	context: RenderContext,
}

export interface GraphicPickEvent {
	x: number,
	y: number,
	width: number,
	height: number,
	entity: Entity | null,
	mouseEvent: MouseEvent,
}

export interface GraphicResizeEvent {
	width: number,
	height: number,
}

export interface GraphicMouseEventData {
	x: number,
	y: number,
	width: number,
	height: number,
	mouseEvent: MouseEvent,
	canvas: HTMLCanvasElement,
}

export interface GraphicWheelEventData {
	x: number,
	y: number,
	wheelEvent: WheelEvent,
	canvas: HTMLCanvasElement,
}

export interface GraphicTouchEventData {
	touchEvent: TouchEvent,
}

export interface GraphicKeyboardEventData {
	keyboardEvent: KeyboardEvent,
	canvas: HTMLCanvasElement,
}

// Same as CustomEventInit with required detail
interface GraphicsEventInit<T = any> extends EventInit {
	detail: T;
}

export class GraphicsEvents {
	static readonly isGraphicsEvents = true as const;
	static readonly #eventTarget = new EventTarget();

	static tick(delta: number, time: Millisecond, speed: number, context: RenderContext) {
		this.dispatchEvent('tick', { detail: { delta, time, speed, context } });
	}

	static pick(x: number, y: number, width: number, height: number, pickedEntity: Entity | null, mouseEvent: MouseEvent) {
		this.dispatchEvent('pick', { detail: { x, y, width, height, entity: pickedEntity, mouseEvent } });
	}

	static resize(width: number, height: number) {
		this.dispatchEvent('resize', { detail: { width, height } });
	}

	static mouseMove(x: number, y: number, width: number, height: number, mouseEvent: MouseEvent, canvas: HTMLCanvasElement) {
		this.dispatchEvent('mousemove', { detail: { x, y, width, height, mouseEvent, canvas } });
	}

	static mouseDown(x: number, y: number, width: number, height: number, mouseEvent: MouseEvent, canvas: HTMLCanvasElement) {
		this.dispatchEvent('mousedown', { detail: { x, y, width, height, mouseEvent, canvas } });
	}

	static mouseUp(x: number, y: number, width: number, height: number, mouseEvent: MouseEvent, canvas: HTMLCanvasElement) {
		this.dispatchEvent('mouseup', { detail: { x, y, width, height, mouseEvent, canvas } });
	}

	static mouseClick(x: number, y: number, width: number, height: number, mouseEvent: MouseEvent, canvas: HTMLCanvasElement) {
		this.dispatchEvent('mouseclick', { detail: { x, y, width, height, mouseEvent, canvas } });
	}

	static mouseDblClick(x: number, y: number, width: number, height: number, mouseEvent: MouseEvent, canvas: HTMLCanvasElement) {
		this.dispatchEvent('mousedblclick', { detail: { x, y, width, height, mouseEvent, canvas } });
	}

	static wheel(x: number, y: number, wheelEvent: WheelEvent, canvas: HTMLCanvasElement) {
		this.dispatchEvent('wheel', { detail: { x, y, wheelEvent: wheelEvent, canvas } });
	}

	static keyDown(keyboardEvent: KeyboardEvent, canvas: HTMLCanvasElement) {
		this.dispatchEvent('keydown', { detail: { keyboardEvent, canvas } });
	}

	static keyUp(keyboardEvent: KeyboardEvent, canvas: HTMLCanvasElement) {
		this.dispatchEvent('keyup', { detail: { keyboardEvent, canvas } });
	}

	static touchStart(pickedEntity: Entity | null, touchEvent: TouchEvent) {
		this.dispatchEvent('touchstart', { detail: { touchEvent } });
	}

	static touchMove(pickedEntity: Entity | null, touchEvent: TouchEvent) {
		this.dispatchEvent('touchmove', { detail: { touchEvent } });
	}

	static touchCancel(pickedEntity: Entity | null, touchEvent: TouchEvent) {
		this.dispatchEvent('touchcancel', { detail: { touchEvent } });
	}

	static addEventListener(type: 'tick', callback: (evt: CustomEvent<GraphicTickEvent>) => void, options?: AddEventListenerOptions | boolean): void;
	static addEventListener(type: 'pick', callback: (evt: CustomEvent<GraphicPickEvent>) => void, options?: AddEventListenerOptions | boolean): void;
	static addEventListener(type: 'resize', callback: (evt: CustomEvent<GraphicResizeEvent>) => void, options?: AddEventListenerOptions | boolean): void;
	static addEventListener(type: 'mousemove', callback: (evt: CustomEvent<GraphicMouseEventData>) => void, options?: AddEventListenerOptions | boolean): void;
	static addEventListener(type: 'mousedown', callback: (evt: CustomEvent<GraphicMouseEventData>) => void, options?: AddEventListenerOptions | boolean): void;
	static addEventListener(type: 'mouseup', callback: (evt: CustomEvent<GraphicMouseEventData>) => void, options?: AddEventListenerOptions | boolean): void;
	static addEventListener(type: 'mouseclick', callback: (evt: CustomEvent<GraphicMouseEventData>) => void, options?: AddEventListenerOptions | boolean): void;
	static addEventListener(type: 'mousedblclick', callback: (evt: CustomEvent<GraphicMouseEventData>) => void, options?: AddEventListenerOptions | boolean): void;
	static addEventListener(type: 'wheel', callback: (evt: CustomEvent<GraphicWheelEventData>) => void, options?: AddEventListenerOptions | boolean): void;
	static addEventListener(type: 'keydown', callback: (evt: CustomEvent<GraphicKeyboardEventData>) => void, options?: AddEventListenerOptions | boolean): void;
	static addEventListener(type: 'keyup', callback: (evt: CustomEvent<GraphicKeyboardEventData>) => void, options?: AddEventListenerOptions | boolean): void;
	static addEventListener(type: 'touchstart', callback: (evt: CustomEvent<GraphicTouchEventData>) => void, options?: AddEventListenerOptions | boolean): void;
	static addEventListener(type: 'touchmove', callback: (evt: CustomEvent<GraphicTouchEventData>) => void, options?: AddEventListenerOptions | boolean): void;
	static addEventListener(type: 'touchcancel', callback: (evt: CustomEvent<GraphicTouchEventData>) => void, options?: AddEventListenerOptions | boolean): void;

	static addEventListener(type: GraphicsEvent, callback: (evt: CustomEvent) => void, options?: AddEventListenerOptions | boolean): void {
		this.#eventTarget.addEventListener(type, callback as (evt: Event) => void, options);
	}

	static dispatchEvent(type: 'tick', options: GraphicsEventInit<GraphicTickEvent>): boolean;
	static dispatchEvent(type: 'pick', options: GraphicsEventInit<GraphicPickEvent>): boolean;
	static dispatchEvent(type: 'resize', options: GraphicsEventInit<GraphicResizeEvent>): boolean;
	static dispatchEvent(type: 'mousemove', options: GraphicsEventInit<GraphicMouseEventData>): boolean;
	static dispatchEvent(type: 'mousedown', options: GraphicsEventInit<GraphicMouseEventData>): boolean;
	static dispatchEvent(type: 'mouseup', options: GraphicsEventInit<GraphicMouseEventData>): boolean;
	static dispatchEvent(type: 'mouseclick', options: GraphicsEventInit<GraphicMouseEventData>): boolean;
	static dispatchEvent(type: 'mousedblclick', options: GraphicsEventInit<GraphicMouseEventData>): boolean;
	static dispatchEvent(type: 'wheel', options: GraphicsEventInit<GraphicWheelEventData>): boolean;
	static dispatchEvent(type: 'keydown', options: GraphicsEventInit<GraphicKeyboardEventData>): boolean;
	static dispatchEvent(type: 'keyup', options: GraphicsEventInit<GraphicKeyboardEventData>): boolean;
	static dispatchEvent(type: 'touchstart', options: GraphicsEventInit<GraphicTouchEventData>): boolean;
	static dispatchEvent(type: 'touchmove', options: GraphicsEventInit<GraphicTouchEventData>): boolean;
	static dispatchEvent(type: 'touchcancel', options: GraphicsEventInit<GraphicTouchEventData>): boolean;

	static dispatchEvent<T>(type: GraphicsEvent, options?: CustomEventInit<T>): boolean {
		return this.#eventTarget.dispatchEvent(new CustomEvent<T>(type, options));
	}

	static removeEventListener(type: GraphicsEvent, callback: EventListenerOrEventListenerObject | null, options?: EventListenerOptions | boolean): void {
		this.#eventTarget.removeEventListener(type, callback, options);
	}
}
