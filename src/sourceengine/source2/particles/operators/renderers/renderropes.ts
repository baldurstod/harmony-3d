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
import { Graphics } from '../../../../../graphics/graphics';
import { Mesh } from '../../../../../objects/mesh';
import { BeamBufferGeometry, BeamSegment } from '../../../../../primitives/geometries/beambuffergeometry';
import { TextureManager } from '../../../../../textures/texturemanager';
import { GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_TEXTURE_MIN_FILTER, GL_NEAREST, GL_FLOAT, GL_RGBA, GL_RGBA32F } from '../../../../../webgl/constants';
import { TEXTURE_WIDTH } from '../../../../common/particles/constants';
import { SEQUENCE_COMBINE_MODE_ALPHA_FROM0_RGB_FROM_1 } from './constants';
import { BufferGeometry } from '../../../../../geometry/buffergeometry';
import { Source2SpriteSheet } from '../../../textures/source2spritesheet';
import { Texture } from '../../../../../textures/texture';

const SEQUENCE_COMBINE_MODE_USE_SEQUENCE_0 = 'SEQUENCE_COMBINE_MODE_USE_SEQUENCE_0';

const SEQUENCE_SAMPLE_COUNT = 1;//TODO

export class RenderRopes extends Operator {
	geometry: BeamBufferGeometry;
	setDefaultTexture = true;//TODO: remove this property
	textureVWorldSize = 10;
	textureVScrollRate = 10;
	textureScroll = 0;
	spriteSheet: Source2SpriteSheet;
	#maxParticles: number = 1000;//TODO: default value
	texture: Texture;//TODO: set private ?
	imgData: Float32Array;//TODO: set private ?
	constructor(system) {
		super(system);
		this.material = new Source2SpriteCard(system.repository);
		this.geometry = new BeamBufferGeometry();
		this.mesh = new Mesh(this.geometry, this.material);
		this.setOrientationType(PARTICLE_ORIENTATION_SCREEN_ALIGNED);
		Source2MaterialManager.addMaterial(this.material);
		this.setDefaultTexture = true;
		//this.setParam(OPERATOR_PARAM_TEXTURE, 'materials/particle/base_sprite');//TODOv3: make a const
		//this.setParam(OPERATOR_PARAM_MOD_2X, false);
		//this.setParam(OPERATOR_PARAM_ORIENTATION_TYPE, ORIENTATION_TYPE_SCREEN_ALIGN);
		//this.setParam(OPERATOR_PARAM_SEQUENCE_COMBINE_MODE, SEQUENCE_COMBINE_MODE_USE_SEQUENCE_0);//TODOv3: get the actual default value
		this.textureVWorldSize = 10;
		this.textureVScrollRate = 10;
		this.textureScroll = 0;
	}

	_paramChanged(paramName, value) {
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
			case 'm_nSequenceCombineMode':
				this.setSequenceCombineMode(value);
				break;
			case 'm_flTextureVWorldSize':
				this.textureVWorldSize = value;
				break;
			case 'm_flTextureVScrollRate':
				this.textureVScrollRate = value;
				break;
			case 'm_flFinalTextureScaleU':
			case 'm_flFinalTextureScaleV':
				break;
			default:
				super._paramChanged(paramName, value);
		}
	}

	setSequenceCombineMode(sequenceCombineMode) {
		this.material.removeDefine('USE_TEXTURE_COORD_2');
		switch (sequenceCombineMode) {
			case 'SEQUENCE_COMBINE_MODE_ALPHA_FROM0_RGB_FROM_1':
				this.material.setDefine('SEQUENCE_COMBINE_MODE', String(SEQUENCE_COMBINE_MODE_ALPHA_FROM0_RGB_FROM_1));
				this.material.setDefine('USE_TEXTURE_COORD_2');
				break;
			default:
				console.error('Unknonw sequenceCombineMode ', sequenceCombineMode);
		}
	}

	async setTexture(texturePath) {
		delete this.setDefaultTexture;
		this.material.setTexturePath(texturePath);
		this.spriteSheet = await Source2TextureManager.getTextureSheet(this.system.repository, texturePath);
	}

	updateParticles(particleSystem, particleList, elapsedTime) {//TODOv3
		this.textureScroll += elapsedTime * this.textureVScrollRate;
		const subdivCount = this.getParameter('subdivision_count') ?? 3;

		let geometry = this.geometry;
		const vertices = [];
		const indices = [];
		const id = [];

		let segments = [];

		let particle;
		let ropeLength = 0.0;
		let previousSegment = null;
		let textureVWorldSize = 1 / this.textureVWorldSize;
		let textureScroll = this.textureScroll;
		let alphaScale = this.getParamScalarValue('m_flAlphaScale') ?? 1;
		for (let i = 0, l = particleList.length; i < l; i++) {
			//for (let i = 0, l = (particleList.length - 1) * subdivCount + 1; i < l; i++) {
			particle = particleList[i];
			let segment = new BeamSegment(particle.position, [particle.color[0], particle.color[1], particle.color[2], particle.alpha * alphaScale], 0.0, particle.radius);
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

	set maxParticles(maxParticles) {
		this.#maxParticles = maxParticles;
		this._createParticlesArray();
	}

	initRenderer(particleSystem) {
		this.mesh.serializable = false;
		this.mesh.hideInExplorer = true;
		this.mesh.setDefine('IS_ROPE');
		this.mesh.setDefine('USE_VERTEX_COLOR');
		this.createParticlesTexture();
		this.mesh.setUniform('uParticles', this.texture);

		this.maxParticles = particleSystem.maxParticles;
		particleSystem.addChild(this.mesh);
	}

	_createParticlesArray() {
		this.imgData = new Float32Array(this.#maxParticles * 4 * TEXTURE_WIDTH);
	}

	createParticlesTexture() {
		this.texture = TextureManager.createTexture();
		const gl = new Graphics().glContext;//TODO
		gl.bindTexture(GL_TEXTURE_2D, this.texture.texture);
		gl.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
		gl.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
		gl.bindTexture(GL_TEXTURE_2D, null);
	}

	updateParticlesTexture() {
		const gl = new Graphics().glContext;

		gl.bindTexture(GL_TEXTURE_2D, this.texture.texture);
		if (new Graphics().isWebGL2) {
			gl.texImage2D(GL_TEXTURE_2D, 0, GL_RGBA32F, TEXTURE_WIDTH, this.#maxParticles, 0, GL_RGBA, GL_FLOAT, this.imgData);
		} else {
			gl.texImage2D(GL_TEXTURE_2D, 0, GL_RGBA, TEXTURE_WIDTH, this.#maxParticles, 0, GL_RGBA, GL_FLOAT, this.imgData);
		}
		gl.bindTexture(GL_TEXTURE_2D, null);
	}

	setupParticlesTexture(particleList, maxParticles) {
		const a = this.imgData;

		let index = 0;
		for (let particle of particleList) {//TODOv3
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
