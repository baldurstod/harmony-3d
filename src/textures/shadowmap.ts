import { vec2, vec3, vec4 } from 'gl-matrix';
import { Camera } from '../cameras/camera';
import { Graphics } from '../graphics/graphics2';
import { InternalRenderContext } from '../interfaces/rendercontext';
import { PointLight } from '../lights/pointlight';
import { Renderer } from '../renderers/renderer';
import { RenderList } from '../renderers/renderlist';
import { GL_BLEND, GL_DEPTH_TEST, GL_SCISSOR_TEST } from '../webgl/constants';
import { WebGLRenderingState } from '../webgl/renderingstate';

const CLEAR_COLOR = vec4.fromValues(1, 0, 1, 1);

const a = vec4.create();
const mapSize = vec2.create();
const lightPos = vec3.create();
const viewPort = vec4.create();

export class ShadowMap {

	render(renderer: Renderer, renderList: RenderList, camera: Camera, context: InternalRenderContext) {
		const lights = renderList.lights;

		const blendCapability = WebGLRenderingState.isEnabled(GL_BLEND);
		const scissorCapability = WebGLRenderingState.isEnabled(GL_SCISSOR_TEST);
		const depthCapability = WebGLRenderingState.isEnabled(GL_DEPTH_TEST);
		WebGLRenderingState.getClearColor(a);

		WebGLRenderingState.disable(GL_BLEND);
		WebGLRenderingState.disable(GL_SCISSOR_TEST);
		WebGLRenderingState.enable(GL_DEPTH_TEST);
		WebGLRenderingState.clearColor(CLEAR_COLOR);
		Graphics.setIncludeCode('WRITE_DEPTH_TO_COLOR', '#define WRITE_DEPTH_TO_COLOR');

		let renderTarget;
		let shadowViewport;
		for (const light of lights) {
			if (light.castShadow) {
				const shadow = light.shadow;
				if (shadow) {
					light.getWorldPosition(lightPos);
					renderTarget = shadow.renderTarget;
					vec2.copy(mapSize, shadow.textureSize);
					Graphics.pushRenderTarget(renderTarget);
					WebGLRenderingState.clear(true, true, true);
					Graphics.setIncludeCode('IS_POINT_LIGHT', (light as PointLight).isPointLight ? '#define IS_POINT_LIGHT' : '');
					for (let viewPortIndex = 0; viewPortIndex < shadow.viewPortsLength; ++viewPortIndex) {
						shadowViewport = shadow.viewPorts[viewPortIndex]!;
						vec4.set(viewPort,
							mapSize[0] * shadowViewport[0],
							mapSize[1] * shadowViewport[1],
							mapSize[0] * shadowViewport[2],
							mapSize[1] * shadowViewport[3],
						);


						shadow.computeShadowMatrix(viewPortIndex);
						Graphics.setViewport(viewPort);
						renderer._renderRenderList(renderList, shadow.camera, false, context, lightPos);
					}
					Graphics.popRenderTarget();
				}
			}
		}

		blendCapability ? WebGLRenderingState.enable(GL_BLEND) : WebGLRenderingState.disable(GL_BLEND);
		scissorCapability ? WebGLRenderingState.enable(GL_SCISSOR_TEST) : WebGLRenderingState.disable(GL_SCISSOR_TEST);
		depthCapability ? WebGLRenderingState.enable(GL_DEPTH_TEST) : WebGLRenderingState.disable(GL_DEPTH_TEST);
		WebGLRenderingState.clearColor(a);
		Graphics.setIncludeCode('WRITE_DEPTH_TO_COLOR', '');
	}
}
