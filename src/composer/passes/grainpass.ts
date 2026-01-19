import { vec4 } from 'gl-matrix';
import { Camera } from '../../cameras/camera';
import { Graphics } from '../../graphics/graphics2';
import { WebGPUInternal } from '../../graphics/webgpuinternal';
import { RenderContext } from '../../interfaces/rendercontext';
import { ShaderMaterial } from '../../materials/shadermaterial';
import { FullScreenQuad } from '../../primitives/fullscreenquad';
import { Scene } from '../../scenes/scene';
import { RenderTarget } from '../../textures/rendertarget';
import { getCurrentTexture } from '../../textures/texture';
import { Pass } from '../pass';

export class GrainPass extends Pass {
	#intensity!: number;
	#material: ShaderMaterial;
	//#density;
	//#size;
	constructor(camera: Camera) {//TODO: camera is not really needed
		super();
		const material = new ShaderMaterial({ shaderSource: 'grain' });
		material.addUser(this);
		material.uniforms['uGrainParams'] = vec4.create();
		material.depthTest = false;
		this.#material = material;
		this.scene = new Scene();
		this.quad = new FullScreenQuad({ material: material, parent: this.scene });
		this.camera = camera;
		this.intensity = 0.2;
		//this.density = 0.2;
		//this.size = 1.0;
	}

	set intensity(intensity: number) {
		this.#intensity = intensity;
		this.#material.uniforms['uGrainIntensity'] = this.#intensity;
	}

	/*set density(density) {
		this.#density = density;
		this.quad.material.uniforms['uGrainParams'][1] = this.#density;
	}

	set size(size) {
		this.#size = size;
		this.quad.material.uniforms['uGrainParams'][2] = this.#size;
	}*/

	render(readBuffer: RenderTarget, writeBuffer: RenderTarget, renderToScreen: boolean, delta: number, context: RenderContext) {
		this.#material.uniforms['colorMap'] = readBuffer.getTexture();
		if (Graphics.isWebGLAny) {
			Graphics.pushRenderTarget(renderToScreen ? null : writeBuffer);
			Graphics.render(this.scene!, this.camera!, 0, context);
			Graphics.popRenderTarget();
		} else {
			this.#material.uniforms['outTexture'] = renderToScreen ? getCurrentTexture() : writeBuffer.getTexture();
			this.#material.setDefine('OUTPUT_FORMAT', renderToScreen ? WebGPUInternal.format : 'rgba8unorm');
			Graphics.compute(this.#material, context, context.width!, context.height);
		}
	}
}
