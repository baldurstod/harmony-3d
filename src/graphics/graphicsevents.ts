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

export type GraphicMouseEventData = {
	x: number,
	y: number,
	entity: Entity | null,
	mouseEvent: MouseEvent,
}

export type GraphicWheelEventData = {
	x: number,
	y: number,
	entity: Entity | null,
	wheelEvent: WheelEvent,
}

export type GraphicTouchEventData = {
	entity: Entity | null,
	touchEvent: TouchEvent,
}

export type GraphicKeyboardEventData = {
	keyboardEvent: KeyboardEvent,
}

export const GraphicsEvents = new (function () {
	class GraphicsEvents extends EventTarget {
		static #instance: GraphicsEvents;
		constructor() {
			if (GraphicsEvents.#instance) {
				return GraphicsEvents.#instance;
			}
			super();
			GraphicsEvents.#instance = this;
		}

		tick(delta: number, time: number) {
			this.dispatchEvent(new CustomEvent(GraphicsEvent.Tick, { detail: { delta: delta, time: time } }));
		}

		resize(width: number, height: number) {
			this.dispatchEvent(new CustomEvent(GraphicsEvent.Resize, { detail: { width: width, height: height } }));
		}

		mouseMove(x: number, y: number, pickedEntity: Entity | null, mouseEvent: MouseEvent) {
			this.dispatchEvent(new CustomEvent<GraphicMouseEventData>(GraphicsEvent.MouseMove, { detail: { x: x, y: y, entity: pickedEntity, mouseEvent: mouseEvent } }));
		}

		mouseDown(x: number, y: number, pickedEntity: Entity | null, mouseEvent: MouseEvent) {
			this.dispatchEvent(new CustomEvent<GraphicMouseEventData>(GraphicsEvent.MouseDown, { detail: { x: x, y: y, entity: pickedEntity, mouseEvent: mouseEvent } }));
		}

		mouseUp(x: number, y: number, pickedEntity: Entity | null, mouseEvent: MouseEvent) {
			this.dispatchEvent(new CustomEvent<GraphicMouseEventData>(GraphicsEvent.MouseUp, { detail: { x: x, y: y, entity: pickedEntity, mouseEvent: mouseEvent } }));
		}

		wheel(x: number, y: number, pickedEntity: Entity | null, wheelEvent: WheelEvent) {
			this.dispatchEvent(new CustomEvent<GraphicWheelEventData>(GraphicsEvent.Wheel, { detail: { x: x, y: y, entity: pickedEntity, wheelEvent: wheelEvent } }));
		}

		keyDown(keyboardEvent: KeyboardEvent) {
			this.dispatchEvent(new CustomEvent<GraphicKeyboardEventData>(GraphicsEvent.KeyDown, { detail: { keyboardEvent: keyboardEvent } }));
		}

		keyUp(keyboardEvent: KeyboardEvent) {
			this.dispatchEvent(new CustomEvent<GraphicKeyboardEventData>(GraphicsEvent.KeyUp, { detail: { keyboardEvent: keyboardEvent } }));
		}

		touchStart(pickedEntity: Entity | null, touchEvent: TouchEvent) {
			this.dispatchEvent(new CustomEvent<GraphicTouchEventData>(GraphicsEvent.TouchStart, { detail: { entity: pickedEntity, touchEvent: touchEvent } }));
		}

		touchMove(pickedEntity: Entity | null, touchEvent: TouchEvent) {
			this.dispatchEvent(new CustomEvent<GraphicTouchEventData>(GraphicsEvent.TouchMove, { detail: { entity: pickedEntity, touchEvent: touchEvent } }));
		}

		touchCancel(pickedEntity: Entity | null, touchEvent: TouchEvent) {
			this.dispatchEvent(new CustomEvent<GraphicTouchEventData>(GraphicsEvent.TouchCancel, { detail: { entity: pickedEntity, touchEvent: touchEvent } }));
		}
	}
	return GraphicsEvents;
}());
