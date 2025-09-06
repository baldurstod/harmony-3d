import { Pass } from '../pass';
import { ShaderMaterial } from '../../materials/shadermaterial';
import { FullScreenQuad } from '../../primitives/fullscreenquad';
import { Graphics, RenderContext } from '../../graphics/graphics';
import { RenderTarget } from '../../textures/rendertarget';
import { Scene } from '../../scenes/scene';

export class CrosshatchPass extends Pass {
	constructor(camera) {//TODO: camera is not really needed
		super();
		const material = new ShaderMaterial({ shaderSource: 'crosshatch' });
		material.addUser(this);
		material.depthTest = false;
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
