import { vec3 } from 'gl-matrix';

import { Graphics } from '../../../../../graphics/graphics';
import { Mesh } from '../../../../../objects/mesh';
import { BufferGeometry } from '../../../../../geometry/buffergeometry';
import { TextureManager } from '../../../../../textures/texturemanager';
import { Float32BufferAttribute, Uint32BufferAttribute } from '../../../../../geometry/bufferattribute';
import { Source1ParticleControler } from '../../source1particlecontroler';
import { SourceEngineParticleOperators } from '../../sourceengineparticleoperators';
import { SourceEngineParticleOperator } from '../operator';
import { PARAM_TYPE_FLOAT } from '../../constants';
import { GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_TEXTURE_MIN_FILTER, GL_NEAREST, GL_FLOAT, GL_RGBA, GL_RGBA32F, } from '../../../../../webgl/constants';
import { DEG_TO_RAD } from '../../../../../math/constants';
import { clamp, ceilPowerOfTwo } from '../../../../../math/functions';
import { TESTING } from '../../../../../buildoptions';
import { TEXTURE_WIDTH } from '../../../../common/particles/constants';
import { SEQUENCE_SAMPLE_COUNT } from '../../../loaders/sheet';
import { Texture } from '../../../../../textures/texture';

export class RenderSpriteTrail extends SourceEngineParticleOperator {
	static functionName = 'render_sprite_trail';
	texture: Texture;
	geometry: BufferGeometry;
	imgData;
	constructor() {
		super();
		this.addParam('animation rate', PARAM_TYPE_FLOAT, 0.1);
		this.addParam('length fade in time', PARAM_TYPE_FLOAT, 0.0);
		this.addParam('max length', PARAM_TYPE_FLOAT, 2000.0);
		this.addParam('min length', PARAM_TYPE_FLOAT, 0.0);
		//	DMXELEMENT_UNPACK_FIELD('animation rate', '.1', float, m_flAnimationRate)
		//	DMXELEMENT_UNPACK_FIELD('length fade in time', '0', float, m_flLengthFadeInTime)
		//	DMXELEMENT_UNPACK_FIELD('max length', '2000', float, m_flMaxLength)
		//	DMXELEMENT_UNPACK_FIELD('min length', '0', float, m_flMinLength)
	}

	/*
	doRender(particleList, elapsedTime, material) {
		for (let i = 0; i < particleList.length; ++i) {
			this.renderSpriteTrail(particleList[i], elapsedTime, material);
		}
	}*/
	updateParticles(particleSystem, particleList, elapsedTime) {//TODOv3
		const rate = this.getParameter('animation rate') ?? 30;
		this.geometry.count = particleList.length * 6;
		const maxParticles = new Graphics().isWebGL2 ? particleSystem.maxParticles : ceilPowerOfTwo(particleSystem.maxParticles);
		this.#setupParticlesTexture(particleList, maxParticles, elapsedTime);
		this.mesh.setUniform('uMaxParticles', maxParticles);//TODOv3:optimize
		this.mesh.setVisible(Source1ParticleControler.visible);

		let index = 0;
		for (const particle of particleList) {
			let coords = this.particleSystem.material.getTexCoords(0, particle.currentTime, rate * SEQUENCE_SAMPLE_COUNT, particle.sequence);
			if (coords) {
				const uvs = this.geometry.attributes.get('aTextureCoord')._array;
				coords = coords.m_TextureCoordData[0];
				const uMin = coords.m_fLeft_U0;
				const vMin = coords.m_fTop_V0;
				const uMax = coords.m_fRight_U0;
				const vMax = coords.m_fBottom_V0;
				uvs[index++] = uMin;
				uvs[index++] = vMin;
				uvs[index++] = uMax;
				uvs[index++] = vMin;
				uvs[index++] = uMin;
				uvs[index++] = vMax;
				uvs[index++] = uMax;
				uvs[index++] = vMax;
			} else {
				index += 8;
			}
		}
		this.geometry.attributes.get('aTextureCoord').dirty = true;

		//this.geometry.attributes.get('aTextureCoord').dirty = true;
		if (TESTING) {
			//this.geometry.count = 6;
		}
	}

	initRenderer(particleSystem) {
		const maxParticles = new Graphics().isWebGL2 ? particleSystem.maxParticles : ceilPowerOfTwo(particleSystem.maxParticles);
		this.createParticlesArray(maxParticles);
		this.#createParticlesTexture();
		const vertices = [];
		const uvs = [];
		const indices = [];
		const id = [];

		for (let i = 0; i < maxParticles; i++) {
			const indiceBase = i * 4;
			indices.push(indiceBase, indiceBase + 2, indiceBase + 1, indiceBase + 2, indiceBase + 3, indiceBase + 1);
			vertices.push(-1.0, 1.0, 0.0, 1.0, 1.0, 0.0, -1.0, -1.0, 0.0, 1.0, -1.0, 0.0);
			uvs.push(0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0);
			id.push(i, i, i, i);
		}

		const vertexPosition = new Float32BufferAttribute(vertices, 3);
		const textureCoord = new Float32BufferAttribute(uvs, 2);
		const particleId = new Float32BufferAttribute(id, 1);
		const geometry = new BufferGeometry();
		geometry.setIndex(new Uint32BufferAttribute(indices, 1));
		geometry.setAttribute('aVertexPosition', vertexPosition);
		geometry.setAttribute('aTextureCoord', textureCoord);
		geometry.setAttribute('aParticleId', particleId);

		geometry.count = indices.length;

		this.mesh = new Mesh(geometry, particleSystem.material);
		this.mesh.serializable = false;
		this.mesh.hideInExplorer = true;
		this.mesh.setDefine('HARDWARE_PARTICLES');
		this.mesh.setUniform('uParticles', this.texture);
		this.mesh.setUniform('uMaxParticles', maxParticles);//TODOv3:optimize
		particleSystem.addChild(this.mesh);
		this.geometry = geometry;
		particleSystem.material.setDefine('RENDER_SPRITE_TRAIL');
		//particleSystem.material.setDefine('PARTICLE_ORIENTATION_SCREEN_ALIGNED');
		this.setOrientationType(0);
	}

	createParticlesArray(maxParticles) {
		this.imgData = new Float32Array(maxParticles * 4 * TEXTURE_WIDTH);
	}

	#createParticlesTexture() {
		this.texture = TextureManager.createTexture();
		this.texture.addUser(this);
		const gl = new Graphics().glContext;//TODO
		gl.bindTexture(GL_TEXTURE_2D, this.texture.texture);
		gl.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
		gl.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
		gl.bindTexture(GL_TEXTURE_2D, null);
	}

	updateParticlesTexture(maxParticles, pixels) {//removeme
		const gl = new Graphics().glContext;

		gl.bindTexture(GL_TEXTURE_2D, this.texture.texture);
		if (new Graphics().isWebGL2) {
			gl.texImage2D(GL_TEXTURE_2D, 0, GL_RGBA32F, TEXTURE_WIDTH, maxParticles, 0, GL_RGBA, GL_FLOAT, pixels);
		} else {
			gl.texImage2D(GL_TEXTURE_2D, 0, GL_RGBA, TEXTURE_WIDTH, maxParticles, 0, GL_RGBA, GL_FLOAT, pixels);
		}
		gl.bindTexture(GL_TEXTURE_2D, null);
	}

	#setupParticlesTexture(particleList, maxParticles, elapsedTime) {
		const m_flMaxLength = this.getParameter('max length');
		const m_flMinLength = this.getParameter('min length');
		const m_flLengthFadeInTime = this.getParameter('length fade in time');
		const rate = this.getParameter('animation rate') ?? 30;
		const fit = this.getParameter('animation_fit_lifetime') ?? 0;
		/*
				if (fit) {
					rate = material.sequenceLength / particle.timeToLive;
				}
					*/


		const a = new Float32Array(maxParticles * 4 * TEXTURE_WIDTH);
		let index = 0;

		const len = 0;
		for (const particle of particleList) {
			const flAge = particle.currentTime;
			const flLengthScale = (flAge >= m_flLengthFadeInTime) ? 1.0 : (flAge / m_flLengthFadeInTime);
			const vecDelta = vec3.subtract(vec3.create(), particle.prevPosition, particle.position);//TODOv3: optimize
			const flMag = vec3.length(vecDelta);
			vec3.normalize(vecDelta, vecDelta);
			const flOODt = (elapsedTime != 0.0) ? (1.0 / elapsedTime) : 1.0;
			let flLength = flLengthScale * flMag * flOODt * particle.trailLength;
			if (flLength <= 0.0) {
				return;
			}

			flLength = clamp(flLength, m_flMinLength, m_flMaxLength);
			//vec3.scale(vecDelta, vecDelta, flLength * 0.5);TODOv3

			//const vTangentY = vec3.cross(vec3.create(), vDirToBeam, vecDelta);
			let rad = particle.radius;
			if (flLength < rad) {
				rad = flLength;
			}

			a[index++] = particle.position[0];
			a[index++] = particle.position[1];
			a[index++] = particle.position[2];
			index++;
			a[index++] = particle.color.r;
			a[index++] = particle.color.g;
			a[index++] = particle.color.b;
			a[index++] = particle.alpha;
			a[index++] = rad;
			index++;
			a[index++] = particle.rotationRoll;
			a[index++] = particle.rotationYaw * DEG_TO_RAD;
			a[index++] = vecDelta[0];
			a[index++] = vecDelta[1];
			a[index++] = vecDelta[2];
			a[index++] = flLength;
			index += 16;
		}

		this.updateParticlesTexture(maxParticles, a);
	}

	setupParticlesTexture1(particleList, maxParticles, elapsedTime) {
		const m_flMaxLength = this.getParameter('max length');
		const m_flMinLength = this.getParameter('min length');
		const m_flLengthFadeInTime = this.getParameter('length fade in time');
		const rate = this.getParameter('animation rate') || 30;
		const fit = this.getParameter('animation_fit_lifetime') || 0;
		/*
				if (fit) {
					rate = material.sequenceLength / particle.timeToLive;
				}
		*/

		const a = new Float32Array(maxParticles * 4 * TEXTURE_WIDTH);
		let index = 0;

		for (const particle of particleList) {
			const flAge = particle.currentTime;
			const flLengthScale = (flAge >= m_flLengthFadeInTime) ? 1.0 : (flAge / m_flLengthFadeInTime);
			const vecDelta = vec3.subtract(vec3.create(), particle.prevPosition, particle.position);//TODOv3: optimize
			const flMag = vec3.length(vecDelta);
			vec3.normalize(vecDelta, vecDelta);
			const flOODt = (elapsedTime != 0.0) ? (1.0 / elapsedTime) : 1.0;
			let flLength = flLengthScale * flMag * flOODt * particle.trailLength;
			if (flLength <= 0.0) {
				return;
			}

			flLength = clamp(flLength, m_flMinLength, m_flMaxLength);
			//vec3.scale(vecDelta, vecDelta, flLength * 0.5);TODOv3

			//const vTangentY = vec3.cross(vec3.create(), vDirToBeam, vecDelta);
			let rad = particle.radius;
			if (flLength < rad) {
				rad = flLength;
			}

			a[index++] = particle.position[0];
			a[index++] = particle.position[1];
			a[index++] = particle.position[2];
			index++;
			a[index++] = particle.color.r;
			a[index++] = particle.color.g;
			a[index++] = particle.color.b;
			a[index++] = particle.alpha;
			a[index++] = rad;
			index++;
			a[index++] = particle.rotationRoll;
			a[index++] = particle.rotationYaw * DEG_TO_RAD;
			a[index++] = vecDelta[0];
			a[index++] = vecDelta[1];
			a[index++] = vecDelta[2];
			a[index++] = flLength;
			index += 16;
		}

		this.updateParticlesTexture(maxParticles, a);
	}

	dispose() {
		this.mesh?.dispose();
		this.texture.removeUser(this);
	}
}
SourceEngineParticleOperators.registerOperator(RenderSpriteTrail);
