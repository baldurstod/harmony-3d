import { Pass } from '../pass';
import { ShaderMaterial } from '../../materials/shadermaterial';
import { FullScreenQuad } from '../../primitives/fullscreenquad';
import { Camera } from '../../cameras/camera';
import { Graphics, RenderContext } from '../../graphics/graphics';
import { RenderTarget } from '../../textures/rendertarget';
import { Scene } from '../../scenes/scene';

export class CopyPass extends Pass {
	constructor(camera: Camera) {//TODO: camera is not really needed
		super();
		const material = new ShaderMaterial({ shaderSource: 'copy', depthTest: false });
		material.addUser(this);
		this.scene = new Scene();
		this.quad = new FullScreenQuad({ material: material, parent: this.scene });
		this.camera = camera;
	}

	render(renderer: Graphics/*TODO: remove*/, readBuffer: RenderTarget, writeBuffer: RenderTarget, renderToScreen: boolean, delta: number, context: RenderContext) {
		this.quad.material.uniforms['colorMap'] = readBuffer.getTexture();

		Graphics.pushRenderTarget(renderToScreen ? null : writeBuffer);
		Graphics.render(this.scene, this.camera, 0, context);
		Graphics.popRenderTarget();
	}
}
