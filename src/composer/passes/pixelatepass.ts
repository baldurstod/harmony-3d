import { Camera } from '../../cameras/camera';
import { Graphics } from '../../graphics/graphics2';
import { WebGPUInternal } from '../../graphics/webgpuinternal';
import { RenderContext } from '../../interfaces/rendercontext';
import { ShaderMaterial } from '../../materials/shadermaterial';
import { FullScreenQuad } from '../../primitives/fullscreenquad';
import { Scene } from '../../scenes/scene';
import { RenderTarget } from '../../textures/rendertarget';
import { getCurrentTexture } from '../../textures/texture';
import { Pass, PassParameters } from '../pass';
import { PassParameter, PassParameterType } from '../passparameters';

export type PixelatePassParameters = PassParameters & {
	camera: Camera;//TODO: camera is not really needed
	style?: number;
	tiles?: number;
};

export class PixelatePass extends Pass {
	#horizontalTiles = 0;
	#pixelStyle = 0;
	readonly #material: ShaderMaterial = new ShaderMaterial({ shaderSource: 'pixelate', user: this, depthTest: false });


	constructor(params: PixelatePassParameters) {
		super();
		this.#material.depthTest = false;
		this.scene = new Scene();
		this.quad = new FullScreenQuad({ material: this.#material, parent: this.scene });
		this.camera = params.camera;
		this.setPixelStyle(params.style ?? 0);
		this.setHorizontalTiles(params.tiles ?? 50);
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
		this.setPixelStyle(pixelStyle);
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
			Graphics.compute(this.quad!, {
				...context,
				workgroupCountX: context.width,
				workgroupCountY: context.height,
			});
		}
	}

	static getParameters(): PassParameter[] {
		return [
			{
				name: 'style',
				type: 'enum',
				defaultValue: 0,
				options: {
					'square': 0,
					'diamond': 1,
					'round': 2,
					'round2': 3,
					'hexagon': 4,
					'voronoi': 5,
					'triangle': 6,
				},
			},
			{
				name: 'tiles',
				type: 'range',
				defaultValue: 50,
				min: 1,
				max: 200,
			},
		];
	}

	setParameterValue(name: string, value: PassParameterType): void {
		switch (name) {
			case 'style':
				this.setPixelStyle(value as number);
				break;
			case 'style':
				this.setHorizontalTiles(value as number);
				break;
		}
	}
}
