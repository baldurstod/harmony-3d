import { Camera } from '../../cameras/camera';
import { Graphics } from '../../graphics/graphics2';
import { RenderContext } from '../../interfaces/rendercontext';
import { ShaderMaterial } from '../../materials/shadermaterial';
import { FullScreenQuad } from '../../primitives/fullscreenquad';
import { Scene } from '../../scenes/scene';
import { RenderTarget } from '../../textures/rendertarget';
import { Pass } from '../pass';

export class PalettePass extends Pass {
	constructor(camera: Camera) {//TODO: camera is not really needed
		super();
		const material = new ShaderMaterial({ shaderSource: 'palette' });
		material.addUser(this);
		material.depthTest = false;
		this.scene = new Scene();
		this.quad = new FullScreenQuad({ material: material, parent: this.scene });
		this.camera = camera;
	}

	render(readBuffer: RenderTarget, writeBuffer: RenderTarget, renderToScreen: boolean, delta: number, context: RenderContext) {
		this.quad!.getMaterial().uniforms['colorMap'] = readBuffer.getTexture();

		Graphics.pushRenderTarget(renderToScreen ? null : writeBuffer);
		Graphics.render(this.scene!, this.camera!, 0, context);
		Graphics.popRenderTarget();
	}
}
