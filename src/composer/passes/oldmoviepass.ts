import { Pass } from '../pass';
import { ShaderMaterial } from '../../materials/shadermaterial';
import { FullScreenQuad } from '../../primitives/fullscreenquad';

export class OldMoviePass extends Pass {
	constructor(camera) {
		super();
		let material = new ShaderMaterial({ shaderSource: 'oldmovie' });
		material.addUser(this);
		material.depthTest = false;
		this.quad = new FullScreenQuad({ material: material });
		this.camera = camera;
	}

	render(renderer, readBuffer, writeBuffer, renderToScreen) {
		this.quad.material.uniforms['colorMap'] = readBuffer.getTexture();

		renderer.pushRenderTarget(renderToScreen ? null : writeBuffer);
		renderer.render(this.quad, this.camera);
		renderer.popRenderTarget();
	}
}