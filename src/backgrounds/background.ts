import { Camera } from '../cameras/camera';
import { InternalRenderContext } from '../interfaces/rendercontext';
import { Renderer } from '../renderers/renderer';

export class BackGround {
	render(renderer: Renderer, camera: Camera, context: InternalRenderContext) {
	}

	dispose() {
	}

	is(s: string): boolean {
		return s == 'BackGround';
	}
}
