import { Camera } from '../../cameras/camera';
import { Graphics } from '../../graphics/graphics2';
import { RenderContext } from '../../interfaces/rendercontext';
import { ShaderMaterial } from '../../materials/shadermaterial';
import { FullScreenQuad } from '../../primitives/fullscreenquad';
import { Scene } from '../../scenes/scene';
import { RenderTarget } from '../../textures/rendertarget';
import { Pass } from '../pass';

export class PixelatePass extends Pass {
	#horizontalTiles = 0;
	#pixelStyle = 0;
	#material;

	constructor(camera: Camera) {//TODO: camera is not really needed
		super();
		this.#material = new ShaderMaterial({ shaderSource: 'pixelate' });
		this.#material.addUser(this);
		this.#material.depthTest = false;
		this.scene = new Scene();
		this.quad = new FullScreenQuad({ material: this.#material, parent: this.scene });
		this.camera = camera;
		this.horizontalTiles = 10;
	}

	set horizontalTiles(horizontalTiles: number) {
		this.#horizontalTiles = horizontalTiles;
		this.#material.uniforms['uHorizontalTiles'] = this.#horizontalTiles;
	}

	set pixelStyle(pixelStyle: number/*TODO: creacte enum*/) {
		this.#pixelStyle = pixelStyle;
		this.#material.setDefine('PIXEL_STYLE', String(pixelStyle));
	}

	render(readBuffer: RenderTarget, writeBuffer: RenderTarget, renderToScreen: boolean, delta: number, context: RenderContext) {
		this.#material.uniforms['colorMap'] = readBuffer.getTexture();
		if (Graphics.isWebGLAny) {
			Graphics.pushRenderTarget(renderToScreen ? null : writeBuffer);
			Graphics.render(this.scene!, this.camera!, 0, context);
			Graphics.popRenderTarget();
		} else {
			Graphics.compute(this.#material, context.width!, context.height);
		}
	}
}
