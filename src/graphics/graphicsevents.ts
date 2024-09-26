import { Entity } from '../entities/entity';

export enum GraphicsEvent {
	MouseMove = 'mousemove',
	MouseDown = 'mousedown',
	MouseUp = 'mouseup',
	Pick = 'pick',
	Resize = 'resize',
	Tick = 'tick',
}

export const GraphicsEvents = new (function () {
	class GraphicsEvents extends EventTarget {
		static #instance: GraphicsEvents;
		constructor() {
			if (GraphicsEvents.#instance) {
				return GraphicsEvents.#instance;
			}
			super();
		}

		tick(delta: number, time: number) {
			this.dispatchEvent(new CustomEvent(GraphicsEvent.Tick, { detail: { delta: delta, time: time } }));
		}

		pick(x: number, y: number, pickedEntity: Entity) {
			this.dispatchEvent(new CustomEvent(GraphicsEvent.Pick, { detail: { x: x, y: y, entity: pickedEntity } }));
		}

		resize(width: number, height: number) {
			this.dispatchEvent(new CustomEvent(GraphicsEvent.Resize, { detail: { width: width, height: height } }));
		}

		mouseMove(x: number, y: number, pickedEntity: Entity | null, mouseEvent: MouseEvent) {
			this.dispatchEvent(new CustomEvent(GraphicsEvent.MouseMove, { detail: { x: x, y: y, entity: pickedEntity, mouseEvent: mouseEvent } }));
		}

		mouseDown(x: number, y: number, pickedEntity: Entity | null, mouseEvent: MouseEvent) {
			this.dispatchEvent(new CustomEvent(GraphicsEvent.MouseDown, { detail: { x: x, y: y, entity: pickedEntity, mouseEvent: mouseEvent } }));
		}

		mouseUp(x: number, y: number, pickedEntity: Entity | null, mouseEvent: MouseEvent) {
			this.dispatchEvent(new CustomEvent(GraphicsEvent.MouseUp, { detail: { x: x, y: y, entity: pickedEntity, mouseEvent: mouseEvent } }));
		}
	}
	return GraphicsEvents;
}());
