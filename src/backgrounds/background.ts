import { Camera } from '../cameras/camera';
import { Renderer } from '../renderers/renderer';

export class BackGround {
	render(renderer: Renderer, camera: Camera) {
	}

	dispose() {
	}

	is(s: string): boolean {
		return s == 'BackGround';
	}
}
