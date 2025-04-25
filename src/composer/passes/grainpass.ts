import { vec4 } from 'gl-matrix';

import { Pass } from '../pass';
import { ShaderMaterial } from '../../materials/shadermaterial';
import { FullScreenQuad } from '../../primitives/fullscreenquad';
import { Graphics, RenderContext } from '../../graphics/graphics';
import { RenderTarget } from '../../textures/rendertarget';
import { Scene } from '../../scenes/scene';

export class GrainPass extends Pass {
	#intensity;
	//#density;
	//#size;
	constructor(camera) {//TODO: camera is not really needed
		super();
		let material = new ShaderMaterial({ shaderSource: 'grain' });
		material.addUser(this);
		material.uniforms['uGrainParams'] = vec4.create();
		material.depthTest = false;
		this.scene = new Scene();
		this.quad = new FullScreenQuad({ material: material, parent: this.scene });
		this.camera = camera;
		this.intensity = 0.2;
		//this.density = 0.2;
		//this.size = 1.0;
	}

	set intensity(intensity) {
		this.#intensity = intensity;
		this.quad.material.uniforms['uGrainIntensity'] = this.#intensity;
	}

	/*set density(density) {
		this.#density = density;
		this.quad.material.uniforms['uGrainParams'][1] = this.#density;
	}

	set size(size) {
		this.#size = size;
		this.quad.material.uniforms['uGrainParams'][2] = this.#size;
	}*/

	render(renderer: Graphics, readBuffer: RenderTarget, writeBuffer: RenderTarget, renderToScreen: boolean, delta: number, context: RenderContext) {
		this.quad.material.uniforms['colorMap'] = readBuffer.getTexture();

		renderer.pushRenderTarget(renderToScreen ? null : writeBuffer);
		renderer.render(this.scene, this.camera, 0, context);
		renderer.popRenderTarget();
	}
}
