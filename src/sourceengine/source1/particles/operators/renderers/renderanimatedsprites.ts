import { quat, vec3 } from 'gl-matrix';

import { Graphics } from '../../../../../graphics/graphics';
import { Mesh } from '../../../../../objects/mesh';
import { BufferGeometry } from '../../../../../geometry/buffergeometry';
import { TextureManager } from '../../../../../textures/texturemanager';
import { Float32BufferAttribute, Uint32BufferAttribute } from '../../../../../geometry/bufferattribute';
import { Source1ParticleControler } from '../../source1particlecontroler';
import { SourceEngineParticleOperators } from '../../sourceengineparticleoperators';
import { SourceEngineParticleOperator } from '../operator';
import { PARAM_TYPE_BOOL, PARAM_TYPE_INT, PARAM_TYPE_FLOAT } from '../../constants';
import { DEG_TO_RAD } from '../../../../../math/constants';
import { ceilPowerOfTwo } from '../../../../../math/functions';
import { GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_TEXTURE_MIN_FILTER, GL_NEAREST, GL_FLOAT, GL_RGBA, GL_RGBA32F } from '../../../../../webgl/constants';
import { SEQUENCE_SAMPLE_COUNT } from '../../../loaders/sheet';
import { TEXTURE_WIDTH } from '../../../../common/particles/constants';
import { Texture } from '../../../../../textures/texture';

const tempQuat = quat.create()
const IDENTITY_QUAT = quat.create()
const vecDelta = vec3.create()

export class RenderAnimatedSprites extends SourceEngineParticleOperator {
	static functionName = 'render_animated_sprites';
	#orientationType;
	texture: Texture;
	geometry: BufferGeometry;
	#maxParticles;
	imgData;
	constructor() {
		super();
		this.addParam('animation rate', PARAM_TYPE_FLOAT, 0.1);
		this.addParam('animation_fit_lifetime', PARAM_TYPE_BOOL, 0);
		this.addParam('orientation_type', PARAM_TYPE_INT, 0);
		this.addParam('orientation control point', PARAM_TYPE_INT, -1);
		this.addParam('second sequence animation rate', PARAM_TYPE_FLOAT, 0);
		this.addParam('use animation rate as FPS', PARAM_TYPE_BOOL, 0);

		this.addParam('Visibility Proxy Input Control Point Number', PARAM_TYPE_INT, -1);
		this.addParam('Visibility Camera Depth Bias', PARAM_TYPE_FLOAT, 0);
	}
	/*
	doRender(particleList, elapsedTime, material) {
		for (let i = 0; i < particleList.length; ++i) {
			this.renderAnimatedSprites(particleList[i], elapsedTime, material);
		}
	}
		*/
	updateParticles(particleSystem, particleList) {//TODOv3
		const m_bFitCycleToLifetime = this.getParameter('animation_fit_lifetime');
		const rate = this.getParameter('animation rate');
		const useAnimRate = this.getParameter('use animation rate as FPS');
		this.geometry.count = particleList.length * 6;
		let maxParticles = this.#maxParticles;
		this.setupParticlesTexture(particleList, maxParticles);
		this.mesh.setUniform('uMaxParticles', maxParticles);//TODOv3:optimize
		this.mesh.setUniform('uVisibilityCameraDepthBias', this.getParameter('Visibility Camera Depth Bias'));//TODOv3:optimize
		this.mesh.visible = Source1ParticleControler.visible;

		let orientationControlPointNumber = this.getParameter('orientation control point');
		let orientationControlPoint = this.particleSystem.getControlPoint(orientationControlPointNumber);
		if (orientationControlPoint) {
			this.mesh.setUniform('uOrientationControlPoint', orientationControlPoint.getWorldQuaternion(tempQuat));
		} else {
			this.mesh.setUniform('uOrientationControlPoint', IDENTITY_QUAT);
		}

		const uvs = this.geometry.attributes.get('aTextureCoord')._array;
		let index = 0;
		for (let i = 0; i < particleList.length; i++) {
			let particle = particleList[i];
			const sequence = particle.sequence;
			let flAgeScale;
			if (m_bFitCycleToLifetime) {
				let flLifetime = particle.timeToLive;//SubFloat(pLifeDuration[ nGroup * ld_stride ], nOffset);
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
				let uMin = coords.m_fLeft_U0;
				let vMin = coords.m_fTop_V0;
				let uMax = coords.m_fRight_U0;
				let vMax = coords.m_fBottom_V0;
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
				index += 8;
			}
		}
		this.geometry.attributes.get('aTextureCoord').dirty = true;
	}

	set maxParticles(maxParticles) {
		this.#maxParticles = Graphics.isWebGL2 ? maxParticles : ceilPowerOfTwo(maxParticles);
		this.#createParticlesArray();
		this.#initBuffers();
	}
	#initBuffers() {
		let geometry = this.geometry;
		const vertices = [];
		const uvs = [];
		const indices = [];
		const id = [];

		for (let i = 0; i < this.#maxParticles; i++) {
			let indiceBase = i * 4;
			if (this.#orientationType == 2 || this.#orientationType == 3) {
				indices.push(indiceBase, indiceBase + 1, indiceBase + 2, indiceBase + 2, indiceBase + 1, indiceBase + 3);
			} else {
				indices.push(indiceBase, indiceBase + 2, indiceBase + 1, indiceBase + 2, indiceBase + 3, indiceBase + 1);
			}
			vertices.push(-1.0, 1.0, 0.0, 1.0, 1.0, 0.0, -1.0, -1.0, 0.0, 1.0, -1.0, 0.0);
			uvs.push(0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0);
			id.push(i, i, i, i);
		}
		geometry.count = indices.length;
		geometry.setIndex(new Uint32BufferAttribute(indices, 1));
		geometry.setAttribute('aVertexPosition', new Float32BufferAttribute(vertices, 3));
		geometry.setAttribute('aTextureCoord', new Float32BufferAttribute(uvs, 2));
		geometry.setAttribute('aParticleId', new Float32BufferAttribute(id, 1));
		this.mesh.setUniform('uMaxParticles', this.#maxParticles);//TODOv3:optimize
	}

	initRenderer(particleSystem) {
		this.geometry = new BufferGeometry();
		this.mesh = new Mesh(this.geometry, particleSystem.material);
		this.mesh.serializable = false;
		this.mesh.hideInExplorer = true;
		this.mesh.setDefine('HARDWARE_PARTICLES');
		this.#createParticlesTexture();
		this.mesh.setUniform('uParticles', this.texture);

		this.maxParticles = particleSystem.maxParticles;
		particleSystem.addChild(this.mesh);

		this.#orientationType = this.getParameter('orientation_type');
		this.setOrientationType(this.#orientationType);
		this.#initBuffers();
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

	setupParticlesTexture(particleList, maxParticles) {
		const a = this.imgData;

		let index = 0;
		for (let particle of particleList) {//TODOv3

			vec3.subtract(vecDelta, particle.prevPosition, particle.position);
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
			a[index++] = particle.alpha * particle.alpha2;
			a[index++] = particle.radius;
			index++;
			a[index++] = particle.rotationRoll;
			a[index++] = particle.rotationYaw * DEG_TO_RAD;
			// Vec delta
			a[index++] = vecDelta[0];
			a[index++] = vecDelta[1];
			a[index++] = vecDelta[2];
			index++;
			// normal
			index += 4;
			// renderScreenVelocityRotate
			a[index++] = particle.renderScreenVelocityRotate ? 1 : 0;
			a[index++] = particle.m_flRotateRate;
			a[index++] = particle.m_flForward;
			index++;
			// free for now
			index += 8;
		}

		this.updateParticlesTexture();
	}

	dispose() {
		this.mesh?.dispose();
		this.texture.removeUser(this);
	}
}
SourceEngineParticleOperators.registerOperator(RenderAnimatedSprites);
