import { Camera } from '../../cameras/camera';
import { Graphics } from '../../graphics/graphics2';
import { InternalRenderContext } from '../../interfaces/rendercontext';
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

	render(readBuffer: RenderTarget, writeBuffer: RenderTarget, renderToScreen: boolean, delta: number, context: InternalRenderContext) {
		Graphics.pushRenderTarget(renderToScreen ? null : writeBuffer);
		Graphics.render(this.scene!, this.camera!, delta, context.renderContext);
		Graphics.popRenderTarget();
	}
}
