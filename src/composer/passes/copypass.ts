import { Pass } from './pass';
import { ShaderMaterial } from '../materials/shadermaterial';
import { FullScreenQuad } from '../primitives/fullscreenquad';
import { Camera } from '../cameras/camera';

export class CopyPass extends Pass {
	constructor(camera: Camera) {//TODO: camera is not really needed
		super();
		let material = new ShaderMaterial({ shaderSource: 'copy', depthTest: false });
		material.addUser(this);
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
