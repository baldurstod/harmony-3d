import { Camera } from '../cameras/camera';
import { InternalRenderContext } from '../interfaces/rendercontext';
import { RenderFace } from '../materials/constants';
import { Material } from '../materials/material';
import { Scene } from '../scenes/scene';
import { ShadowMap } from '../textures/shadowmap';
import { GL_BACK, GL_BLEND, GL_CULL_FACE, GL_DEPTH_TEST, GL_FRONT, GL_FRONT_AND_BACK, GL_SCISSOR_TEST } from '../webgl/constants';
import { Program } from '../webgl/program';
import { WebGLRenderingState } from '../webgl/renderingstate';
import { Renderer } from './renderer';
import { RenderList } from './renderlist';

export class ForwardRenderer extends Renderer {
	#shadowMap: ShadowMap;
	#frame = 0;

	constructor() {
		super();
		this.#shadowMap = new ShadowMap();
	}

	applyMaterial(program: Program, material: Material) {
		if (material.depthTest) {
			WebGLRenderingState.enable(GL_DEPTH_TEST);
			WebGLRenderingState.depthFunc(material.depthFunc);
		} else {
			WebGLRenderingState.disable(GL_DEPTH_TEST);
		}
		WebGLRenderingState.depthMask(material.depthMask);
		WebGLRenderingState.colorMask(material.colorMask);

		if (material.blend) {
			WebGLRenderingState.enable(GL_BLEND);
			WebGLRenderingState.blendFuncSeparate(material.srcRGB, material.dstRGB, material.srcAlpha, material.dstAlpha);
			WebGLRenderingState.blendEquationSeparate(material.modeRGB, material.modeAlpha);
		} else {
			WebGLRenderingState.disable(GL_BLEND);
		}

		/*
		if (material.disableCulling === true) {
			WebGLRenderingState.disable(GL_CULL_FACE);
		} else {
			WebGLRenderingState.enable(GL_CULL_FACE);
			WebGLRenderingState.cullFace(material.cullMode);
		}
			*/
		const renderFace = material.getRenderFace();
		switch (renderFace) {
			case RenderFace.Front:
				WebGLRenderingState.enable(GL_CULL_FACE);
				WebGLRenderingState.cullFace(GL_BACK);
				break;
			case RenderFace.Back:
				WebGLRenderingState.enable(GL_CULL_FACE);
				WebGLRenderingState.cullFace(GL_FRONT);
				break;
			case RenderFace.Both:
				WebGLRenderingState.disable(GL_CULL_FACE);
				break;
			case RenderFace.None:
				WebGLRenderingState.enable(GL_CULL_FACE);
				WebGLRenderingState.cullFace(GL_FRONT_AND_BACK);
				break;

			default:
				break;
		}

		WebGLRenderingState.polygonOffset(material.polygonOffset, material.polygonOffsetFactor, material.polygonOffsetUnits);

		for (const uniform in material.uniforms) {
			program.setUniformValue(uniform, material.uniforms[uniform]);
		}
	}

	render(scene: Scene, camera: Camera, delta: number, context: InternalRenderContext) {
		const renderList = new RenderList();//TODO: optimize
		camera.dirty();//Force matrices to recompute
		this._prepareRenderList(renderList, scene, camera, delta, context);

		this.#shadowMap.render(this, renderList, camera, context);
		if (scene.background) {
			scene.background.render(this, camera);
		}

		this._renderRenderList(renderList, camera, true, context);
		WebGLRenderingState.depthMask(true);//TODOv3 check why we have to do this
		++this.#frame;
	}

	set scissorTest(scissorTest: boolean) {
		if (scissorTest) {
			WebGLRenderingState.enable(GL_SCISSOR_TEST);
		} else {
			WebGLRenderingState.disable(GL_SCISSOR_TEST);
		}
	}
}
