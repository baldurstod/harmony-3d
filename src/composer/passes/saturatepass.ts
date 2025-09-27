import { Camera } from '../../cameras/camera';
import { Graphics, } from '../../graphics/graphics2';
import { InternalRenderContext } from '../../interfaces/rendercontext';
import { ShaderMaterial } from '../../materials/shadermaterial';
import { FullScreenQuad } from '../../primitives/fullscreenquad';
import { Scene } from '../../scenes/scene';
import { RenderTarget } from '../../textures/rendertarget';
import { Pass } from '../pass';

export class SaturatePass extends Pass {
	#saturation = 0;

	constructor(camera: Camera) {//TODO: camera is not really needed
		super();
		const material = new ShaderMaterial({ shaderSource: 'saturate' });
		material.addUser(this);
		material.depthTest = false;
		this.scene = new Scene();
		this.quad = new FullScreenQuad({ material: material, parent: this.scene });
		this.camera = camera;
		this.saturation = 1.0;
	}

	set saturation(saturation: number) {
		this.#saturation = saturation;
		this.quad!.getMaterial().uniforms['uSaturation'] = this.#saturation;
	}

	render(readBuffer: RenderTarget, writeBuffer: RenderTarget, renderToScreen: boolean, delta: number, context: InternalRenderContext) {
		this.quad!.getMaterial().uniforms['colorMap'] = readBuffer.getTexture();

		Graphics.pushRenderTarget(renderToScreen ? null : writeBuffer);
		Graphics.render(this.scene!, this.camera!, 0, context.renderContext);
		Graphics.popRenderTarget();
	}
}
