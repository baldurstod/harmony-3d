import { vec2 } from 'gl-matrix';

import { Graphics } from '../../../../../graphics/graphics';
import { RenderFace } from '../../../../../materials/constants';
import { DEG_TO_RAD } from '../../../../../math/constants';
import { Mesh } from '../../../../../objects/mesh';
import { BeamBufferGeometry, BeamSegment } from '../../../../../primitives/geometries/beambuffergeometry';
import { Texture } from '../../../../../textures/texture';
import { TextureManager } from '../../../../../textures/texturemanager';
import { GL_FLOAT, GL_NEAREST, GL_RGBA, GL_RGBA32F, GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_TEXTURE_MIN_FILTER, } from '../../../../../webgl/constants';
import { TEXTURE_WIDTH } from '../../../../common/particles/constants';
import { PARAM_TYPE_FLOAT, PARAM_TYPE_INT } from '../../constants';
import { Source1Particle } from '../../particle';
import { Source1ParticleOperators } from '../../source1particleoperators';
import { Source1ParticleSystem } from '../../source1particlesystem';
import { Source1ParticleOperator } from '../operator';

const tempVec2 = vec2.create();

export class RenderRope extends Source1ParticleOperator {
	static functionName = 'render rope';
	#maxParticles = 0;
	texture?: Texture;
	geometry?: BeamBufferGeometry;
	imgData?: Float32Array;

	constructor(system: Source1ParticleSystem) {
		super(system);
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
	updateParticles(particleSystem: Source1ParticleSystem, particleList: Source1Particle[], elapsedTime: number) {
		if (!this.geometry || !this.mesh || !this.particleSystem.material) {
			return;
		}
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
			const particle: Source1Particle = particleList[i]!;
			const segment = new BeamSegment(particle.position, [particle.color.r, particle.color.g, particle.color.b, particle.alpha], 0.0, particle.radius);
			if (previousSegment) {
				ropeLength += segment.distanceTo(previousSegment);
			}
			segment.texCoordY = (ropeLength + flTexOffset) * m_flTextureScale;
			segments.push(segment);
			previousSegment = segment;
		}
		geometry.segments = segments;
	}

	set maxParticles(maxParticles: number) {
		this.#maxParticles = maxParticles;
		this.#createParticlesArray();
		//this._initBuffers();
	}

	initRenderer() {
		this.geometry = new BeamBufferGeometry();
		this.mesh = new Mesh({ geometry: this.geometry, material: this.particleSystem.material });
		this.mesh.serializable = false;
		this.mesh.hideInExplorer = true;
		this.mesh.setDefine('IS_ROPE');
		this.mesh.setDefine('USE_VERTEX_COLOR');
		this.#createParticlesTexture();
		this.mesh.setUniform('uParticles', this.texture!);

		this.maxParticles = this.particleSystem.maxParticles;
		this.particleSystem.addChild(this.mesh);

		this.setOrientationType(this.getParameter('orientation_type'));//TODO: remove orientation_type : only for RenderAnimatedSprites
		this.particleSystem.material!.renderFace(RenderFace.Both);
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

	#updateParticlesTexture() {// TODO: create a renderoperator class and put this method in it
		const gl = new Graphics().glContext;

		gl.bindTexture(GL_TEXTURE_2D, this.texture!.texture);
		if (new Graphics().isWebGL2) {
			gl.texImage2D(GL_TEXTURE_2D, 0, GL_RGBA32F, TEXTURE_WIDTH, this.#maxParticles, 0, GL_RGBA, GL_FLOAT, this.imgData!);
		} else {
			gl.texImage2D(GL_TEXTURE_2D, 0, GL_RGBA, TEXTURE_WIDTH, this.#maxParticles, 0, GL_RGBA, GL_FLOAT, this.imgData!);
		}
		gl.bindTexture(GL_TEXTURE_2D, null);
	}

	#setupParticlesTexture(particleList: Source1Particle[]) {
		const a = this.imgData!;

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
			index += 16;
		}

		this.#updateParticlesTexture();
	}

	dispose() {
		this.mesh?.dispose();
		this.texture?.removeUser(this);
	}
}
Source1ParticleOperators.registerOperator(RenderRope);
