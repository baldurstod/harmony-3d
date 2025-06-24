import { vec2 } from 'gl-matrix';

import { Graphics } from '../../../../../graphics/graphics';
import { Mesh } from '../../../../../objects/mesh';
import { BeamBufferGeometry, BeamSegment } from '../../../../../primitives/geometries/beambuffergeometry';
import { TextureManager } from '../../../../../textures/texturemanager';
import { Source1ParticleControler } from '../../source1particlecontroler';
import { SourceEngineParticleOperators } from '../../sourceengineparticleoperators';
import { SourceEngineParticleOperator } from '../operator';
import { PARAM_TYPE_INT, PARAM_TYPE_FLOAT } from '../../constants';
import { DEG_TO_RAD } from '../../../../../math/constants';
import { GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_TEXTURE_MIN_FILTER, GL_NEAREST, GL_FLOAT, GL_RGBA, GL_RGBA32F, } from '../../../../../webgl/constants';
import { SEQUENCE_SAMPLE_COUNT } from '../../../loaders/sheet';
import { TEXTURE_WIDTH } from '../../../../common/particles/constants';
import { RenderFace } from '../../../../../materials/constants';
import { Texture } from '../../../../../textures/texture';
import { BufferGeometry } from '../../../../../geometry/buffergeometry';

const tempVec2 = vec2.create();

export class RenderRope extends SourceEngineParticleOperator {
	static functionName = 'render rope';
	#maxParticles = 0;
	texture: Texture;
	geometry: BeamBufferGeometry;
	imgData;
	constructor() {
		super();
		this.addParam('subdivision_count', PARAM_TYPE_INT, 3);
		this.addParam('texel_size', PARAM_TYPE_FLOAT, 4.0);
		this.addParam('texture_scroll_rate', PARAM_TYPE_FLOAT, 0.0);
	}
	/*
	doRender(particleList, elapsedTime, material) {
		for (let i = 0; i < particleList.length; ++i) {
			this.renderAnimatedSprites(particleList[i], elapsedTime, material);
		}
	}
		*/
	updateParticles(particleSystem, particleList) {//TODOv3
		const subdivCount = this.getParameter('subdivision_count');
		const m_flTexelSizeInUnits = this.getParameter('texel_size');
		const m_flTextureScrollRate = this.getParameter('texture_scroll_rate');
		const m_flTextureScale = 1.0 / (this.particleSystem.material.getColorMapSize(tempVec2)[1] * m_flTexelSizeInUnits);
		const flTexOffset = m_flTextureScrollRate * particleSystem.currentTime;

		const geometry = this.geometry;
		const vertices = [];
		const indices = [];
		const id = [];

		const segments = [];

		let particle;
		let ropeLength = 0.0;
		let previousSegment = null;
		for (let i = 0, l = particleList.length; i < l; i++) {
		//for (let i = 0, l = (particleList.length - 1) * subdivCount + 1; i < l; i++) {
			particle = particleList[i];
			const segment = new BeamSegment(particle.position, [particle.color.r, particle.color.g, particle.color.b, particle.alpha], 0.0, particle.radius);
			if (previousSegment) {
				ropeLength += segment.distanceTo(previousSegment);
			}
			segment.texCoordY = (ropeLength + flTexOffset) * m_flTextureScale;
			segments.push(segment);
			previousSegment = segment;
		}
		geometry.segments = segments;
		return;
		const m_bFitCycleToLifetime = this.getParameter('animation_fit_lifetime');
		const rate = this.getParameter('animation rate');
		const useAnimRate = this.getParameter('use animation rate as FPS');
		this.geometry.count = particleList.length * 6;
		const maxParticles = particleSystem.maxParticles;
		this.#setupParticlesTexture(particleList, maxParticles);
		this.mesh.setUniform('uMaxParticles', maxParticles);//TODOv3:optimize
		this.mesh.setVisible(Source1ParticleControler.visible);



		const uvs = this.geometry.attributes.get('aTextureCoord')._array;
		let index = 0;
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
					//particle.frame+=elapsedTime*rate;
					const frameSpan = this.particleSystem.material.getFrameSpan(sequence);
					if (frameSpan !== null) {
						flAgeScale = flAgeScale / frameSpan;
					}
				}
			}
			let coords = this.particleSystem.material.getTexCoords(0, particle.currentTime, flAgeScale, sequence);
			if (coords) {
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
				//uvs.push(0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0);
			} else {
				index+=8;
			}
		}
		this.geometry.attributes.get('aTextureCoord').dirty = true;
	}

	set maxParticles(maxParticles) {
		this.#maxParticles = maxParticles;
		this.#createParticlesArray();
		//this._initBuffers();
	}

	initRenderer(particleSystem) {
		this.geometry = new BeamBufferGeometry();
		this.mesh = new Mesh(this.geometry, particleSystem.material);
		this.mesh.serializable = false;
		this.mesh.hideInExplorer = true;
		this.mesh.setDefine('IS_ROPE');
		this.mesh.setDefine('USE_VERTEX_COLOR');
		this.#createParticlesTexture();
		this.mesh.setUniform('uParticles', this.texture);

		this.maxParticles = particleSystem.maxParticles;
		particleSystem.addChild(this.mesh);

		this.setOrientationType(this.getParameter('orientation_type'));//TODO: remove orientation_type : only for RenderAnimatedSprites
		particleSystem.material.renderFace(RenderFace.Both);
/*
		switch (orientation) {
			case 0: //always face camera
				particleSystem.material.setDefine('PARTICLE_ORIENTATION_SCREEN_ALIGNED');
				break;
			case 1: //rotate around z
				particleSystem.material.setDefine('SPRITE_ROTATE_AROUND_Z');
				break;
			case 2: //parallel to ground
				particleSystem.material.setDefine('PARTICLE_ORIENTATION_WORLD_Z_ALIGNED');
				//TODO
				break;
			case 3: //use normal
			default:
				//glCanvas.setUniform1f('uFaceCamera', -1.0);
				break;
		}*/
	}

	#createParticlesArray() {
		this.imgData = new Float32Array(this.#maxParticles * 4 * TEXTURE_WIDTH);
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

	#setupParticlesTexture(particleList, maxParticles) {
		const a = this.imgData;

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
			a[index++] = particle.color.r;
			a[index++] = particle.color.g;
			a[index++] = particle.color.b;
			a[index++] = particle.alpha;
			a[index++] = particle.radius;
			index++;
			a[index++] = particle.rotationRoll;
			a[index++] = particle.rotationYaw * DEG_TO_RAD;
			index++;
			index++;
			index++;
			index++;
			index+=16;
		}

		this.updateParticlesTexture();
	}

	dispose() {
		this.mesh?.dispose();
		this.texture.removeUser(this);
	}
}
SourceEngineParticleOperators.registerOperator(RenderRope);
