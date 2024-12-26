import { Entity } from '../entities/entity';

export enum GraphicsEvent {
	MouseMove = 'mousemove',
	MouseDown = 'mousedown',
	MouseUp = 'mouseup',
	Resize = 'resize',
	Tick = 'tick',
}

export type GraphicMouseDownEventData = {
	x: number,
	y: number,
	entity: Entity | null,
	mouseEvent: MouseEvent,
}

export type GraphicMouseUpEventData = GraphicMouseDownEventData;
export type GraphicMouseMoveEventData = GraphicMouseDownEventData;

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
			this.dispatchEvent(new CustomEvent<GraphicMouseMoveEventData>(GraphicsEvent.MouseMove, { detail: { x: x, y: y, entity: pickedEntity, mouseEvent: mouseEvent } }));
		}

		mouseDown(x: number, y: number, pickedEntity: Entity | null, mouseEvent: MouseEvent) {
			this.dispatchEvent(new CustomEvent<GraphicMouseDownEventData>(GraphicsEvent.MouseDown, { detail: { x: x, y: y, entity: pickedEntity, mouseEvent: mouseEvent } }));
		}

		mouseUp(x: number, y: number, pickedEntity: Entity | null, mouseEvent: MouseEvent) {
			this.dispatchEvent(new CustomEvent<GraphicMouseUpEventData>(GraphicsEvent.MouseUp, { detail: { x: x, y: y, entity: pickedEntity, mouseEvent: mouseEvent } }));
		}
	}
	return GraphicsEvents;
}());
