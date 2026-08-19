import { Millisecond } from 'harmony-types';
import { StaticEventTarget } from 'harmony-utils';
import { Entity } from '../entities/entity';
import { RenderContext } from '../interfaces/rendercontext';

export enum GraphicsEvent {
	MouseMove = 'mousemove',
	MouseDown = 'mousedown',
	MouseUp = 'mouseup',
	MouseClick = 'mouseclick',
	MouseDblClick = 'mousedblclick',
	Wheel = 'wheel',
	Resize = 'resize',
	Pick = 'pick',
	Tick = 'tick',
	KeyDown = 'keydown',
	KeyUp = 'keyup',
	TouchStart = 'touchstart',
	TouchMove = 'touchmove',
	TouchCancel = 'touchcancel',
}

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

export class GraphicsEvents extends StaticEventTarget {
	static readonly isGraphicsEvents: true = true;

	static tick(delta: number, time: Millisecond, speed: number, context: RenderContext) {
		this.dispatchEvent(new CustomEvent<GraphicTickEvent>(GraphicsEvent.Tick, { detail: { delta, time, speed, context } }));
	}

	static pick(x: number, y: number, width: number, height: number, pickedEntity: Entity | null, mouseEvent: MouseEvent) {
		this.dispatchEvent(new CustomEvent<GraphicPickEvent>(GraphicsEvent.Pick, { detail: { x, y, width, height, entity: pickedEntity, mouseEvent } }));
	}

	static resize(width: number, height: number) {
		this.dispatchEvent(new CustomEvent(GraphicsEvent.Resize, { detail: { width, height } }));
	}

	static mouseMove(x: number, y: number, width: number, height: number, mouseEvent: MouseEvent, canvas: HTMLCanvasElement) {
		this.dispatchEvent(new CustomEvent<GraphicMouseEventData>(GraphicsEvent.MouseMove, { detail: { x, y, width, height, mouseEvent, canvas } }));
	}

	static mouseDown(x: number, y: number, width: number, height: number, mouseEvent: MouseEvent, canvas: HTMLCanvasElement) {
		this.dispatchEvent(new CustomEvent<GraphicMouseEventData>(GraphicsEvent.MouseDown, { detail: { x, y, width, height, mouseEvent, canvas } }));
	}

	static mouseUp(x: number, y: number, width: number, height: number, mouseEvent: MouseEvent, canvas: HTMLCanvasElement) {
		this.dispatchEvent(new CustomEvent<GraphicMouseEventData>(GraphicsEvent.MouseUp, { detail: { x, y, width, height, mouseEvent, canvas } }));
	}

	static mouseClick(x: number, y: number, width: number, height: number, mouseEvent: MouseEvent, canvas: HTMLCanvasElement) {
		this.dispatchEvent(new CustomEvent<GraphicMouseEventData>(GraphicsEvent.MouseClick, { detail: { x, y, width, height, mouseEvent, canvas } }));
	}

	static mouseDblClick(x: number, y: number, width: number, height: number, mouseEvent: MouseEvent, canvas: HTMLCanvasElement) {
		this.dispatchEvent(new CustomEvent<GraphicMouseEventData>(GraphicsEvent.MouseDblClick, { detail: { x, y, width, height, mouseEvent, canvas } }));
	}

	static wheel(x: number, y: number, wheelEvent: WheelEvent, canvas: HTMLCanvasElement) {
		this.dispatchEvent(new CustomEvent<GraphicWheelEventData>(GraphicsEvent.Wheel, { detail: { x, y, wheelEvent: wheelEvent, canvas } }));
	}

	static keyDown(keyboardEvent: KeyboardEvent, canvas: HTMLCanvasElement) {
		this.dispatchEvent(new CustomEvent<GraphicKeyboardEventData>(GraphicsEvent.KeyDown, { detail: { keyboardEvent: keyboardEvent, canvas } }));
	}

	static keyUp(keyboardEvent: KeyboardEvent, canvas: HTMLCanvasElement) {
		this.dispatchEvent(new CustomEvent<GraphicKeyboardEventData>(GraphicsEvent.KeyUp, { detail: { keyboardEvent: keyboardEvent, canvas } }));
	}

	static touchStart(pickedEntity: Entity | null, touchEvent: TouchEvent) {
		this.dispatchEvent(new CustomEvent<GraphicTouchEventData>(GraphicsEvent.TouchStart, { detail: { touchEvent: touchEvent } }));
	}

	static touchMove(pickedEntity: Entity | null, touchEvent: TouchEvent) {
		this.dispatchEvent(new CustomEvent<GraphicTouchEventData>(GraphicsEvent.TouchMove, { detail: { touchEvent: touchEvent } }));
	}

	static touchCancel(pickedEntity: Entity | null, touchEvent: TouchEvent) {
		this.dispatchEvent(new CustomEvent<GraphicTouchEventData>(GraphicsEvent.TouchCancel, { detail: { touchEvent: touchEvent } }));
	}
}
