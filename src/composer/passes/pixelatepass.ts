import { Pass } from './pass';
import { ShaderMaterial } from '../materials/shadermaterial';
import { FullScreenQuad } from '../primitives/fullscreenquad';

export class PixelatePass extends Pass {
	#horizontalTiles;
	#pixelStyle;
	#material;
	constructor(camera) {//TODO: camera is not really needed
		super();
		this.#material = new ShaderMaterial({ shaderSource: 'pixelate' });
		this.#material.addUser(this);
		this.#material.depthTest = false;
		this.quad = new FullScreenQuad({ material: this.#material });
		this.camera = camera;
		this.horizontalTiles = 10;
	}

	set horizontalTiles(horizontalTiles) {
		this.#horizontalTiles = horizontalTiles;
		this.#material.uniforms['uHorizontalTiles'] = this.#horizontalTiles;
	}

	set pixelStyle(pixelStyle) {
		this.#pixelStyle = pixelStyle;
		this.#material.setDefine('PIXEL_STYLE', pixelStyle);
	}

	render(renderer, readBuffer, writeBuffer, renderToScreen) {
		this.#material.uniforms['colorMap'] = readBuffer.getTexture();

		renderer.pushRenderTarget(renderToScreen ? null : writeBuffer);
		renderer.render(this.quad, this.camera);
		renderer.popRenderTarget();
	}
}
