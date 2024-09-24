import { vec3, vec4 } from 'gl-matrix';
import { Camera } from '../cameras/camera';
import { Renderer } from '../renderers/renderer';
import { BackGround } from './background';

const tempVec3 = vec3.create();

export class ColorBackground extends BackGround {
	#color = vec4.fromValues(0, 0, 0, 1);
	constructor(params: any = {}) {
		super();

		if (params.color) {
			vec4.copy(this.#color, params.color);
		}
	}

	render(renderer: Renderer, camera: Camera) {
		renderer.clearColor(this.#color);
		renderer.clear(true);
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
