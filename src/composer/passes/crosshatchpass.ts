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

export class CrosshatchPass extends Pass {
	#material: ShaderMaterial = new ShaderMaterial({ shaderSource: 'crosshatch', user: this, depthTest: false });

	constructor(camera: Camera) {//TODO: camera is not really needed
		super();
		this.scene = new Scene();
		this.quad = new FullScreenQuad({ material: this.#material, parent: this.scene });
		this.camera = camera;
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
			Graphics.compute(this.quad!, {
				...context,
				workgroupCountX: context.width,
				workgroupCountY: context.height,
			});
		}
	}
}
