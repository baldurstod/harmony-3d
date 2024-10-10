import { Camera } from '../../cameras/camera';
import { Scene } from '../../scenes/scene';
import { Pass } from '../pass';

export class RenderPass extends Pass {
	scene: Scene;
	constructor(scene: Scene, camera: Camera) {
		super();
		this.swapBuffers = false;
		this.scene = scene;
		this.camera = camera;
	}

	render(renderer, readBuffer, writeBuffer, renderToScreen, delta) {

		renderer.pushRenderTarget(renderToScreen ? null : writeBuffer);
		renderer.render(this.scene, this.camera, delta);
		renderer.popRenderTarget();
	}
}
