import { vec3, vec4 } from 'gl-matrix';
import { Float32BufferAttribute, Uint32BufferAttribute } from '../../../../../geometry/bufferattribute';
import { BufferGeometry } from '../../../../../geometry/buffergeometry';
import { Graphics } from '../../../../../graphics/graphics';
import { ceilPowerOfTwo, clamp } from '../../../../../math/functions';
import { Mesh } from '../../../../../objects/mesh';
import { TextureManager } from '../../../../../textures/texturemanager';
import { GL_FLOAT, GL_NEAREST, GL_RGBA, GL_RGBA32F, GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_TEXTURE_MIN_FILTER } from '../../../../../webgl/constants';
import { TEXTURE_WIDTH } from '../../../../common/particles/constants';
import { PARTICLE_ORIENTATION_SCREEN_ALIGNED } from '../../../../common/particles/particleconsts';
import { Source2MaterialManager } from '../../../materials/source2materialmanager';
import { Source2ParticleSystem } from '../../export';
import { DEFAULT_PARTICLE_TEXTURE } from '../../particleconstants';
import { Source2Particle } from '../../source2particle';
import { Source2ParticleManager } from '../../source2particlemanager';
import { OperatorParam } from '../operatorparam';
import { OPERATOR_PARAM_TEXTURE } from '../operatorparams';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { SEQUENCE_COMBINE_MODE_ALPHA_FROM0_RGB_FROM_1 } from './constants';
import { RenderBase } from './renderbase';

const renderSpritesTempVec4 = vec4.create();

const SEQUENCE_COMBINE_MODE_USE_SEQUENCE_0 = 'SEQUENCE_COMBINE_MODE_USE_SEQUENCE_0';

const SEQUENCE_SAMPLE_COUNT = 1;//TODO
const DEFAULT_MAX_SIZE = 5000;

const DEFAULT_BLEND_FRAMES_SEQ_0 = false;// TODO: check default value
const DEFAULT_ANIMATION_RATE = 1;// TODO: check default value
const DEFAULT_START_FADE_SIZE = 1;// TODO: check default value
const DEFAULT_END_FADE_SIZE = 1;// TODO: check default value
const DEFAULT_FEATHERING_MODE = 'PARTICLE_DEPTH_FEATHERING_ON_REQUIRED';// TODO: check default value
const DEFAULT_FEATHERING_MAX_DIST = 1;// TODO: check default value
const DEFAULT_DEPTH_BIAS = 1;// TODO: check default value
const DEFAULT_COLOR_SCALE = vec3.fromValues(1, 1, 1);// TODO: check default value
const DEFAULT_ADD_SELF_AMOUNT = 1;// TODO: check default value
const DEFAULT_SATURATE_COLOR_PRE_ALPHA_BLEND = false;// TODO: check default value
const DEFAULT_ANIMATION_TYPE = 'ANIMATION_TYPE_FIT_LIFETIME';// TODO: check default value
const DEFAULT_REFRACT = false;// TODO: check default value
const DEFAULT_REFRACT_BLUR_RADIUS = 1;// TODO: check default value
const DEFAULT_GAMMA_CORRECT_VERTEX_COLORS = true;// TODO: check default value

export class RenderSprites extends RenderBase {
	geometry: BufferGeometry = new BufferGeometry();
	#minSize = 0.0;
	#maxSize = DEFAULT_MAX_SIZE;
	#saturateColorPreAlphaBlend = DEFAULT_SATURATE_COLOR_PRE_ALPHA_BLEND;
	#maxParticles = 0;
	#featheringMode = DEFAULT_FEATHERING_MODE;
	#featheringMaxDist = DEFAULT_FEATHERING_MAX_DIST;
	texture = TextureManager.createTexture();
	imgData!: Float32Array;//TODO: set private ?
	#addSelfAmount = DEFAULT_ADD_SELF_AMOUNT;
	#blendFramesSeq0 = DEFAULT_BLEND_FRAMES_SEQ_0;
	#animationRate = DEFAULT_ANIMATION_RATE;
	#startFadeSize = DEFAULT_START_FADE_SIZE;
	#endFadeSize = DEFAULT_END_FADE_SIZE;
	#depthBias = DEFAULT_DEPTH_BIAS;
	#animationType = DEFAULT_ANIMATION_TYPE;
	#refract = DEFAULT_REFRACT;
	#refractBlurRadius = DEFAULT_REFRACT_BLUR_RADIUS;
	#gammaCorrectVertexColors = DEFAULT_GAMMA_CORRECT_VERTEX_COLORS;

	constructor(system: Source2ParticleSystem) {
		super(system);
		this.mesh = new Mesh({ geometry: this.geometry, material: this.material });
		this.setMaxParticles(1000);//TODO: default value
		this.setOrientationType(PARTICLE_ORIENTATION_SCREEN_ALIGNED);
		Source2MaterialManager.addMaterial(this.material);
		//this.setParam(OPERATOR_PARAM_TEXTURE, 'materials/particle/base_sprite');//TODOv3: make a const
		//this.setParam(OPERATOR_PARAM_MOD_2X, false);
		//this.setParam(OPERATOR_PARAM_ORIENTATION_TYPE, ORIENTATION_TYPE_SCREEN_ALIGN);
		//this.setParam(OPERATOR_PARAM_SEQUENCE_COMBINE_MODE, SEQUENCE_COMBINE_MODE_USE_SEQUENCE_0);//TODOv3: get the actual default value
	}

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case OPERATOR_PARAM_TEXTURE:
				this.setTexture(param.getValueAsString() ?? '');// TODO: check default value
				break;
			case 'm_nSequenceCombineMode':
				this.setSequenceCombineMode(param.getValueAsString() ?? '');// TODO: check default value
				break;
			case 'm_flMinSize':
				this.#minSize = (param.getValueAsNumber() ?? 0) * 200.;//TODO: use the actual screen size
				break;
			case 'm_flMaxSize':
				this.#maxSize = (param.getValueAsNumber() ?? DEFAULT_MAX_SIZE) * 200.;//TODO: use the actual screen size
				break;
			case 'm_bSaturateColorPreAlphaBlend':
				this.#saturateColorPreAlphaBlend = param.getValueAsBool() ?? DEFAULT_SATURATE_COLOR_PRE_ALPHA_BLEND;
				break;
			case 'm_bBlendFramesSeq0':
				this.#blendFramesSeq0 = param.getValueAsBool() ?? DEFAULT_BLEND_FRAMES_SEQ_0;
				break;
			case 'm_flDepthBias'://TODO: mutualize in renderbase
				this.#depthBias = param.getValueAsNumber() ?? DEFAULT_DEPTH_BIAS;// TODO: check default value
				break;
			case 'm_nFeatheringMode':
				this.#featheringMode = param.getValueAsString() ?? DEFAULT_FEATHERING_MODE;// TODO: check default value
				break;
			case 'm_flFeatheringMaxDist':
				this.#featheringMaxDist = param.getValueAsNumber() ?? DEFAULT_FEATHERING_MAX_DIST;
				break;
			case 'm_flAddSelfAmount':// TODO: mutualize ?
				this.#addSelfAmount = param.getValueAsNumber() ?? DEFAULT_ADD_SELF_AMOUNT;
				break;
			case 'm_flAnimationRate':
				this.#animationRate = param.getValueAsNumber() ?? DEFAULT_ANIMATION_RATE;
				break;
			case 'm_flStartFadeSize':
				this.#startFadeSize = param.getValueAsNumber() ?? DEFAULT_START_FADE_SIZE;
				break;
			case 'm_flEndFadeSize':
				this.#endFadeSize = param.getValueAsNumber() ?? DEFAULT_END_FADE_SIZE;
				break;
			case 'm_nAnimationType':
				this.#animationType = param.getValueAsString() ?? DEFAULT_ANIMATION_TYPE;
				break;
			case 'm_bRefract':
				this.#refract = param.getValueAsBool() ?? DEFAULT_REFRACT;
				break;
			case 'm_nRefractBlurRadius':
				this.#refractBlurRadius = param.getValueAsNumber() ?? DEFAULT_REFRACT_BLUR_RADIUS;
				break;
			case 'm_bGammaCorrectVertexColors':
				this.#gammaCorrectVertexColors = param.getValueAsBool() ?? DEFAULT_GAMMA_CORRECT_VERTEX_COLORS;
				break;
			case 'm_flRadiusScale':// TODO: mutualize ?
			case 'm_flAlphaScale':// TODO: mutualize ?
			case 'm_flOverbrightFactor':// TODO: mutualize ?
			case 'm_flRefractAmount':
			case 'VisibilityInputs':
			case 'm_vecColorScale':
				// used in updateParticles
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	setSequenceCombineMode(sequenceCombineMode: string/*TODO: create enum*/) {
		this.material.removeDefine('USE_TEXTURE_COORD_2');
		switch (sequenceCombineMode) {
			case 'SEQUENCE_COMBINE_MODE_ALPHA_FROM0_RGB_FROM_1':
				this.material.setDefine('SEQUENCE_COMBINE_MODE', String(SEQUENCE_COMBINE_MODE_ALPHA_FROM0_RGB_FROM_1));
				this.material.setDefine('USE_TEXTURE_COORD_2');
				break;
			default:
				console.error('Unknown sequenceCombineMode ', sequenceCombineMode);
		}
	}

	updateParticles(particleSystem: Source2ParticleSystem, particleList: Source2Particle[], elapsedTime: number): void {//TODOv3
		// TODO: use m_flRefractAmount, m_flAddSelfAmount, blendFramesSeq0, VisibilityInputs, m_nFeatheringMode, m_bGammaCorrectVertexColors
		// TODO: do refraction ex: particles/units/heroes/hero_arc_warden/arc_warden_bracer_hand.vpcf_c
		const colorScale = this.getParamVectorValue(renderSpritesTempVec4, 'm_vecColorScale') ?? DEFAULT_COLOR_SCALE;

		const m_bFitCycleToLifetime = this.getParameter('animation_fit_lifetime');
		const rate = this.#animationRate;//this.getParameter('animation rate');
		const useAnimRate = this.getParameter('use animation rate as FPS');
		this.geometry.count = particleList.length * 6;
		const maxParticles = this.#maxParticles;
		this.#setupParticlesTexture(particleList);
		this.mesh!.setUniform('uMaxParticles', maxParticles);//TODOv3:optimize
		this.mesh!.setVisible(Source2ParticleManager.visible);
		this.mesh!.setUniform('uOverbrightFactor', this.getParamScalarValue('m_flOverbrightFactor') ?? 1);

		const uvs = this.geometry.attributes.get('aTextureCoord')!._array;
		const uvs2 = this.geometry.attributes.get('aTextureCoord2')!._array;
		let index = 0;
		let index2 = 0;
		for (const particle of particleList) {
			const sequence = particle.sequence;
			let flAgeScale;
			if (m_bFitCycleToLifetime) {
				const flLifetime = particle.timeToLive;//SubFloat(pLifeDuration[ nGroup * ld_stride ], nOffset);
				flAgeScale = (flLifetime > 0.0) ? (1.0 / flLifetime) * SEQUENCE_SAMPLE_COUNT : 0.0;
			} else {
				flAgeScale = rate * SEQUENCE_SAMPLE_COUNT;
				if (useAnimRate) {
					particle.frame += elapsedTime * rate;
					const frameSpan = this.material.getFrameSpan(sequence);
					if (frameSpan !== null) {
						flAgeScale = flAgeScale / frameSpan;
					}
				}
			}

			particle.frame += elapsedTime;

			if (this.spriteSheet) {
				let coords = this.spriteSheet.getFrame(particle.sequence, particle.frame * 10.0)?.coords;//sequences[particle.sequence].frames[particle.frame].coords;
				//coords = coords.m_TextureCoordData[0];
				if (coords) {
					const uMin = coords[0];
					const vMin = coords[1];
					const uMax = coords[2];
					const vMax = coords[3];
					uvs[index++] = uMin;
					uvs[index++] = vMin;
					uvs[index++] = uMax;
					uvs[index++] = vMin;
					uvs[index++] = uMin;
					uvs[index++] = vMax;
					uvs[index++] = uMax;
					uvs[index++] = vMax;
				}

				coords = this.spriteSheet.getFrame(particle.sequence2, particle.frame * 10.0)?.coords;//sequences[particle.sequence].frames[particle.frame].coords;
				//coords = coords.m_TextureCoordData[0];
				if (coords) {
					const uMin = coords[0];
					const vMin = coords[1];
					const uMax = coords[2];
					const vMax = coords[3];
					uvs2[index2++] = uMin;
					uvs2[index2++] = vMin;
					uvs2[index2++] = uMax;
					uvs2[index2++] = vMin;
					uvs2[index2++] = uMin;
					uvs2[index2++] = vMax;
					uvs2[index2++] = uMax;
					uvs2[index2++] = vMax;
				}
			} else {
				index += 8;
				index2 += 8;
			}
		}
		this.geometry.attributes.get('aTextureCoord')!.dirty = true;
		this.geometry.attributes.get('aTextureCoord2')!.dirty = true;
	}

	setMaxParticles(maxParticles: number): void {
		this.#maxParticles = Graphics.isWebGL2 ? maxParticles : ceilPowerOfTwo(maxParticles);
		this.#createParticlesArray();
		this.#initBuffers();
	}

	/**
	 * @deprecated Please use `setPosition` instead.
	 */
	set maxParticles(maxParticles: number) {
		this.setMaxParticles(maxParticles);
	}

	#initBuffers() {
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
			uvs.push(0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0);
			uvs2.push(0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0);
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
		this.#initParticlesTexture();
		this.mesh!.setUniform('uParticles', this.texture);

		this.setMaxParticles(particleSystem.maxParticles);
		particleSystem.addChild(this.mesh);
	}

	#createParticlesArray() {
		this.imgData = new Float32Array(this.#maxParticles * 4 * TEXTURE_WIDTH);
	}

	#initParticlesTexture() {
		const gl = Graphics.glContext;//TODO
		gl.bindTexture(GL_TEXTURE_2D, this.texture.texture);
		gl.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
		gl.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
		gl.bindTexture(GL_TEXTURE_2D, null);
	}

	updateParticlesTexture() {
		const gl = Graphics.glContext;

		gl.bindTexture(GL_TEXTURE_2D, this.texture.texture);
		if (Graphics.isWebGL2) {
			gl.texImage2D(GL_TEXTURE_2D, 0, GL_RGBA32F, TEXTURE_WIDTH, this.#maxParticles, 0, GL_RGBA, GL_FLOAT, this.imgData);
		} else {
			gl.texImage2D(GL_TEXTURE_2D, 0, GL_RGBA, TEXTURE_WIDTH, this.#maxParticles, 0, GL_RGBA, GL_FLOAT, this.imgData);
		}
		gl.bindTexture(GL_TEXTURE_2D, null);
	}

	#setupParticlesTexture(particleList: Source2Particle[]): void {
		const a = this.imgData;

		let index = 0;
		const alphaScale = this.getParamScalarValue('m_flAlphaScale') ?? 1;
		const radiusScale = this.getParamScalarValue('m_flRadiusScale') ?? 1;
		for (const particle of particleList) {//TODOv3
			/*let pose = bone.boneMat;
			for (let k = 0; k < 16; ++k) {
				a[index++] = pose[k];
			}*/
			a[index++] = particle.position[0];
			a[index++] = particle.position[1];
			a[index++] = particle.position[2];
			index++;
			a[index++] = particle.color[0];
			a[index++] = particle.color[1];
			a[index++] = particle.color[2];
			a[index++] = particle.alpha * alphaScale;
			a[index++] = clamp(particle.radius * radiusScale, this.#minSize, this.#maxSize);
			index++;
			a[index++] = particle.rotationRoll;
			a[index++] = particle.rotationYaw;
			index++;
			index++;
			index++;
			index++;
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
RegisterSource2ParticleOperator('C_OP_RenderSprites', RenderSprites);
//RegisterSource2ParticleOperator('C_OP_RenderProjected', RenderSprites);//TODO: set proper renderer
