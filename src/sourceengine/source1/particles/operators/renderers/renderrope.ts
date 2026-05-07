import { ReadonlyVec3, vec2, vec3 } from 'gl-matrix';
import { Graphics } from '../../../../../graphics/graphics2';
import { RenderFace } from '../../../../../materials/constants';
import { Mesh } from '../../../../../objects/mesh';
import { BeamBufferGeometry, BeamSegment } from '../../../../../primitives/geometries/beambuffergeometry';
import { Scene } from '../../../../../scenes/scene';
import { Texture } from '../../../../../textures/texture';
import { TextureManager } from '../../../../../textures/texturemanager';
import { GL_NEAREST, GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_TEXTURE_MIN_FILTER } from '../../../../../webgl/constants';
import { MAX_PARTICLES_IN_A_SYSTEM, TEXTURE_WIDTH } from '../../../../common/particles/constants';
import { PARAM_TYPE_FLOAT, PARAM_TYPE_INT } from '../../constants';
import { Source1Particle } from '../../particle';
import { Source1ParticleOperators } from '../../source1particleoperators';
import { Source1ParticleSystem } from '../../source1particlesystem';
import { Source1ParticleOperator } from '../operator';

const tempVec2 = vec2.create();
const tempVec3 = vec3.create();

export class RenderRope extends Source1ParticleOperator {
	static functionName = 'render rope';
	#maxParticles = 0;
	#texture?: Texture;
	#geometry = new BeamBufferGeometry();
	mesh = new Mesh({ geometry: this.#geometry });
	#imgData?: Float32Array;

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
	updateParticles(particleSystem: Source1ParticleSystem, particleList: Source1Particle[]/*, elapsedTime: number*/): void {
		if (!this.particleSystem.material) {
			return;
		}

		const l = particleList.length;
		if (l < 2) {
			// Can't make a rope
			return;
		}

		// TODO: use param subdivision_count
		const subdivCount = this.getParameter('subdivision_count');
		const m_flTexelSizeInUnits = this.getParameter('texel_size');
		const m_flTextureScrollRate = this.getParameter('texture_scroll_rate');
		const m_flTextureScale = 1.0 / (this.particleSystem.material.getColorMapSize(tempVec2)[1] * m_flTexelSizeInUnits);
		const flTexOffset = m_flTextureScrollRate * particleSystem.currentTime;

		const geometry = this.#geometry;
		//const vertices = [];
		//const indices = [];
		//const id = [];

		const segments = [];

		//let particle;
		let ropeLength = 0.0;
		let previousSegment: BeamSegment | null = null;
		let previousParticle: Source1Particle | null = null;
		const deltaPos = vec3.create();

		let p1: vec3;// = vec3.create();
		let p2: vec3;// = vec3.create();
		let p3: vec3;// = vec3.create();
		let p4: vec3;// = vec3.create();
		const segmentPosition = vec3.create();

		const l1 = l - 1;

		for (let i = 0; i < l - 1; i++) {
			const particle: Source1Particle = particleList[i]!;
			const nextParticle: Source1Particle = particleList[i + 1]!;
			const previousParticle: Source1Particle = particleList[i - 1] ?? particle;
			const nextNextParticle: Source1Particle = particleList[i + 2] ?? nextParticle;

			p1 = previousParticle.position;
			p2 = particle.position;
			p3 = nextParticle.position;
			p4 = nextNextParticle.position;

			for (let i = 0; i < subdivCount; i++) {
				const j = i / subdivCount;
				catmullRomSpline(p1, p2, p3, p4, j, segmentPosition);
				const radius = previousParticle.radius + (particle.radius - previousParticle.radius) * j;
				const alpha = previousParticle.alpha + (particle.alpha - previousParticle.alpha) * j;
				const colorR = previousParticle.color.r + (particle.color.r - previousParticle.color.r) * j;
				const colorG = previousParticle.color.g + (particle.color.g - previousParticle.color.g) * j;
				const colorB = previousParticle.color.b + (particle.color.b - previousParticle.color.b) * j;
				const segment = new BeamSegment(segmentPosition, [colorR, colorG, colorB, alpha], 0.0, radius);
				if (previousSegment) {
					ropeLength += segment.distanceTo(previousSegment);
				}

				segment.texCoordY = (ropeLength + flTexOffset) * m_flTextureScale;
				segments.push(segment);
				previousSegment = segment;

			}
		}

		const camera = (particleSystem.root as Scene).activeCamera;
		if (camera) {
			geometry.setSegments(segments, camera);
		}
	}

	set maxParticles(maxParticles: number) {
		this.#maxParticles = maxParticles;
		this.#createParticlesArray();
		//this._initBuffers();
	}

	initRenderer(): void {
		if (this.particleSystem.material) {
			this.mesh.setMaterial(this.particleSystem.material);
		}
		this.mesh.serializable = false;
		this.mesh.hideInExplorer = true;
		this.mesh.setDefine('IS_ROPE');
		this.mesh.setDefine('USE_VERTEX_COLOR');
		if (Graphics.isWebGLAny) {
			this.#createParticlesTexture();
		}
		this.mesh.setUniformValue('uParticles', this.#texture);

		this.maxParticles = this.particleSystem.maxParticles;
		this.particleSystem.addChild(this.mesh);

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

	#createParticlesArray(): void {
		this.#imgData = new Float32Array(this.#maxParticles * 4 * TEXTURE_WIDTH);
		this.mesh.setStorage('particles', this.#imgData);
	}

	#createParticlesTexture(): void {
		this.#texture = TextureManager.createTexture({// TODO: allocate dynamically after changing max particles
			webgpuDescriptor: {
				size: {
					width: TEXTURE_WIDTH,
					height: MAX_PARTICLES_IN_A_SYSTEM,
				},
				format: 'rgba8unorm',
				usage: GPUTextureUsage.TEXTURE_BINDING,
			}
		});
		this.#texture.addUser(this);
		const gl = Graphics.glContext;//TODO
		gl.bindTexture(GL_TEXTURE_2D, this.#texture.texture);
		gl.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
		gl.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
		gl.bindTexture(GL_TEXTURE_2D, null);
	}

	dispose(): void {
		this.mesh?.dispose();
		this.#texture?.removeUser(this);
	}
}
Source1ParticleOperators.registerOperator(RenderRope);


const a = vec3.create();
const b = vec3.create();
const c = vec3.create();
const d = vec3.create();

function catmullRomSpline(
	p1: ReadonlyVec3,
	p2: ReadonlyVec3,
	p3: ReadonlyVec3,
	p4: ReadonlyVec3,
	t: number,
	output: vec3
): void {
	const tSqr = t * t * 0.5;
	const tSqrSqr = t * tSqr;
	t *= 0.5;

	vec3.zero(output);

	// matrix row 1
	vec3.scale(a, p1, -tSqrSqr);		// 0.5 t^3 * [ (-1*p1) + ( 3*p2) + (-3*p3) + p4 ]
	vec3.scale(b, p2, tSqrSqr * 3);
	vec3.scale(c, p3, tSqrSqr * -3);
	vec3.scale(d, p4, tSqrSqr);

	vec3.add(output, a, output);
	vec3.add(output, b, output);
	vec3.add(output, c, output);
	vec3.add(output, d, output);

	// matrix row 2
	vec3.scale(a, p1, tSqr * 2);		// 0.5 t^2 * [ ( 2*p1) + (-5*p2) + ( 4*p3) - p4 ]
	vec3.scale(b, p2, tSqr * -5);
	vec3.scale(c, p3, tSqr * 4);
	vec3.scale(d, p4, -tSqr);

	vec3.add(output, a, output);
	vec3.add(output, b, output);
	vec3.add(output, c, output);
	vec3.add(output, d, output);

	// matrix row 3
	vec3.scale(a, p1, -t);			// 0.5 t * [ (-1*p1) + p3 ]
	vec3.scale(b, p3, t);

	vec3.add(output, a, output);
	vec3.add(output, b, output);

	// matrix row 4
	vec3.add(output, p2, output);	// p2
}
