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

export class OldMoviePass extends Pass {
	#material: ShaderMaterial;

	constructor(camera: Camera) {
		super();
		const material = new ShaderMaterial({ shaderSource: 'oldmovie' });
		material.addUser(this);
		material.depthTest = false;
		this.#material = material;
		this.scene = new Scene();
		this.quad = new FullScreenQuad({ material: material, parent: this.scene });
		this.camera = camera;
	}

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
