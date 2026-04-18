import { quat, vec3 } from 'gl-matrix';
import { HarmonyMenuItemsDict } from 'harmony-ui';
import { registerEntity } from '../entities/entities';
import { Light, LightParameters, LightType } from './light';
import { SpotLightShadow } from './spotlightshadow';

const DEFAULT_ANGLE = Math.PI / 4.0;
const Z_VECTOR = vec3.fromValues(0, 0, 1);
const tempQuat = quat.create();

export type SpotLightParameters = LightParameters & {
	innerAngle?: number,
	outerAngle?: number,
};

export class SpotLight extends Light {
	isSpotLight = true;
	#innerAngle!: number;
	innerAngleCos!: number;
	#outerAngle!: number;
	outerAngleCos!: number;

	constructor(parameters: SpotLightParameters = {}) {
		super(parameters);
		this.angle = parameters.outerAngle ?? DEFAULT_ANGLE;
		this.innerAngle = parameters.innerAngle ?? DEFAULT_ANGLE;
		this.range = 0;
	}

	set castShadow(castShadow: boolean | undefined) {
		super.castShadow = castShadow;
		if (this.castShadow) {
			this.shadow = new SpotLightShadow(this);
			this.shadow.range = this.range;
			(this.shadow as SpotLightShadow).angle = this.#outerAngle;
		} else {
			//TODO : dispose of the shadow
		}
	}

	get castShadow() {
		return super.castShadow;
	}

	set angle(angle) {
		this.#outerAngle = angle;
		this.outerAngleCos = Math.cos(angle);
		if (this.shadow) {
			(this.shadow as SpotLightShadow).angle = angle;
		}
	}

	get angle() {
		return this.#outerAngle;
	}

	set innerAngle(innerAngle) {
		this.#innerAngle = innerAngle;
		this.innerAngleCos = Math.cos(innerAngle);
	}

	get innerAngle() {
		return this.#innerAngle;
	}

	getDirection(out = vec3.create()) {
		return vec3.transformQuat(out, Z_VECTOR, this.getWorldQuaternion(tempQuat));
	}

	override buildContextMenu(): HarmonyMenuItemsDict {
		return Object.assign(super.buildContextMenu(), {
			angle: { i18n: '#angle', f: () => { const angle = prompt('Angle', String(this.angle)); if (angle !== null) { this.angle = Number(angle); } } },
			inner_angle: { i18n: '#inner_angle', f: () => { const innerAngle = prompt('Inner angle', String(this.#innerAngle)); if (innerAngle !== null) { this.innerAngle = Number(innerAngle); } } },
			range: { i18n: '#range', f: () => { const range = prompt('Range', String(this.range)); if (range !== null) { this.range = Number(range); } } },
		});
	}

	static getEntityName() {
		return 'SpotLight';
	}

	override getRaytracingLight(): LightType {
		return LightType.Spot;
	}
}
registerEntity(SpotLight);
