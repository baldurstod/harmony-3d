import { vec3, vec4 } from 'gl-matrix';
import { Camera } from '../cameras/camera';
import { Renderer } from '../renderers/renderer';
import { BackGround, BackGroundResult } from './background';

const tempVec3 = vec3.create();

export interface ColorBackgroundParameters {
	color?: vec4;
}

export class ColorBackground extends BackGround {
	#color = vec4.fromValues(0, 0, 0, 1);

	constructor(params: ColorBackgroundParameters = {}) {
		super();

		if (params.color) {
			vec4.copy(this.#color, params.color);
		}
	}

	render(renderer: Renderer, camera: Camera): BackGroundResult {
		renderer.clearColor(this.#color);
		renderer.clear(true, false, false);
		return {
			clearColor: true,
			clearValue: { r: this.#color[0], g: this.#color[1], b: this.#color[2], a: this.#color[3], },
		}
	}

	setColor(color: vec4) {
		vec4.copy(this.#color, color);
	}

	getColor(out: vec4 = vec4.create()) {
		vec4.copy(out, this.#color);
	}

	dispose() {
	}

	is(s: string): boolean {
		if (s == 'ColorBackground') {
			return true;
		} else {
			return super.is(s);
		}
	}
}
