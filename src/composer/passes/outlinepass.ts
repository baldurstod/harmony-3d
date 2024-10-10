import { vec2, vec4 } from 'gl-matrix';

import { Pass } from './pass';
import { MATERIAL_BLENDING_ADDITIVE } from '../materials/material';
import { ShaderMaterial } from '../materials/shadermaterial';
import { FullScreenQuad } from '../primitives/fullscreenquad';
import { RenderTarget } from '../textures/rendertarget';
import { Scene } from '../scenes/scene';
import { Camera } from '../cameras/camera';

const CLEAR_COLOR = vec4.fromValues(0, 0, 0, 0);

let tempVec2 = vec2.create();

export class OutlinePass extends Pass {
	#edgedetectionMaterial;
	#copyMaterial;
	scene: Scene;
	#renderTargetDepthBuffer: RenderTarget;
	#renderTargetMaskDownSampleBuffer: RenderTarget;
	#renderTargetBlurBuffer1: RenderTarget;
	#renderTargetBlurBuffer2: RenderTarget;
	#renderTargetEdgeBuffer1: RenderTarget;
	#renderTargetEdgeBuffer2: RenderTarget;
	width = 1;
	height = 1;
	constructor(scene: Scene, camera: Camera) {
		super();
		this.scene = scene;
		this.camera = camera;

		this.#initRenderTargets();



		this.#copyMaterial = new ShaderMaterial({ shaderSource: 'copy' });
		this.#copyMaterial.addUser(this);
		this.#copyMaterial.depthTest = false;
		this.#copyMaterial.setBlending(MATERIAL_BLENDING_ADDITIVE);

		this.#edgedetectionMaterial = new ShaderMaterial({ shaderSource: 'edgedetection' });
		this.#edgedetectionMaterial.addUser(this);


		this.quad = new FullScreenQuad();
		//this.quad.material = material;
		this.camera = camera;

	}

	#initRenderTargets() {
		this.#renderTargetDepthBuffer = new RenderTarget({ width: 1, height: 1, }/*, {internalFormat:GL_DEPTH_COMPONENT16, format:GL_DEPTH_COMPONENT, type:GL_UNSIGNED_INT}*/);
		this.#renderTargetMaskDownSampleBuffer = new RenderTarget({ width: 1, height: 1, });
		this.#renderTargetBlurBuffer1 = new RenderTarget({ width: 1, height: 1, });
		this.#renderTargetBlurBuffer2 = new RenderTarget({ width: 1, height: 1, });
		this.#renderTargetEdgeBuffer1 = new RenderTarget({ width: 1, height: 1, });
		this.#renderTargetEdgeBuffer2 = new RenderTarget({ width: 1, height: 1, });
	}

	setSize(width, height) {
		this.width = width;
		this.height = height;
		this.#renderTargetDepthBuffer.resize(width, height);
		this.#renderTargetMaskDownSampleBuffer.resize(width, height);
		this.#renderTargetBlurBuffer1.resize(width, height);
		this.#renderTargetBlurBuffer2.resize(width, height);
		this.#renderTargetEdgeBuffer1.resize(width, height);
		this.#renderTargetEdgeBuffer2.resize(width, height);

	}

	changeVisibilityOfSelectedObjects(visible) {
		this.scene.forEach((entity) => {
			if (entity.properties.get('selected') && entity.isRenderable) {
				if (visible) {
					entity.visible = entity.properties.get('oldVisible');
					entity.properties.delete('oldVisible');
				} else {
					entity.properties.set('oldVisible', entity.visibleSelf);
					entity.visible = visible;
				}
			}
		});
	}

	changeVisibilityOfNonSelectedObjects(visible) {
		this.scene.forEach((entity) => {
			if (!entity.properties.get('selected') && entity.isRenderable) {
				if (visible) {
					entity.visible = entity.properties.get('oldVisible');
					entity.properties.delete('oldVisible');
				} else {
					entity.properties.set('oldVisible', entity.visibleSelf);
					entity.visible = visible;
				}
			}
		});
	}

	render(renderer, readBuffer, writeBuffer, renderToScreen) {
		renderer.getSize(tempVec2);
		let width = tempVec2[0];
		let height = tempVec2[1];


		renderer.clearColor(CLEAR_COLOR);

		renderer.pushRenderTarget(this.#renderTargetDepthBuffer);
		renderer.clear(true, true, false);


		//renderer.setIncludeCode('WRITE_DEPTH_TO_COLOR', '#define WRITE_DEPTH_TO_COLOR');

		this.changeVisibilityOfSelectedObjects(false);
		renderer.colorMask = [0, 0, 0, 0];
		renderer.render(this.scene, this.camera, 0);
		renderer.colorMask = undefined;
		this.changeVisibilityOfSelectedObjects(true);
		//renderer.setIncludeCode('WRITE_DEPTH_TO_COLOR', '');

		this.changeVisibilityOfNonSelectedObjects(false);
		renderer.setIncludeCode('outline_pass_silhouette_mode', '#define SILHOUETTE_MODE');
		renderer.setIncludeCode('silhouetteColor', '#define SILHOUETTE_COLOR vec4(1.0)');
		renderer.render(this.scene, this.camera, 0);
		renderer.setIncludeCode('outline_pass_silhouette_mode', '#undef SILHOUETTE_MODE');
		this.changeVisibilityOfNonSelectedObjects(true);
		renderer.popRenderTarget();

		/**************/
		this.#edgedetectionMaterial.uniforms['colorMap'] = this.#renderTargetDepthBuffer.getTexture();//TODO: optiùmize this
		this.#edgedetectionMaterial.uniforms['uTexSize'] = [this.width, this.height];
		this.#edgedetectionMaterial.uniforms['uVisibleEdgeColor'] = [1, 1, 1];
		this.#edgedetectionMaterial.uniforms['uHiddenEdgeColor'] = [0, 1, 0];
		this.quad.setMaterial(this.#edgedetectionMaterial);
		renderer.pushRenderTarget(this.#renderTargetEdgeBuffer1);
		renderer.clear(true, true, false);
		renderer.render(this.quad, this.camera, 0);
		renderer.popRenderTarget();

		/**************/


		this.#copyMaterial.uniforms['colorMap'] = readBuffer.getTexture();
		this.quad.setMaterial(this.#copyMaterial);
		renderer.pushRenderTarget(renderToScreen ? null : writeBuffer);
		renderer.clear(true, true, false);
		renderer.render(this.quad, this.camera, 0);
		renderer.popRenderTarget();


		/***************/

		this.#copyMaterial.uniforms['colorMap'] = this.#renderTargetEdgeBuffer1.getTexture();
		this.quad.setMaterial(this.#copyMaterial);
		renderer.pushRenderTarget(renderToScreen ? null : writeBuffer);
		renderer.render(this.quad, this.camera, 0);
		renderer.popRenderTarget();

	}
}
