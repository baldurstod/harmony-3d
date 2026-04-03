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

export class PixelatePass extends Pass {
	#horizontalTiles = 0;
	#pixelStyle = 0;
	#material: ShaderMaterial;

	constructor(camera: Camera) {//TODO: camera is not really needed
		super();
		this.#material = new ShaderMaterial({ shaderSource: 'pixelate', user: this });
		this.#material.depthTest = false;
		this.scene = new Scene();
		this.quad = new FullScreenQuad({ material: this.#material, parent: this.scene });
		this.camera = camera;
		this.horizontalTiles = 10;
	}

	/**
	 * @deprecated Use setHorizontalTiles instead
	 */
	set horizontalTiles(horizontalTiles: number) {
		this.setHorizontalTiles(horizontalTiles);
	}

	setHorizontalTiles(horizontalTiles: number): void {
		this.#horizontalTiles = horizontalTiles;
		this.#material.setUniformValue('uHorizontalTiles', this.#horizontalTiles);
	}

	/**
	 * @deprecated Use setPixelStyle instead
	 */
	set pixelStyle(pixelStyle: number/*TODO: creacte enum*/) {
	}

	setPixelStyle(pixelStyle: number/*TODO: creacte enum*/): void {
		this.#pixelStyle = pixelStyle;
		this.#material.setDefine('PIXEL_STYLE', String(pixelStyle));
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
