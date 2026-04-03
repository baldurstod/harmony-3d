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
		const material = new ShaderMaterial({ shaderSource: 'grain', user: this });
		material.setUniformValue('uGrainParams', vec4.create());
		material.depthTest = false;
		this.#material = material;
		this.scene = new Scene();
		this.quad = new FullScreenQuad({ material: material, parent: this.scene });
		this.camera = camera;
		this.setIntensity(0.2);
		//this.density = 0.2;
		//this.size = 1.0;
	}

	/**
	 * @deprecated Use setIntensity instead
	 */
	set intensity(intensity: number) {
		this.setIntensity(intensity);
	}

	setIntensity(intensity: number): void {
		this.#intensity = intensity;
		this.#material.setUniformValue('uGrainIntensity', this.#intensity);
	}

	render(readBuffer: RenderTarget, writeBuffer: RenderTarget, renderToScreen: boolean, delta: number, context: RenderContext) {
		this.#material.setUniformValue('colorMap', readBuffer.getTexture());
		if (Graphics.isWebGLAny) {
			Graphics.pushRenderTarget(renderToScreen ? null : writeBuffer);
			Graphics.render(this.scene!, this.camera!, 0, context);
			Graphics.popRenderTarget();
		} else {
			this.#material.setUniformValue('outTexture', renderToScreen ? getCurrentTexture() : writeBuffer.getTexture());
			this.#material.setDefine('OUTPUT_FORMAT', renderToScreen ? WebGPUInternal.format : 'rgba8unorm');
			Graphics.compute(this.#material, {
				...context,
				workgroupCountX: context.width,
				workgroupCountY: context.height,
			});
		}
	}
}
