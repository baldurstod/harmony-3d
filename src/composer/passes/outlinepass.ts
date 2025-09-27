import { vec2, vec4 } from 'gl-matrix';
import { Camera } from '../../cameras/camera';
import { Graphics, } from '../../graphics/graphics2';
import { InternalRenderContext } from '../../interfaces/rendercontext';
import { MATERIAL_BLENDING_ADDITIVE } from '../../materials/material';
import { ShaderMaterial } from '../../materials/shadermaterial';
import { FullScreenQuad } from '../../primitives/fullscreenquad';
import { Scene } from '../../scenes/scene';
import { RenderTarget } from '../../textures/rendertarget';
import { Pass } from '../pass';

const CLEAR_COLOR = vec4.fromValues(0, 0, 0, 0);

const tempVec2 = vec2.create();

export class OutlinePass extends Pass {
	#edgedetectionMaterial;
	#copyMaterial;
	outlineScene: Scene;
	#renderTargetDepthBuffer!: RenderTarget;
	#renderTargetMaskDownSampleBuffer!: RenderTarget;
	#renderTargetBlurBuffer1!: RenderTarget;
	#renderTargetBlurBuffer2!: RenderTarget;
	#renderTargetEdgeBuffer1!: RenderTarget;
	#renderTargetEdgeBuffer2!: RenderTarget;
	width = 1;
	height = 1;

	constructor(outlineScene: Scene, camera: Camera) {
		super();
		this.outlineScene = outlineScene;
		this.camera = camera;

		this.#initRenderTargets();



		this.#copyMaterial = new ShaderMaterial({ shaderSource: 'copy' });
		this.#copyMaterial.addUser(this);
		this.#copyMaterial.depthTest = false;
		this.#copyMaterial.setBlending(MATERIAL_BLENDING_ADDITIVE);

		this.#edgedetectionMaterial = new ShaderMaterial({ shaderSource: 'edgedetection' });
		this.#edgedetectionMaterial.addUser(this);


		this.scene = new Scene();
		this.quad = new FullScreenQuad({ parent: this.scene });
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

	setSize(width: number, height: number): void {
		this.width = width;
		this.height = height;
		this.#renderTargetDepthBuffer.resize(width, height);
		this.#renderTargetMaskDownSampleBuffer.resize(width, height);
		this.#renderTargetBlurBuffer1.resize(width, height);
		this.#renderTargetBlurBuffer2.resize(width, height);
		this.#renderTargetEdgeBuffer1.resize(width, height);
		this.#renderTargetEdgeBuffer2.resize(width, height);

	}

	changeVisibilityOfSelectedObjects(visible: boolean): void {
		this.outlineScene.forEach((entity) => {
			if (entity.properties.get('selected') && entity.isRenderable) {
				if (visible) {
					entity.setVisible(entity.properties.getBoolean('oldVisible'));
					entity.properties.delete('oldVisible');
				} else {
					const isVisibleSelf = entity.isVisibleSelf();
					if (isVisibleSelf !== undefined) {
						entity.properties.setBoolean('oldVisible', isVisibleSelf);
					}
					entity.setVisible(visible);
				}
			}
		});
	}

	changeVisibilityOfNonSelectedObjects(visible: boolean) {
		this.outlineScene.forEach((entity) => {
			if (!entity.properties.get('selected') && entity.isRenderable) {
				if (visible) {
					entity.setVisible(entity.properties.getBoolean('oldVisible'));
					entity.properties.delete('oldVisible');
				} else {
					const isVisibleSelf = entity.isVisibleSelf();
					if (isVisibleSelf !== undefined) {
						entity.properties.setBoolean('oldVisible', isVisibleSelf);
					}
					entity.setVisible(visible);
				}
			}
		});
	}

	render(readBuffer: RenderTarget, writeBuffer: RenderTarget, renderToScreen: boolean, delta: number, context: InternalRenderContext) {
		Graphics.getSize(tempVec2);
		const width = tempVec2[0];
		const height = tempVec2[1];


		Graphics.clearColor(CLEAR_COLOR);

		Graphics.pushRenderTarget(this.#renderTargetDepthBuffer);
		Graphics.clear(true, true, false);


		//renderer.setIncludeCode('WRITE_DEPTH_TO_COLOR', '#define WRITE_DEPTH_TO_COLOR');

		this.changeVisibilityOfSelectedObjects(false);
		Graphics.setColorMask([0, 0, 0, 0]);
		Graphics.render(this.outlineScene, this.camera!, 0, context.renderContext);
		Graphics.setColorMask([1, 1, 1, 1]);
		this.changeVisibilityOfSelectedObjects(true);
		//renderer.setIncludeCode('WRITE_DEPTH_TO_COLOR', '');

		this.changeVisibilityOfNonSelectedObjects(false);
		Graphics.setIncludeCode('outline_pass_silhouette_mode', '#define SILHOUETTE_MODE');
		Graphics.setIncludeCode('silhouetteColor', '#define SILHOUETTE_COLOR vec4(1.0)');
		Graphics.render(this.outlineScene, this.camera!, 0, context.renderContext);
		Graphics.setIncludeCode('outline_pass_silhouette_mode', '#undef SILHOUETTE_MODE');
		this.changeVisibilityOfNonSelectedObjects(true);
		Graphics.popRenderTarget();

		/**************/
		this.#edgedetectionMaterial.uniforms['colorMap'] = this.#renderTargetDepthBuffer.getTexture();//TODO: optiùmize this
		this.#edgedetectionMaterial.uniforms['uTexSize'] = [this.width, this.height];
		this.#edgedetectionMaterial.uniforms['uVisibleEdgeColor'] = [1, 1, 1];
		this.#edgedetectionMaterial.uniforms['uHiddenEdgeColor'] = [0, 1, 0];
		this.quad!.setMaterial(this.#edgedetectionMaterial);
		Graphics.pushRenderTarget(this.#renderTargetEdgeBuffer1);
		Graphics.clear(true, true, false);
		Graphics.render(this.scene!, this.camera!, 0, context.renderContext);
		Graphics.popRenderTarget();

		/**************/


		this.#copyMaterial.uniforms['colorMap'] = readBuffer.getTexture();
		this.quad!.setMaterial(this.#copyMaterial);
		Graphics.pushRenderTarget(renderToScreen ? null : writeBuffer);
		Graphics.clear(true, true, false);
		Graphics.render(this.scene!, this.camera!, 0, context.renderContext);
		Graphics.popRenderTarget();


		/***************/

		this.#copyMaterial.uniforms['colorMap'] = this.#renderTargetEdgeBuffer1.getTexture();
		this.quad!.setMaterial(this.#copyMaterial);
		Graphics.pushRenderTarget(renderToScreen ? null : writeBuffer);
		Graphics.render(this.scene!, this.camera!, 0, context.renderContext);
		Graphics.popRenderTarget();

	}
}
