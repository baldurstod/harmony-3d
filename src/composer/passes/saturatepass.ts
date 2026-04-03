import { Camera } from '../../cameras/camera';
import { Graphics, } from '../../graphics/graphics2';
import { WebGPUInternal } from '../../graphics/webgpuinternal';
import { RenderContext } from '../../interfaces/rendercontext';
import { ShaderMaterial } from '../../materials/shadermaterial';
import { FullScreenQuad } from '../../primitives/fullscreenquad';
import { Scene } from '../../scenes/scene';
import { RenderTarget } from '../../textures/rendertarget';
import { getCurrentTexture } from '../../textures/texture';
import { Pass } from '../pass';

export class SaturatePass extends Pass {
	#saturation = 0;
	#material: ShaderMaterial;

	constructor(camera: Camera) {//TODO: camera is not really needed
		super();
		const material = new ShaderMaterial({ shaderSource: 'saturate' });
		this.#material = material;
		material.addUser(this);
		material.depthTest = false;
		this.scene = new Scene();
		this.quad = new FullScreenQuad({ material, parent: this.scene });
		this.camera = camera;
		this.saturation = 1.0;
	}

	/**
	 * @deprecated Use setSaturation instead
	 */
	set saturation(saturation: number) {
		this.setSaturation(saturation);
	}

	setSaturation(saturation: number): void {
		this.#saturation = saturation;
		this.#material.setUniformValue('uSaturation', this.#saturation);
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
