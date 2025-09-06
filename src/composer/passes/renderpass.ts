import { Camera } from '../../cameras/camera';
import { Graphics, RenderContext } from '../../graphics/graphics';
import { Scene } from '../../scenes/scene';
import { RenderTarget } from '../../textures/rendertarget';
import { Pass } from '../pass';

export class RenderPass extends Pass {
	constructor(scene: Scene, camera: Camera) {
		super();
		this.swapBuffers = false;
		this.scene = scene;
		this.camera = camera;
	}

	render(renderer: Graphics/*TODO: remove*/, readBuffer: RenderTarget, writeBuffer: RenderTarget, renderToScreen: boolean, delta: number, context: RenderContext) {
		Graphics.pushRenderTarget(renderToScreen ? null : writeBuffer);
		Graphics.render(this.scene, this.camera, delta, context);
		Graphics.popRenderTarget();
	}
}
