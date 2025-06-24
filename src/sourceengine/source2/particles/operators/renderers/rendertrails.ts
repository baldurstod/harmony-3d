import { vec2, vec3 } from 'gl-matrix';

import { OPERATOR_PARAM_TEXTURE } from '../operatorparams';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Operator } from '../operator';
import { DEFAULT_PARTICLE_TEXTURE } from '../../particleconstants';
import { Source2ParticleManager } from '../../source2particlemanager';
import { Source2MaterialManager } from '../../../materials/source2materialmanager';
import { Source2TextureManager } from '../../../textures/source2texturemanager';
import { Source2SpriteCard } from '../../../materials/source2spritecard';
import { PARTICLE_ORIENTATION_SCREEN_ALIGNED } from '../../../../common/particles/particleconsts';
import { LOG, TESTING } from '../../../../../buildoptions';
import { Float32BufferAttribute, Uint32BufferAttribute } from '../../../../../geometry/bufferattribute';
import { BufferGeometry } from '../../../../../geometry/buffergeometry';
import { Graphics } from '../../../../../graphics/graphics';
import { Mesh } from '../../../../../objects/mesh';
import { TextureManager } from '../../../../../textures/texturemanager';
import { clamp, ceilPowerOfTwo } from '../../../../../math/functions';
import { GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_TEXTURE_MIN_FILTER, GL_NEAREST, GL_FLOAT, GL_RGBA, GL_RGBA32F } from '../../../../../webgl/constants';
import { TEXTURE_WIDTH } from '../../../../common/particles/constants';
import { SEQUENCE_COMBINE_MODE_ALPHA_FROM0_RGB_FROM_1 } from './constants';
import { Source2SpriteSheet } from '../../../textures/source2spritesheet';
import { Texture } from '../../../../../textures/texture';
import { Source2ParticleSystem } from '../../export';
import { Source2Particle } from '../../source2particle';

const SEQUENCE_COMBINE_MODE_USE_SEQUENCE_0 = 'SEQUENCE_COMBINE_MODE_USE_SEQUENCE_0';

const SEQUENCE_SAMPLE_COUNT = 1;//TODO

const tempVec2 = vec2.create();

export class RenderTrails extends Operator {
	geometry: BufferGeometry;
	setDefaultTexture? = true;//TODO: remove this property
	minLength = 0;
	maxLength = 2000;
	lengthFadeInTime = 0;
	ignoreDT = false;
	lengthScale = 1;
	spriteSheet?: Source2SpriteSheet;
	#maxParticles = 1000;//TODO: default value
	texture?: Texture;//TODO: set private ?
	imgData?: Float32Array;//TODO: set private ?

	constructor(system: Source2ParticleSystem) {
		super(system);
		this.material = new Source2SpriteCard(system.repository);
		this.geometry = new BufferGeometry();
		this.mesh = new Mesh(this.geometry, this.material);
		this.material.setDefine('RENDER_SPRITE_TRAIL');
		this.setOrientationType(PARTICLE_ORIENTATION_SCREEN_ALIGNED);
		Source2MaterialManager.addMaterial(this.material);
		//this.setParam(OPERATOR_PARAM_TEXTURE, 'materials/particle/base_sprite');//TODOv3: make a const
		//this.setParam(OPERATOR_PARAM_MOD_2X, false);
		//this.setParam(OPERATOR_PARAM_ORIENTATION_TYPE, ORIENTATION_TYPE_SCREEN_ALIGN);
		//this.setParam(OPERATOR_PARAM_SEQUENCE_COMBINE_MODE, SEQUENCE_COMBINE_MODE_USE_SEQUENCE_0);//TODOv3: get the actual default value
	}

	_paramChanged(paramName: string, value: any) {
		switch (paramName) {
			case 'm_vecTexturesInput':
				if (TESTING && LOG) {
					console.debug(value);
				}
				this.setTexture(value[0].m_hTexture ?? DEFAULT_PARTICLE_TEXTURE);//TODO: check multiple textures ?
				break;
			case OPERATOR_PARAM_TEXTURE:
				this.setTexture(value);
				break;
			/*case 'm_nSequenceCombineMode':
				this.setSequenceCombineMode(value);
				break;*/
			case 'm_flMinLength':
				this.minLength = value;
				break;
			case 'm_flMaxLength':
				this.maxLength = value;
				break;
			case 'm_flLengthFadeInTime':
				this.lengthFadeInTime = value;
				break;
			case 'm_bIgnoreDT':
				this.ignoreDT = value;
				break;
			case 'm_flRadiusScale':
			case 'm_flFinalTextureScaleU':
			case 'm_flFinalTextureScaleV':
				break;
			case 'm_flLengthScale':
				this.lengthScale = value;
				break;
			default:
				super._paramChanged(paramName, value);
		}
	}

	setSequenceCombineMode(sequenceCombineMode: string) {
		this.material!.removeDefine('USE_TEXTURE_COORD_2');
		switch (sequenceCombineMode) {
			case 'SEQUENCE_COMBINE_MODE_ALPHA_FROM0_RGB_FROM_1':
				this.material!.setDefine('SEQUENCE_COMBINE_MODE', String(SEQUENCE_COMBINE_MODE_ALPHA_FROM0_RGB_FROM_1));
				this.material!.setDefine('USE_TEXTURE_COORD_2');
				break;
			default:
				console.error('Unknonw sequenceCombineMode ', sequenceCombineMode);
		}
	}

	async setTexture(texturePath: string) {
		delete this.setDefaultTexture;
		this.material!.setTexturePath(texturePath);
		this.spriteSheet = await Source2TextureManager.getTextureSheet(this.system.repository, texturePath);
	}

	updateParticles(particleSystem: Source2ParticleSystem, particleList: Source2Particle[], elapsedTime: number) {
		const m_bFitCycleToLifetime = this.getParameter('animation_fit_lifetime');
		const rate = this.getParameter('animation rate');
		const useAnimRate = this.getParameter('use animation rate as FPS');
		const geometry = this.geometry;
		geometry.count = particleList.length * 6;
		const maxParticles = this.#maxParticles;
		this.#setupParticlesTexture(particleList, maxParticles, elapsedTime);
		this.mesh!.setUniform('uMaxParticles', maxParticles);//TODOv3:optimize
		this.mesh!.setVisible(Source2ParticleManager.visible);

		vec2.set(tempVec2, this.getParamScalarValue('m_flFinalTextureScaleU') ?? 1, this.getParamScalarValue('m_flFinalTextureScaleV') ?? 1);
		this.material!.setUniform('uFinalTextureScale', tempVec2);

		const uvs = geometry.attributes.get('aTextureCoord')!._array;
		const uvs2 = geometry.attributes.get('aTextureCoord2')!._array;
		let index = 0;
		let index2 = 0;
		for (let i = 0; i < particleList.length; i++) {
			const particle = particleList[i];
			const sequence = particle.sequence;
			let flAgeScale;
			if (m_bFitCycleToLifetime) {
				const flLifetime = particle.timeToLive;//SubFloat(pLifeDuration[ nGroup * ld_stride ], nOffset);
				flAgeScale = (flLifetime > 0.0) ? (1.0 / flLifetime) * SEQUENCE_SAMPLE_COUNT : 0.0;
			} else {
				flAgeScale = rate * SEQUENCE_SAMPLE_COUNT;
				if (useAnimRate) {
					particle.frame += elapsedTime * rate;
					const frameSpan = this.material!.getFrameSpan(sequence);
					if (frameSpan !== null) {
						flAgeScale = flAgeScale / frameSpan;
					}
				}
			}

			particle.frame += elapsedTime;

			const spriteSheet = this.spriteSheet;
			if (false && spriteSheet) {
				/*
				let coords = spriteSheet.getFrame(particle.sequence, particle.frame * 10.0)?.coords;//sequences[particle.sequence].frames[particle.frame].coords;
				//coords = coords.m_TextureCoordData[0];
				if (coords) {
					let uMin = coords[0];
					let vMin = coords[1];
					let uMax = coords[2];
					let vMax = coords[3];
					uvs[index++] = uMin;
					uvs[index++] = vMin;
					uvs[index++] = uMax;
					uvs[index++] = vMin;
					uvs[index++] = uMin;
					uvs[index++] = vMax;
					uvs[index++] = uMax;
					uvs[index++] = vMax;
				}

				coords = spriteSheet.getFrame(particle.sequence2, particle.frame * 10.0)?.coords;//sequences[particle.sequence].frames[particle.frame].coords;
				//coords = coords.m_TextureCoordData[0];
				if (coords) {
					let uMin = coords[0];
					let vMin = coords[1];
					let uMax = coords[2];
					let vMax = coords[3];
					uvs2[index2++] = uMin;
					uvs2[index2++] = vMin;
					uvs2[index2++] = uMax;
					uvs2[index2++] = vMin;
					uvs2[index2++] = uMin;
					uvs2[index2++] = vMax;
					uvs2[index2++] = uMax;
					uvs2[index2++] = vMax;
				}
				*/
			} else {
				index += 8;
				index2 += 8;
			}
			geometry.attributes.get('aTextureCoord')!.dirty = true;
			geometry.attributes.get('aTextureCoord2')!.dirty = true;
		}
	}

	set maxParticles(maxParticles: number) {
		this.#maxParticles = new Graphics().isWebGL2 ? maxParticles : ceilPowerOfTwo(maxParticles);
		this.#createParticlesArray();
		this._initBuffers();
	}

	_initBuffers() {
		const geometry = this.geometry;
		const vertices = [];
		const uvs = [];
		const uvs2 = [];
		const indices = [];
		const id = [];

		for (let i = 0; i < this.#maxParticles; i++) {
			const indiceBase = i * 4;
			indices.push(indiceBase, indiceBase + 2, indiceBase + 1, indiceBase + 2, indiceBase + 3, indiceBase + 1);
			vertices.push(-1.0, 1.0, 0.0, 1.0, 1.0, 0.0, -1.0, -1.0, 0.0, 1.0, -1.0, 0.0);
			uvs.push(0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0);
			uvs2.push(0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0);
			id.push(i, i, i, i);
		}
		geometry.count = indices.length;
		geometry.setIndex(new Uint32BufferAttribute(indices, 1));
		geometry.setAttribute('aVertexPosition', new Float32BufferAttribute(vertices, 3));
		geometry.setAttribute('aTextureCoord', new Float32BufferAttribute(uvs, 2));
		geometry.setAttribute('aTextureCoord2', new Float32BufferAttribute(uvs2, 2));
		geometry.setAttribute('aParticleId', new Float32BufferAttribute(id, 1));
		this.mesh!.setUniform('uMaxParticles', this.#maxParticles);//TODOv3:optimize
	}

	initRenderer(particleSystem: Source2ParticleSystem) {
		this.mesh!.serializable = false;
		this.mesh!.hideInExplorer = true;
		this.mesh!.setDefine('HARDWARE_PARTICLES');
		this.#createParticlesTexture();
		this.mesh!.setUniform('uParticles', this.texture!);

		this.maxParticles = particleSystem.maxParticles;
		particleSystem.addChild(this.mesh);
	}

	#createParticlesArray() {
		this.imgData = new Float32Array(this.#maxParticles * 4 * TEXTURE_WIDTH);
	}

	#createParticlesTexture() {
		this.texture = TextureManager.createTexture();
		const gl = new Graphics().glContext;//TODO
		gl.bindTexture(GL_TEXTURE_2D, this.texture.texture);
		gl.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
		gl.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
		gl.bindTexture(GL_TEXTURE_2D, null);
	}

	updateParticlesTexture() {
		const gl = new Graphics().glContext;

		gl.bindTexture(GL_TEXTURE_2D, this.texture!.texture);
		if (new Graphics().isWebGL2) {
			gl.texImage2D(GL_TEXTURE_2D, 0, GL_RGBA32F, TEXTURE_WIDTH, this.#maxParticles, 0, GL_RGBA, GL_FLOAT, this.imgData!);
		} else {
			gl.texImage2D(GL_TEXTURE_2D, 0, GL_RGBA, TEXTURE_WIDTH, this.#maxParticles, 0, GL_RGBA, GL_FLOAT, this.imgData!);
		}
		gl.bindTexture(GL_TEXTURE_2D, null);
	}

	#setupParticlesTexture(particleList: Source2Particle[], maxParticles: number, elapsedTime: number) {
		const a = this.imgData!;
		const m_flMaxLength = this.maxLength;
		const m_flMinLength = this.minLength;
		const m_flLengthFadeInTime = this.lengthFadeInTime;
		const rate = this.getParameter('animation rate') ?? 30;
		const fit = this.getParameter('animation_fit_lifetime') ?? 0;

		if (fit) {
			//rate = this.material.sequenceLength / particle.timeToLive;
		}

		//const a = new Float32Array(maxParticles * 4 * TEXTURE_WIDTH);
		let index = 0;

		let flOODt;
		if (this.ignoreDT) {
			flOODt = 1;
		} else {
			flOODt = (elapsedTime != 0.0) ? (1.0 / elapsedTime) : 1.0;
		}

		const radiusScale = this.getParamScalarValue('m_flRadiusScale') ?? 1;
		const alphaScale = this.getParamScalarValue('m_flAlphaScale') ?? 1;

		for (const particle of particleList) {
			const flAge = particle.currentTime;
			const flLengthScale = (flAge >= m_flLengthFadeInTime) ? 1.0 : (flAge / m_flLengthFadeInTime);
			const vecDelta = vec3.subtract(vec3.create(), particle.prevPosition, particle.position);//TODOv3: optimize
			const flMag = vec3.length(vecDelta);
			vec3.normalize(vecDelta, vecDelta);
			let flLength = flLengthScale * flMag * flOODt * particle.trailLength * this.lengthScale;
			if (flLength <= 0.0) {
				return;
			}

			flLength = clamp(flLength, m_flMinLength, m_flMaxLength);
			//vec3.scale(vecDelta, vecDelta, flLength * 0.5);TODOv3

			//const vTangentY = vec3.cross(vec3.create(), vDirToBeam, vecDelta);
			let rad = particle.radius * radiusScale;
			if (flLength < rad) {
				rad = flLength;
			}

			a[index++] = particle.position[0];
			a[index++] = particle.position[1];
			a[index++] = particle.position[2];
			index++;
			a[index++] = particle.color[0];
			a[index++] = particle.color[1];
			a[index++] = particle.color[2];
			a[index++] = particle.alpha * alphaScale;
			a[index++] = rad;
			index++;
			a[index++] = particle.rotationRoll;
			a[index++] = particle.rotationYaw;
			a[index++] = vecDelta[0];
			a[index++] = vecDelta[1];
			a[index++] = vecDelta[2];
			a[index++] = flLength;
			a[index++] = particle.normal[0];
			a[index++] = particle.normal[1];
			a[index++] = particle.normal[2];
			index += 13;
		}

		this.updateParticlesTexture();
	}

	init() {
		if (this.setDefaultTexture) {
			this.setTexture(DEFAULT_PARTICLE_TEXTURE);
		}
	}
}
RegisterSource2ParticleOperator('C_OP_RenderTrails', RenderTrails);
