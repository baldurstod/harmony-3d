import { Pass } from './pass';
import { ShaderMaterial } from '../materials/shadermaterial';
import { FullScreenQuad } from '../primitives/fullscreenquad';

export class SaturatePass extends Pass {
	#saturation;
	constructor(camera) {//TODO: camera is not really needed
		super();
		let material = new ShaderMaterial({ shaderSource: 'saturate' });
		material.addUser(this);
		material.depthTest = false;
		this.quad = new FullScreenQuad({ material: material });
		this.camera = camera;
		this.saturation = 1.0;
	}

	set saturation(saturation) {
		this.#saturation = saturation;
		this.quad.material.uniforms['uSaturation'] = this.#saturation;
	}

	render(renderer, readBuffer, writeBuffer, renderToScreen) {
		this.quad.material.uniforms['colorMap'] = readBuffer.getTexture();

		renderer.pushRenderTarget(renderToScreen ? null : writeBuffer);
		renderer.render(this.quad, this.camera);
		renderer.popRenderTarget();
	}
}
