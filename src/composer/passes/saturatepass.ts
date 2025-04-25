import { Pass } from '../pass';
import { ShaderMaterial } from '../../materials/shadermaterial';
import { FullScreenQuad } from '../../primitives/fullscreenquad';
import { Graphics, RenderContext } from '../../graphics/graphics';
import { RenderTarget } from '../../textures/rendertarget';
import { Scene } from '../../scenes/scene';

export class SaturatePass extends Pass {
	#saturation;
	constructor(camera) {//TODO: camera is not really needed
		super();
		let material = new ShaderMaterial({ shaderSource: 'saturate' });
		material.addUser(this);
		material.depthTest = false;
		this.scene = new Scene();
		this.quad = new FullScreenQuad({ material: material, parent: this.scene });
		this.camera = camera;
		this.saturation = 1.0;
	}

	set saturation(saturation) {
		this.#saturation = saturation;
		this.quad.material.uniforms['uSaturation'] = this.#saturation;
	}

	render(renderer: Graphics, readBuffer: RenderTarget, writeBuffer: RenderTarget, renderToScreen: boolean, delta: number, context: RenderContext) {
		this.quad.material.uniforms['colorMap'] = readBuffer.getTexture();

		renderer.pushRenderTarget(renderToScreen ? null : writeBuffer);
		renderer.render(this.scene, this.camera, 0, context);
		renderer.popRenderTarget();
	}
}
