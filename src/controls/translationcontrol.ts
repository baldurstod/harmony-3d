import { vec3 } from 'gl-matrix';

import { Entity } from '../entities/entity';
import { GraphicsEvents, GraphicsEvent } from '../graphics/graphicsevents';
import { stringToVec3 } from '../utils/utils';

export enum TranslationMode {
	Bounce = 0,
	Loop,
	Continue,
}

export class TranslationControl extends Entity {
	#speed = 1;
	#startPoint = vec3.create();
	#endPoint = vec3.fromValues(10, 0, 0);
	#mode:TranslationMode = TranslationMode.Bounce;
	#percent = 0;
	#bounceDirection = 1;
	constructor(params?: any) {
		super(params);
		GraphicsEvents.addEventListener(GraphicsEvent.Tick, (event: CustomEvent) => this.#update(event.detail.delta));
	}

	#update(delta: number) {
		switch (this.#mode) {
			case TranslationMode.Bounce:
				const distance = vec3.distance(this.#startPoint, this.#endPoint);
				const deltaL = distance ? this.#speed * delta / distance : 1;
				let percent = this.#percent + deltaL * this.#bounceDirection;
				if (percent >= 1) {
					this.#bounceDirection = -1;
					percent = 1;
				}
				if (percent <= 0) {
					this.#bounceDirection = 1;
					percent = 0;
				}

				this.#percent = percent;
				vec3.lerp(this._position, this.#startPoint, this.#endPoint, this.#percent);

				break;
			default:
		}
	}

	buildContextMenu() {
		return Object.assign(super.buildContextMenu(), {
			TranslationControl_1: null,
			speed: { i18n: '#speed', f: () => { const s = prompt('Speed', String(this.#speed)); if (s !== null) { this.#speed = Number(s); } } },
			start_position: { i18n: '#start_position', f: () => { const v = prompt('Position', this.#startPoint.join(' ')); if (v !== null) { stringToVec3(v, this.#startPoint); } } },
			end_position: { i18n: '#end_position', f: () => { const v = prompt('Position', this.#endPoint.join(' ')); if (v !== null) { stringToVec3(v, this.#endPoint); } } },
		});
	}
}
