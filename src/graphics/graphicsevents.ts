import { MyEventTarget, StaticEventTarget } from 'harmony-utils';
import { Entity } from '../entities/entity';

export enum GraphicsEvent {
	MouseMove = 'mousemove',
	MouseDown = 'mousedown',
	MouseUp = 'mouseup',
	Wheel = 'wheel',
	Resize = 'resize',
	Tick = 'tick',
	KeyDown = 'keydown',
	KeyUp = 'keyup',
	TouchStart = 'touchstart',
	TouchMove = 'touchmove',
	TouchCancel = 'touchcancel',
}

export interface GraphicTickEvent {
	delta: number,
	time: number,
	speed: number,
}

export interface GraphicMouseEventData {
	x: number,
	y: number,
	entity: Entity | null,
	mouseEvent: MouseEvent,
}

export interface GraphicWheelEventData {
	x: number,
	y: number,
	entity: Entity | null,
	wheelEvent: WheelEvent,
}

export interface GraphicTouchEventData {
	entity: Entity | null,
	touchEvent: TouchEvent,
}

export interface GraphicKeyboardEventData {
	keyboardEvent: KeyboardEvent,
}

export class GraphicsEvents extends StaticEventTarget {
	static readonly isGraphicsEvents: true = true;

	static tick(delta: number, time: number, speed: number) {
		this.dispatchEvent(new CustomEvent<GraphicTickEvent>(GraphicsEvent.Tick, { detail: { delta: delta, time: time, speed: speed } }));
	}

	static resize(width: number, height: number) {
		this.dispatchEvent(new CustomEvent(GraphicsEvent.Resize, { detail: { width: width, height: height } }));
	}

	static mouseMove(x: number, y: number, pickedEntity: Entity | null, mouseEvent: MouseEvent) {
		this.dispatchEvent(new CustomEvent<GraphicMouseEventData>(GraphicsEvent.MouseMove, { detail: { x: x, y: y, entity: pickedEntity, mouseEvent: mouseEvent } }));
	}

	static mouseDown(x: number, y: number, pickedEntity: Entity | null, mouseEvent: MouseEvent) {
		this.dispatchEvent(new CustomEvent<GraphicMouseEventData>(GraphicsEvent.MouseDown, { detail: { x: x, y: y, entity: pickedEntity, mouseEvent: mouseEvent } }));
	}

	static mouseUp(x: number, y: number, pickedEntity: Entity | null, mouseEvent: MouseEvent) {
		this.dispatchEvent(new CustomEvent<GraphicMouseEventData>(GraphicsEvent.MouseUp, { detail: { x: x, y: y, entity: pickedEntity, mouseEvent: mouseEvent } }));
	}

	static wheel(x: number, y: number, pickedEntity: Entity | null, wheelEvent: WheelEvent) {
		this.dispatchEvent(new CustomEvent<GraphicWheelEventData>(GraphicsEvent.Wheel, { detail: { x: x, y: y, entity: pickedEntity, wheelEvent: wheelEvent } }));
	}

	static keyDown(keyboardEvent: KeyboardEvent) {
		this.dispatchEvent(new CustomEvent<GraphicKeyboardEventData>(GraphicsEvent.KeyDown, { detail: { keyboardEvent: keyboardEvent } }));
	}

	static keyUp(keyboardEvent: KeyboardEvent) {
		this.dispatchEvent(new CustomEvent<GraphicKeyboardEventData>(GraphicsEvent.KeyUp, { detail: { keyboardEvent: keyboardEvent } }));
	}

	static touchStart(pickedEntity: Entity | null, touchEvent: TouchEvent) {
		this.dispatchEvent(new CustomEvent<GraphicTouchEventData>(GraphicsEvent.TouchStart, { detail: { entity: pickedEntity, touchEvent: touchEvent } }));
	}

	static touchMove(pickedEntity: Entity | null, touchEvent: TouchEvent) {
		this.dispatchEvent(new CustomEvent<GraphicTouchEventData>(GraphicsEvent.TouchMove, { detail: { entity: pickedEntity, touchEvent: touchEvent } }));
	}

	static touchCancel(pickedEntity: Entity | null, touchEvent: TouchEvent) {
		this.dispatchEvent(new CustomEvent<GraphicTouchEventData>(GraphicsEvent.TouchCancel, { detail: { entity: pickedEntity, touchEvent: touchEvent } }));
	}
}
