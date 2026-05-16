import { vec3 } from 'gl-matrix';
import { HarmonyMenuItemsDict } from 'harmony-ui';
import { Entity, EntityParameters } from '../entities/entity';
import { GraphicsEvent, GraphicsEvents, GraphicTickEvent } from '../graphics/graphicsevents';
import { stringToVec3 } from '../utils/utils';
import { errorOnce } from 'harmony-utils';

export enum TranslationMode {
	// Bounce back and forth
	Bounce = 0,
	// Teleport back to the starting point and keep going
	Teleport,
	// Stop when arriving at the end point
	Stop,
}

export type TranslationControlParameters = EntityParameters & {
	// The starting point. Default to [0, 0, 0]
	start?: vec3;
	// The ending point. Default to [10, 0, 0]
	end?: vec3;
	// The translation speed. Default to 1 unit / s
	speed?: number;
	// Translation mode
	mode?: TranslationMode;
	// Normalized translation amount. Values outside [0..1] are will produce undefined behavior
	amount?: number;
};

export class TranslationControl extends Entity {
	#startPoint = vec3.create();
	#endPoint = vec3.fromValues(10, 0, 0);
	#speed: number;
	#amount: number;
	#mode: TranslationMode;
	#bounceDirection = 1;
	constructor(params: TranslationControlParameters = {}) {
		super(params);
		if (params.start) {
			vec3.copy(this.#startPoint, params.start);
		}
		if (params.end) {
			vec3.copy(this.#endPoint, params.end);
		}
		this.#speed = params.speed ?? 1;
		this.#amount = params.amount ?? 0;
		this.#mode = params.mode ?? TranslationMode.Bounce;

		GraphicsEvents.addEventListener(GraphicsEvent.Tick, (event: Event) => this.#update((event as CustomEvent<GraphicTickEvent>).detail.delta));
	}

	#update(delta: number): void {
		const parent = this._parent;
		if (!parent) {
			return;
		}
		switch (this.#mode) {
			case TranslationMode.Bounce:
				const distance = vec3.distance(this.#startPoint, this.#endPoint);
				const deltaL = distance ? this.#speed * delta / distance : 1;
				let amount = this.#amount + deltaL * this.#bounceDirection;
				if (amount >= 1) {
					this.#bounceDirection = -1;
					amount = 1;
				}
				if (amount <= 0) {
					this.#bounceDirection = 1;
					amount = 0;
				}

				this.#amount = amount;
				vec3.lerp(parent._position, this.#startPoint, this.#endPoint, this.#amount);

				break;
			default:
				errorOnce(`Code this mode:${this.#mode}`);
		}
	}

	override buildContextMenu(): HarmonyMenuItemsDict {
		return Object.assign(super.buildContextMenu(), {
			TranslationControl_1: null,
			speed: { i18n: '#speed', f: () => { const s = prompt('Speed', String(this.#speed)); if (s !== null) { this.#speed = Number(s); } } },
			start_position: { i18n: '#start_position', f: () => { const v = prompt('Position', this.#startPoint.join(' ')); if (v !== null) { stringToVec3(v, this.#startPoint); } } },
			end_position: { i18n: '#end_position', f: () => { const v = prompt('Position', this.#endPoint.join(' ')); if (v !== null) { stringToVec3(v, this.#endPoint); } } },
		});
	}

	static override getEntityName(): string {
		return 'TranslationControl';
	}
}
