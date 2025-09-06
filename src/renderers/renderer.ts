import { mat3, mat4, vec3, vec4 } from 'gl-matrix';
import { DEBUG, ENABLE_GET_ERROR, USE_STATS } from '../buildoptions';
import { Camera, CameraProjection } from '../cameras/camera';
import { EngineEntityAttributes, Entity } from '../entities/entity';
import { BufferGeometry } from '../geometry/buffergeometry';
import { InstancedBufferGeometry } from '../geometry/instancedbuffergeometry';
import { Graphics, RenderContext } from '../graphics/graphics';
import { Material } from '../materials/material';
import { Mesh } from '../objects/mesh';
import { Scene } from '../scenes/scene';
import { ToneMapping } from '../textures/constants';
import { WebGLAnyRenderingContext } from '../types';
import { WebGLStats } from '../utils/webglstats';
import { GL_ARRAY_BUFFER, GL_ELEMENT_ARRAY_BUFFER, GL_LINES, GL_UNSIGNED_INT } from '../webgl/constants';
import { Program } from '../webgl/program';
import { WebGLRenderingState } from '../webgl/renderingstate';
import { RenderList } from './renderlist';

const tempViewProjectionMatrix = mat4.create();
const lightDirection = vec3.create();

function getDefinesAsString(meshOrMaterial: Material | Mesh) {
	const defines = [];
	for (const [name, value] of Object.entries(meshOrMaterial.defines)) {
		if (value === false) {
			defines.push('#undef ' + name);
		} else {
			defines.push('#define ' + name + ' ' + value);
		}
	}
	return defines.join('\n') + '\n';
}

export class Renderer {
	#toneMapping = ToneMapping.None;
	#toneMappingExposure = 1.;
	#glContext: WebGLAnyRenderingContext;
	#materialsProgram = new Map<string, Program>();
	#globalIncludeCode = '';

	constructor() {
		this.#glContext = Graphics.glContext;
	}

	getProgram(mesh: Mesh, material: Material) {

		let includeCode = Graphics.getIncludeCode();
		includeCode += this.#globalIncludeCode;
		includeCode += getDefinesAsString(mesh);
		includeCode += getDefinesAsString(material);
		includeCode += material.getShaderSource();

		let program: Program | undefined = this.#materialsProgram.get(includeCode);
		if (!program) {
			const shaderSource = material.getShaderSource();

			program = new Program(this.#glContext, shaderSource + '.vs', shaderSource + '.fs');
			this.#materialsProgram.set(includeCode, program);
		}

		if (!program.isValid()) {
			let includeCode = Graphics.getIncludeCode();
			includeCode += this.#globalIncludeCode;
			includeCode += getDefinesAsString(mesh);
			includeCode += getDefinesAsString(material);
			program.validate(includeCode);
			material._dirtyProgram = false;
		}
		return program;
	}

	#setupVertexAttributes(program: Program, geometry: BufferGeometry, wireframe: number) {
		WebGLRenderingState.initUsedAttributes();
		const geometryAttributes = geometry.attributes;
		const programAttributes = program.attributes;
		for (const [attributeName, attribute] of geometryAttributes) {
			const attributeLocation = programAttributes.get(attributeName);
			if (attributeName == 'index') {
				if (wireframe == 1) {
					attribute.updateWireframe(this.#glContext);//TODO: put somewhere else
				} else {
					attribute.update(this.#glContext);//TODO: put somewhere else
				}
				this.#glContext.bindBuffer(GL_ELEMENT_ARRAY_BUFFER, attribute._buffer);
			} else if (attributeLocation !== undefined) {
				attribute.update(this.#glContext);//TODO: put somewhere else
				WebGLRenderingState.enableVertexAttribArray(attributeLocation, attribute.divisor);
				this.#glContext.bindBuffer(GL_ARRAY_BUFFER, attribute._buffer);
				this.#glContext.vertexAttribPointer(attributeLocation, attribute.itemSize, attribute.type, false, 0, 0);
			}
		}
		WebGLRenderingState.disableUnusedAttributes();
	}

	#setupVertexUniforms(program: Program, mesh: Mesh) {
		for (const uniform in mesh.uniforms) {
			program.setUniformValue(uniform, mesh.uniforms[uniform]);
		}
	}

	applyMaterial(program: Program, material: Material) {
	}

	setupLights(renderList: RenderList, camera: Camera, program: Program, viewMatrix: mat4) {
		const lightPositionCameraSpace = vec3.create();//TODO: do not create a vec3
		const lightPositionWorldSpace = vec3.create();//TODO: do not create a vec3
		const colorIntensity = vec3.create();//TODO: do not create a vec3
		const pointLights = renderList.pointLights;//scene.getChildList(PointLight);
		const spotLights = renderList.spotLights;

		let shadow;
		let pointLightId = 0;
		const pointShadowMap = [];
		const pointShadowMatrix = [];
		for (const pointLight of pointLights) {
			if (pointLight.isVisible()) {
				pointLight.getWorldPosition(lightPositionWorldSpace);;
				vec3.transformMat4(lightPositionCameraSpace, lightPositionWorldSpace, viewMatrix);
				program.setUniformValue('uPointLights[' + pointLightId + '].position', lightPositionCameraSpace);
				program.setUniformValue('uPointLights[' + pointLightId + '].color', vec3.scale(colorIntensity, pointLight.color, pointLight.intensity));
				program.setUniformValue('uPointLights[' + pointLightId + '].range', pointLight.range);
				//program.setUniformValue('uPointLightsuPointLights[' + pointLightId + '].direction', pointLight.getDirection(tempVec3));
				//program.setUniformValue('uPointLights[' + pointLightId + '].direction', [0, 0, -1]);
				program.setUniformValue('uPbrLights[' + pointLightId + '].position', lightPositionWorldSpace);
				program.setUniformValue('uPbrLights[' + pointLightId + '].radiance', vec3.scale(colorIntensity, pointLight.color, pointLight.intensity));

				if (pointLight.castShadow) {
					shadow = pointLight.shadow;
					pointShadowMap.push(shadow.renderTarget.getTexture());
					pointShadowMatrix.push(shadow.shadowMatrix);
					program.setUniformValue('uPointLightShadows[' + pointLightId + '].mapSize', shadow.textureSize);
					program.setUniformValue('uPointLightShadows[' + pointLightId + '].near', shadow.camera.nearPlane);
					program.setUniformValue('uPointLightShadows[' + pointLightId + '].far', shadow.camera.farPlane);
					program.setUniformValue('uPointLightShadows[' + pointLightId + '].enabled', true);
				}
				++pointLightId;
			}
		}
		program.setUniformValue('uPointShadowMap[0]', pointShadowMap);
		program.setUniformValue('uPointShadowMatrix[0]', pointShadowMatrix);


		let spotLightId = 0;
		const spotShadowMap = [];
		const spotShadowMatrix = [];
		for (const spotLight of spotLights) {
			if (spotLight.visible) {
				spotLight.getWorldPosition(lightPositionCameraSpace);
				vec3.transformMat4(lightPositionCameraSpace, lightPositionCameraSpace, viewMatrix);
				program.setUniformValue('uSpotLights[' + spotLightId + '].position', lightPositionCameraSpace);
				program.setUniformValue('uSpotLights[' + spotLightId + '].color', vec3.scale(colorIntensity, spotLight.color, spotLight.intensity));
				program.setUniformValue('uSpotLights[' + spotLightId + '].range', spotLight.range);
				program.setUniformValue('uSpotLights[' + spotLightId + '].innerAngleCos', spotLight.innerAngleCos);
				program.setUniformValue('uSpotLights[' + spotLightId + '].outerAngleCos', spotLight.outerAngleCos);
				//program.setUniformValue('uSpotLights[' + spotLightId + '].direction', spotLight.getDirection(tempVec3));
				//program.setUniformValue('uSpotLights[' + spotLightId + '].direction', [0, 0, -1]);

				spotLight.getDirection(lightDirection);
				const m = viewMatrix;
				const x = lightDirection[0];
				const y = lightDirection[1];
				const z = lightDirection[2];
				lightDirection[0] = m[0] * x + m[4] * y + m[8] * z;
				lightDirection[1] = m[1] * x + m[5] * y + m[9] * z;
				lightDirection[2] = m[2] * x + m[6] * y + m[10] * z;
				program.setUniformValue('uSpotLights[' + spotLightId + '].direction', lightDirection);

				if (spotLight.castShadow) {
					shadow = spotLight.shadow;
					spotShadowMap.push(shadow.renderTarget.getTexture());
					spotShadowMatrix.push(shadow.shadowMatrix);
					program.setUniformValue('uSpotLightShadows[' + spotLightId + '].mapSize', shadow.textureSize);
					program.setUniformValue('uSpotLightShadows[' + spotLightId + '].enabled', true);
				}
				++spotLightId;
			}
		}
		program.setUniformValue('uSpotShadowMap[0]', spotShadowMap);
		program.setUniformValue('uSpotShadowMatrix[0]', spotShadowMatrix);

		const ambientLights = renderList.ambientLights;//scene.getChildList(AmbientLight);
		const ambientAccumulator = vec3.create();//TODO: do not create a vec3
		for (const ambientLight of ambientLights) {
			if (ambientLight.isVisible()) {
				vec3.scaleAndAdd(ambientAccumulator, ambientAccumulator, ambientLight.color, ambientLight.intensity);
			}
		}
		program.setUniformValue('uAmbientLight', ambientAccumulator);
	}

	#setLights(pointLights: number, spotLights: number, pointLightShadows: number, spotLightShadows: number) {
		Graphics.setIncludeCode('USE_SHADOW_MAPPING', '#define USE_SHADOW_MAPPING');
		Graphics.setIncludeCode('NUM_POINT_LIGHTS', '#define NUM_POINT_LIGHTS ' + pointLights);
		Graphics.setIncludeCode('NUM_PBR_LIGHTS', '#define NUM_PBR_LIGHTS ' + pointLights);
		Graphics.setIncludeCode('NUM_SPOT_LIGHTS', '#define NUM_SPOT_LIGHTS ' + spotLights);
		Graphics.setIncludeCode('NUM_POINT_LIGHT_SHADOWS', '#define NUM_POINT_LIGHT_SHADOWS ' + pointLightShadows);
		Graphics.setIncludeCode('NUM_SPOT_LIGHT_SHADOWS', '#define NUM_SPOT_LIGHT_SHADOWS ' + spotLightShadows);
		//TODO: other lights of disable lighting all together
	}

	#unsetLights() {
		Graphics.setIncludeCode('USE_SHADOW_MAPPING', '#undef USE_SHADOW_MAPPING');
		Graphics.setIncludeCode('NUM_POINT_LIGHTS', '#define NUM_POINT_LIGHTS 0');
		Graphics.setIncludeCode('NUM_SPOT_LIGHTS', '#define NUM_SPOT_LIGHTS 0');
		Graphics.setIncludeCode('NUM_POINT_LIGHT_SHADOWS', '#define NUM_POINT_LIGHTS 0');
		Graphics.setIncludeCode('NUM_SPOT_LIGHT_SHADOWS', '#define NUM_SPOT_LIGHTS 0');
		//TODO: other lights of disable lighting all together
	}

	renderObject(context: RenderContext, renderList: RenderList, object: Mesh, camera: Camera, geometry: BufferGeometry | InstancedBufferGeometry, material: Material, renderLights = true, lightPos?: vec3) {
		if (!object.isRenderable) {
			return;
		}
		if (object.isVisible() === false) {
			return;
		}
		if (geometry.count === 0) {
			return;
		}
		if (!renderLights) {
			if (!object.castShadow) {
				return;
			}
		}

		renderLights &&= material.renderLights;

		material.updateMaterial(Graphics.getTime(), object);//TODO: frame delta

		const cameraMatrix = camera.cameraMatrix;
		const projectionMatrix = camera.projectionMatrix;
		mat4.mul(object._mvMatrix, cameraMatrix, object.worldMatrix);
		//object.normalMatrix.getNormalMatrix(object.modelViewMatrix);
		mat3.normalFromMat4(object._normalMatrix, cameraMatrix);//TODO: fixme

		//let viewProjectionMatrix = mat4.create();//TODOv3 don't recreate the matrix
		mat4.mul(tempViewProjectionMatrix, projectionMatrix, cameraMatrix);//TODO: compute this in camera

		if (renderLights) {
			this.#setLights(renderList.pointLights.length, renderList.spotLights.length, renderList.pointLightShadows, renderList.spotLightShadows);
			if (!object.receiveShadow) {
				Graphics.setIncludeCode('USE_SHADOW_MAPPING', '#undef USE_SHADOW_MAPPING');
			}
		} else {
			this.#unsetLights();
		}

		if (camera.projection == CameraProjection.Perspective) {
			Graphics.setIncludeCode('CAMERA_PROJECTION_TYPE', '#define IS_PERSPECTIVE_CAMERA');
		} else {
			Graphics.setIncludeCode('CAMERA_PROJECTION_TYPE', '#define IS_ORTHOGRAPHIC_CAMERA');
		}

		const program = this.getProgram(object, material);
		if (program.isValid()) {
			WebGLRenderingState.useProgram(program.getProgram());
			if (renderLights) {
				material.beforeRender(camera);
			}
			this.applyMaterial(program, material);

			program.setUniformValue('uModelMatrix', object.worldMatrix);
			program.setUniformValue('uModelViewMatrix', object._mvMatrix);
			program.setUniformValue('uViewMatrix', cameraMatrix);
			program.setUniformValue('uProjectionMatrix', projectionMatrix);
			program.setUniformValue('uProjectionLogDepth', 2.0 / (Math.log(camera.farPlane + 1.0) / Math.LN2));//TODO: perf: compute that once we set camera farplane
			program.setUniformValue('uViewProjectionMatrix', tempViewProjectionMatrix);
			program.setUniformValue('uNormalMatrix', object._normalMatrix);
			program.setUniformValue('uCameraPosition', camera.position);
			const pickingColor = object.pickingColor;
			if (pickingColor) {
				program.setUniformValue('uPickingColor', pickingColor);
			}


			//TODO: set this on resolution change
			program.setUniformValue('uResolution', [Graphics.getWidth(), Graphics.getHeight(), camera.aspectRatio, 0]);
			//TODO: set this at start of the frame
			program.setUniformValue('uTime', [Graphics.getTime(), Graphics.currentTick, 0, 0]);

			if (renderLights) {
				this.setupLights(renderList, camera, program, cameraMatrix);
			} else {
				program.setUniformValue('uLightPosition', lightPos);
				program.setUniformValue('uLightNear', camera.nearPlane);
				program.setUniformValue('uLightFar', camera.farPlane);
			}

			const wireframe = object.wireframe;
			this.#setupVertexAttributes(program, geometry, wireframe);
			this.#setupVertexUniforms(program, object);
			if (ENABLE_GET_ERROR && DEBUG) {
				this.#glContext.getError();//empty the error
			}

			if ((geometry as InstancedBufferGeometry).instanceCount === undefined) {
				if (wireframe == 1) {
					//TODO: case where original geometry is GL_LINES
					this.#glContext.drawElements(GL_LINES, geometry.count * 2, GL_UNSIGNED_INT, 0);
				} else {
					this.#glContext.drawElements(object.renderMode, geometry.count, geometry.elementArrayType, 0);
				}
			} else {
				if (Graphics.isWebGL2) {
					(this.#glContext as WebGL2RenderingContext).drawElementsInstanced(object.renderMode, geometry.count, geometry.elementArrayType, 0, (geometry as InstancedBufferGeometry).instanceCount);
				} else {
					Graphics.ANGLE_instanced_arrays?.drawElementsInstancedANGLE(object.renderMode, geometry.count, geometry.elementArrayType, 0, (geometry as InstancedBufferGeometry).instanceCount);
				}
			}

			if (ENABLE_GET_ERROR && DEBUG) {
				const glError = this.#glContext.getError();
				if (glError) {
					console.error('GL Error in drawElements : ', glError);
				}
			}
			if (USE_STATS) {
				WebGLStats.drawElements(object.renderMode, geometry.count);
			}
		}
	}

	_prepareRenderList(renderList: RenderList, scene: Scene, camera: Camera, delta: number, context: RenderContext) {
		renderList.reset();
		let currentObject: Entity | undefined = scene;
		const objectStack = [];
		//scene.pointLights = scene.getChildList(PointLight);
		//scene.ambientLights = scene.getChildList(AmbientLight);

		while (currentObject) {
			if (currentObject.getAttribute(EngineEntityAttributes.IsTool, false) && context.DisableToolRendering) {
				currentObject = objectStack.shift();
				continue;
			}

			//objectStack.push(currentObject);
			for (const child of currentObject.children) {
				if (true || child.constructor.name !== 'Skeleton') {
					objectStack.push(child);
				}
			}
			if (currentObject.isRenderable) {
				renderList.addObject(currentObject);
			} else {
				currentObject.update(scene, camera, delta);
			}
			currentObject = objectStack.shift();
		}
		renderList.finish();
	}

	_renderRenderList(renderList: RenderList, camera: Camera, renderLights: boolean, context: RenderContext, lightPos?: vec3) {
		for (const child of renderList.opaqueList) {
			this.renderObject(context, renderList, child, camera, child.geometry, child.material, renderLights, lightPos);
		}

		if (renderLights) {
			for (const child of renderList.transparentList) {
				this.renderObject(context, renderList, child, camera, child.geometry, child.material, renderLights, lightPos);
			}
		}
	}

	render(scene: Scene, camera: Camera, delta: number, context: RenderContext) {
	}

	clear(color: boolean, depth: boolean, stencil: boolean) {
		WebGLRenderingState.clear(color, depth, stencil);
	}
	/*
		get vpMatrix() {
			return mat4.mul(mat4.create(), this.currentCamera.projectionMatrix, this.viewMatrix);
		}
			*/

	/**
	 * Invalidate all shader (force recompile)
	 */
	invalidateShaders() {
		for (const shader of this.#materialsProgram.values()) {
			shader.invalidate();
		}
	}

	clearColor(clearColor: vec4) {
		WebGLRenderingState.clearColor(clearColor);
	}

	clearDepth(clearDepth: GLclampf) {
		WebGLRenderingState.clearDepth(clearDepth);
	}

	clearStencil(clearStencil: GLint) {
		WebGLRenderingState.clearStencil(clearStencil);
	}

	setToneMapping(toneMapping: ToneMapping) {
		this.#toneMapping = toneMapping;
		Graphics.setIncludeCode('TONE_MAPPING', `#define TONE_MAPPING ${toneMapping}`);
	}

	getToneMapping() {
		return this.#toneMapping;
	}

	setToneMappingExposure(exposure: number) {
		this.#toneMappingExposure = exposure;
		Graphics.setIncludeCode('TONE_MAPPING_EXPOSURE', `#define TONE_MAPPING_EXPOSURE ${exposure.toFixed(2)}`);
	}

	getToneMappingExposure() {
		return this.#toneMappingExposure;
	}
}
