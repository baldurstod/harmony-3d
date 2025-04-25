import { Camera } from '../cameras/camera';
import { Graphics } from '../graphics/graphics';
import { FullScreenQuad } from '../primitives/fullscreenquad';
import { RenderTarget } from '../textures/rendertarget';

export class Pass {
	camera?: Camera;
	quad?: FullScreenQuad;
	enabled = true;
	swapBuffers = true;
	renderToScreen = false;

	setSize(width: number, height: number) {

	}

	render(renderer: Graphics, readBuffer: RenderTarget, writeBuffer: RenderTarget, renderToScreen: boolean, delta: number) {
		throw 'Can\'t render default pass';
	}
}
