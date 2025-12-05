import { mat4, vec3, vec4 } from 'gl-matrix';
import { Camera } from '../cameras/camera';
import { InternalRenderContext } from '../interfaces/rendercontext';
import { Scene } from '../scenes/scene';
import { ToneMapping } from '../textures/constants';
import { RenderList } from './renderlist';

const tempViewProjectionMatrix = mat4.create();
const lightDirection = vec3.create();

export interface Renderer {
	render: (scene: Scene, camera: Camera, delta: number, context: InternalRenderContext) => void;
	renderShadowMap: (renderList: RenderList, camera: Camera, renderLights: boolean, context: InternalRenderContext, lightPos?: vec3) => void;
	clear: (color: boolean, depth: boolean, stencil: boolean) => void;
	/**
	* Invalidate all shader (force recompile)
	*/
	invalidateShaders: () => void;

	setToneMapping: (toneMapping: ToneMapping) => void;
	getToneMapping: () => ToneMapping;
	setToneMappingExposure: (exposure: number) => void;
	getToneMappingExposure: () => number;

	clearColor: (clearColor: vec4) => void
	/*

		clearColor(clearColor: vec4) {
			WebGLRenderingState.clearColor(clearColor);
		}

		clearDepth(clearDepth: GLclampf) {
			WebGLRenderingState.clearDepth(clearDepth);
		}

		clearStencil(clearStencil: GLint) {
			WebGLRenderingState.clearStencil(clearStencil);
		}
			*/
}
