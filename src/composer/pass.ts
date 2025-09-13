import { Camera } from '../cameras/camera';
import { RenderContext } from '../interfaces/rendercontext';
import { FullScreenQuad } from '../primitives/fullscreenquad';
import { Scene } from '../scenes/scene';
import { RenderTarget } from '../textures/rendertarget';

export class Pass {
	camera?: Camera;
	quad?: FullScreenQuad;
	scene?: Scene;
	enabled = true;
	swapBuffers = true;
	renderToScreen = false;

	setSize(width: number, height: number) {

	}

	render(readBuffer: RenderTarget, writeBuffer: RenderTarget, renderToScreen: boolean, delta: number, context: RenderContext) {
		throw 'Can\'t render default pass';
	}
}
