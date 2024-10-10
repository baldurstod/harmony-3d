import { Camera } from '../cameras/camera';
import { FullScreenQuad } from '../primitives/fullscreenquad';

export class Pass {
	camera: Camera;
	quad?: FullScreenQuad;
	enabled = true;
	swapBuffers = true;
	renderToScreen = false;

	setSize(width, height) {

	}

	render(renderer, readBuffer, writeBuffer, renderToScreen, delta) {
		throw 'Can\'t render default pass';
	}
}
