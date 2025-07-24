import { vec3, vec4 } from 'gl-matrix';
import { Graphics } from '../../../../../graphics/graphics';
import { Mesh } from '../../../../../objects/mesh';
import { BeamBufferGeometry, BeamSegment } from '../../../../../primitives/geometries/beambuffergeometry';
import { Texture } from '../../../../../textures/texture';
import { TextureManager } from '../../../../../textures/texturemanager';
import { GL_FLOAT, GL_NEAREST, GL_RGBA, GL_RGBA32F, GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_TEXTURE_MIN_FILTER } from '../../../../../webgl/constants';
import { TEXTURE_WIDTH } from '../../../../common/particles/constants';
import { PARTICLE_ORIENTATION_SCREEN_ALIGNED } from '../../../../common/particles/particleconsts';
import { Source2MaterialManager } from '../../../materials/source2materialmanager';
import { Source2ParticleSystem } from '../../export';
import { DEFAULT_PARTICLE_TEXTURE } from '../../particleconstants';
import { Source2Particle } from '../../source2particle';
import { OperatorParam } from '../operatorparam';
import { OPERATOR_PARAM_TEXTURE } from '../operatorparams';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { SEQUENCE_COMBINE_MODE_ALPHA_FROM0_RGB_FROM_1 } from './constants';
import { RenderBase } from './renderbase';


const renderRopesTempVec4 = vec4.create();

const SEQUENCE_COMBINE_MODE_USE_SEQUENCE_0 = 'SEQUENCE_COMBINE_MODE_USE_SEQUENCE_0';

const SEQUENCE_SAMPLE_COUNT = 1;//TODO
const DEFAULT_WORLD_SIZE = 10;// TODO: check default value
const DEFAULT_SCROLL_RATE = 10;// TODO: check default value
const DEFAULT_COLOR_SCALE = vec3.fromValues(1, 1, 1);// TODO: check default value
const DEFAULT_DEPTH_BIAS = 1;// TODO: check default value
const DEFAULT_FEATHERING_MODE = 'PARTICLE_DEPTH_FEATHERING_ON_REQUIRED';// TODO: check default value
const DEFAULT_FEATHERING_MAX_DIST = 1;// TODO: check default value
const DEFAULT_COLOR_BLEND_TYPE = 'PARTICLE_COLOR_BLEND_MIN';// TODO: check default value

export class RenderRopes extends RenderBase {
	#textureVWorldSize = DEFAULT_WORLD_SIZE;
	#textureVScrollRate = DEFAULT_SCROLL_RATE;
	#textureScroll = 0;
	#maxParticles = 1000;//TODO: default value
	#texture?: Texture;
	#imgData?: Float32Array;
	#geometry = new BeamBufferGeometry();
	#addSelfAmount = 1;// TODO: check default value
	#saturateColorPreAlphaBlend = false;// TODO: check default value
	#minTesselation = 1;// TODO: check default value
	#maxTesselation = 1;// TODO: check default value
	#depthBias = DEFAULT_DEPTH_BIAS;
	#featheringMode = DEFAULT_FEATHERING_MODE;
	#featheringMaxDist = DEFAULT_FEATHERING_MAX_DIST;
	#colorBlendType = DEFAULT_COLOR_BLEND_TYPE

	constructor(system: Source2ParticleSystem) {
		super(system);
		this.mesh = new Mesh(this.#geometry, this.material);
		this.setOrientationType(PARTICLE_ORIENTATION_SCREEN_ALIGNED);
		Source2MaterialManager.addMaterial(this.material);
		this.setDefaultTexture = true;
		//this.setParam(OPERATOR_PARAM_TEXTURE, 'materials/particle/base_sprite');//TODOv3: make a const
		//this.setParam(OPERATOR_PARAM_MOD_2X, false);
		//this.setParam(OPERATOR_PARAM_ORIENTATION_TYPE, ORIENTATION_TYPE_SCREEN_ALIGN);
		//this.setParam(OPERATOR_PARAM_SEQUENCE_COMBINE_MODE, SEQUENCE_COMBINE_MODE_USE_SEQUENCE_0);//TODOv3: get the actual default value
	}

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case OPERATOR_PARAM_TEXTURE:
				console.error('do this param', paramName, param);
				this.setTexture(param);
				break;
			case 'm_nSequenceCombineMode':
				console.error('do this param', paramName, param);
				this.setSequenceCombineMode(param);
				break;
			case 'm_flTextureVWorldSize':
				this.#textureVWorldSize = param.getValueAsNumber() ?? DEFAULT_WORLD_SIZE;
				break;
			case 'm_flTextureVScrollRate':
				this.#textureVScrollRate = param.getValueAsNumber() ?? DEFAULT_SCROLL_RATE;
				break;
			case 'm_flAddSelfAmount':
				this.#addSelfAmount = param.getValueAsNumber() ?? 1;// TODO: check default value
				break;
			case 'm_nMinTesselation':
				this.#minTesselation = param.getValueAsNumber() ?? 1;// TODO: check default value
				break;
			case 'm_nMaxTesselation':
				this.#maxTesselation = param.getValueAsNumber() ?? 1;// TODO: check default value
				break;
			case 'm_bSaturateColorPreAlphaBlend':
				this.#saturateColorPreAlphaBlend = param.getValueAsBool() ?? false;// TODO: check default value
				break;
			case 'm_flDepthBias':
				this.#depthBias = param.getValueAsNumber() ?? DEFAULT_DEPTH_BIAS;// TODO: check default value
				break;
			case 'm_nFeatheringMode'://TODO: mutualize in renderbase
				this.#featheringMode = param.getValueAsString() ?? DEFAULT_FEATHERING_MODE;// TODO: check default value
				break;
			case 'm_flFeatheringMaxDist':
				this.#featheringMaxDist = param.getValueAsNumber() ?? DEFAULT_FEATHERING_MAX_DIST;
				break;
			case 'm_nColorBlendType'://TODO: mutualize in renderbase
				this.#colorBlendType = param.getValueAsString() ?? DEFAULT_COLOR_BLEND_TYPE;// TODO: check default value
				break;
			case 'm_flFinalTextureScaleU':
			case 'm_flFinalTextureScaleV':
			case 'm_flOverbrightFactor':// TODO: mutualize ?
			case 'm_flRadiusScale':
			case 'm_vecColorScale':
				// used in updateParticles
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	setSequenceCombineMode(sequenceCombineMode: string) {
		this.material?.removeDefine('USE_TEXTURE_COORD_2');
		switch (sequenceCombineMode) {
			case 'SEQUENCE_COMBINE_MODE_ALPHA_FROM0_RGB_FROM_1':
				this.material?.setDefine('SEQUENCE_COMBINE_MODE', String(SEQUENCE_COMBINE_MODE_ALPHA_FROM0_RGB_FROM_1));
				this.material?.setDefine('USE_TEXTURE_COORD_2');
				break;
			default:
				console.error('Unknown sequenceCombineMode ', sequenceCombineMode);
		}
	}

	updateParticles(particleSystem: Source2ParticleSystem, particleList: Source2Particle[], elapsedTime: number) {//TODOv3
		// TODO: use saturateColorPreAlphaBlend, m_nMinTesselation, m_nMaxTesselation, colorScale, m_flDepthBias, featheringMode
		this.mesh!.setUniform('uOverbrightFactor', this.getParamScalarValue('m_flOverbrightFactor') ?? 1);
		const colorScale = this.getParamVectorValue(renderRopesTempVec4, 'm_vecColorScale') ?? DEFAULT_COLOR_SCALE;
		const radiusScale = this.getParamScalarValue('m_flRadiusScale') ?? 1;
		this.#textureScroll += elapsedTime * this.#textureVScrollRate;
		const subdivCount = this.getParameter('subdivision_count') ?? 3;

		const geometry = this.#geometry;
		const vertices = [];
		const indices = [];
		const id = [];

		const segments = [];

		let particle;
		let ropeLength = 0.0;
		let previousSegment = null;
		const textureVWorldSize = 1 / this.#textureVWorldSize;
		const textureScroll = this.#textureScroll;
		const alphaScale = this.getParamScalarValue('m_flAlphaScale') ?? 1;
		for (let i = 0, l = particleList.length; i < l; i++) {
			//for (let i = 0, l = (particleList.length - 1) * subdivCount + 1; i < l; i++) {
			particle = particleList[i];
			const segment = new BeamSegment(particle.position, [particle.color[0], particle.color[1], particle.color[2], particle.alpha * alphaScale], 0.0, particle.radius);
			vec3.copy(segment.normal, particle.normal);
			if (previousSegment) {
				ropeLength += segment.distanceTo(previousSegment);
			}
			segment.texCoordY = (ropeLength + textureScroll) * textureVWorldSize;
			segments.push(segment);
			previousSegment = segment;
		}
		geometry.segments = segments;
	}

	set maxParticles(maxParticles: number) {
		this.#maxParticles = maxParticles;
		this.#createParticlesArray();
	}

	initRenderer(particleSystem: Source2ParticleSystem) {
		if (this.mesh) {
			this.mesh.serializable = false;
			this.mesh.hideInExplorer = true;
			this.mesh.setDefine('IS_ROPE');
			this.mesh.setDefine('USE_VERTEX_COLOR');
			this.#createParticlesTexture();
			this.mesh.setUniform('uParticles', this.#texture!);
		}

		this.maxParticles = particleSystem.maxParticles;
		particleSystem.addChild(this.mesh);
	}

	#createParticlesArray() {
		this.#imgData = new Float32Array(this.#maxParticles * 4 * TEXTURE_WIDTH);
	}

	#createParticlesTexture() {
		this.#texture = TextureManager.createTexture();
		const gl = new Graphics().glContext;//TODO
		gl.bindTexture(GL_TEXTURE_2D, this.#texture.texture);
		gl.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
		gl.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
		gl.bindTexture(GL_TEXTURE_2D, null);
	}

	updateParticlesTexture() {
		const gl = new Graphics().glContext;

		if (!this.#imgData || !this.#texture) {
			return;
		}

		gl.bindTexture(GL_TEXTURE_2D, this.#texture.texture);
		if (new Graphics().isWebGL2) {
			gl.texImage2D(GL_TEXTURE_2D, 0, GL_RGBA32F, TEXTURE_WIDTH, this.#maxParticles, 0, GL_RGBA, GL_FLOAT, this.#imgData);
		} else {
			gl.texImage2D(GL_TEXTURE_2D, 0, GL_RGBA, TEXTURE_WIDTH, this.#maxParticles, 0, GL_RGBA, GL_FLOAT, this.#imgData);
		}
		gl.bindTexture(GL_TEXTURE_2D, null);
	}

	#setupParticlesTexture(particleList: Source2Particle[], maxParticles: number) {
		const a = this.#imgData;

		if (!a) {
			return;
		}

		let index = 0;
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
			a[index++] = particle.alpha;
			a[index++] = particle.radius;
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
RegisterSource2ParticleOperator('C_OP_RenderRopes', RenderRopes);
