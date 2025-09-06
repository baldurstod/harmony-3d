import { vec3, vec4 } from 'gl-matrix';
import { Camera, CameraProjection } from '../cameras/camera';
import { Renderer } from '../renderers/renderer';
import { RenderTarget } from './rendertarget';
import { Material } from '../materials/material';
import { MeshBasicMaterial } from '../materials/meshbasicmaterial';
import { BufferGeometry } from '../geometry/buffergeometry';
import { Graphics } from '../graphics/graphics';
import { Scene } from '../scenes/scene';
import { Mesh } from '../objects/mesh';
import { Box } from '../primitives/box';
import { BufferAttribute, Uint16BufferAttribute } from '../geometry/bufferattribute';
import { ShaderMaterial } from '../materials/shadermaterial';
import { Texture } from './texture';
import { CubeTexture } from './cubetexture';
import { AnyTexture } from '../types';
import { TextureMapping, ToneMapping } from './constants';

const LOD_MIN = 4;

// The standard deviations (radians) associated with the extra mips. These are
// chosen to approximate a Trowbridge-Reitz distribution function times the
// geometric shadowing function. These sigma values squared must match the
// variance #defines in cube_uv_reflection_fragment.glsl.js.
const EXTRA_LOD_SIGMA = [0.125, 0.215, 0.35, 0.446, 0.526, 0.582];

// The maximum length of the blur for loop. Smaller sigmas will use fewer
// samples and exit early, but not recompile the shader.
const MAX_SAMPLES = 20;

const flatCamera = new Camera({ projection: CameraProjection.Orthographic, position: vec3.fromValues(0, 0, 1) });
const clearColor = vec4.create();
const _oldTarget = null;
const _oldActiveCubeFace = 0;
const _oldActiveMipmapLevel = 0;

// Golden Ratio
const PHI = (1 + Math.sqrt(5)) / 2;
const INV_PHI = 1 / PHI;

// Vertices of a dodecahedron (except the opposites, which represent the
// same axis), used as axis directions evenly spread on a sphere.
const axisDirections = [
	vec3.fromValues(1, 1, 1),
	vec3.fromValues(- 1, 1, 1),
	vec3.fromValues(1, 1, - 1),
	vec3.fromValues(- 1, 1, - 1),
	vec3.fromValues(0, PHI, INV_PHI),
	vec3.fromValues(0, PHI, - INV_PHI),
	vec3.fromValues(INV_PHI, 0, PHI),
	vec3.fromValues(- INV_PHI, 0, PHI),
	vec3.fromValues(PHI, INV_PHI, 0),
	vec3.fromValues(- PHI, INV_PHI, 0)
];

// Radiance Environment Map generator
export class RemGenerator {
	#renderer: Renderer;
	#pingPongRenderTarget?: RenderTarget;
	#blurMaterial?: Material;
	#cubemapMaterial?: Material;
	#equirectMaterial?: Material;
	#lodMax = 0;
	#cubeSize = 0;
	#lodPlanes: BufferGeometry[] = [];
	#sizeLods: number[] = [];
	#sigmas: number[] = [];

	constructor(renderer: Renderer) {
		this.#renderer = renderer;
	}
	/*
	constructor(renderer) {

		this.#renderer = renderer;
		this.#pingPongRenderTarget = null;

		this.#lodMax = 0;
		this.#cubeSize = 0;
		this.#lodPlanes = [];
		this.#sizeLods = [];
		this.#sigmas = [];

		this.#blurMaterial = null;
		this.#cubemapMaterial = null;
		this.#equirectMaterial = null;

		this.#compileMaterial(this.#blurMaterial);
	}
		*/

	fromScene(scene: Scene, sigma = 0, near = 0.1, far = 100) {
		/*
				_oldTarget = this.#renderer.getRenderTarget();
				_oldActiveCubeFace = this.#renderer.getActiveCubeFace();
				_oldActiveMipmapLevel = this.#renderer.getActiveMipmapLevel();
				*/

		this.#setSize(256);
		const size = 256;

		const cubeUVRenderTarget = this.#allocateTargets();
		cubeUVRenderTarget.setDepthBuffer(true);

		this.#sceneToCubeUV(scene, near, far, cubeUVRenderTarget);

		if (sigma > 0) {

			this.#blur(cubeUVRenderTarget, 0, 0, sigma);

		}

		this.#applyPMREM(cubeUVRenderTarget);
		this.#cleanup(cubeUVRenderTarget);

		return cubeUVRenderTarget;

	}

	/**
	 * Generates a PMREM from an equirectangular texture, which can be either LDR
	 * or HDR. The ideal input image size is 1k (1024 x 512),
	 * as this matches best with the 256 x 256 cubemap output.
	 */
	fromEquirectangular(equirectangular: Texture, renderTarget?: RenderTarget) {
		if (!this.#equirectMaterial) {
			this.#equirectMaterial = getEquirectMaterial();
		}

		return this.#fromTexture(equirectangular, renderTarget);
	}

	/**
	 * Generates a PMREM from an cubemap texture, which can be either LDR
	 * or HDR. The ideal input cube size is 256 x 256,
	 * as this matches best with the 256 x 256 cubemap output.
	 */
	fromCubemap(cubemap: CubeTexture, renderTarget?: RenderTarget) {
		if (!this.#cubemapMaterial) {
			this.#cubemapMaterial = getCubemapMaterial();
		}

		return this.#fromTexture(cubemap, renderTarget);
	}

	/**
	 * Pre-compiles the cubemap shader. You can get faster start-up by invoking this method during
	 * your texture's network fetch for increased concurrency.
	 */
	compileCubemapShader() {

		if (this.#cubemapMaterial === null) {

			this.#cubemapMaterial = getCubemapMaterial();
			this.#compileMaterial(this.#cubemapMaterial);

		}

	}

	/**
	 * Pre-compiles the equirectangular shader. You can get faster start-up by invoking this method during
	 * your texture's network fetch for increased concurrency.
	 */
	compileEquirectangularShader() {

		if (this.#equirectMaterial === null) {

			this.#equirectMaterial = getEquirectMaterial();
			this.#compileMaterial(this.#equirectMaterial);

		}

	}

	/**
	 * Disposes of the PMREMGenerator's internal memory. Note that PMREMGenerator is a static class,
	 * so you should not need more than one PMREMGenerator object. If you do, calling dispose() on
	 * one of them will cause any others to also become unusable.
	 */
	dispose() {
		this.#dispose();
		this.#cubemapMaterial?.dispose();
		this.#equirectMaterial?.dispose();
	}

	// private interface

	#setSize(cubeSize: number) {
		this.#lodMax = Math.floor(Math.log2(cubeSize));
		this.#cubeSize = Math.pow(2, this.#lodMax);
	}


	#dispose() {
		if (this.#blurMaterial) {
			this.#blurMaterial.removeUser(this);
		}

		if (this.#pingPongRenderTarget) {
			this.#pingPongRenderTarget.dispose();
		}

		for (const lodPlane of this.#lodPlanes) {
			lodPlane.dispose();
		}
		this.#lodPlanes = [];
	}

	#cleanup(outputTarget: RenderTarget) {

		//this.#renderer.setRenderTarget(_oldTarget, _oldActiveCubeFace, _oldActiveMipmapLevel);
		//Graphics.pushRenderTarget();
		outputTarget.setScissorTest(false);
		//outputTarget.setViewport(0, 0, outputTarget.width, outputTarget.height);

	}

	#fromTexture(texture: AnyTexture, renderTarget?: RenderTarget) {
		let size: number;
		if (texture.is('CubeTexture')) {
			size = texture.getWidth();
			this.#setSize(size);
		} else {
			size = texture.getWidth() * 0.25;
			this.#setSize(size);
		}
		/*
				_oldTarget = this.#renderer.getRenderTarget();
				_oldActiveCubeFace = this.#renderer.getActiveCubeFace();
				_oldActiveMipmapLevel = this.#renderer.getActiveMipmapLevel();

				*/
		const cubeUVRenderTarget = renderTarget || this.#allocateTargets();
		this.#textureToCubeUV(texture, cubeUVRenderTarget);
		this.#applyPMREM(cubeUVRenderTarget);
		this.#cleanup(cubeUVRenderTarget);

		return cubeUVRenderTarget;

	}

	#allocateTargets() {

		const width = 3 * Math.max(this.#cubeSize, 16 * 7);
		const height = 4 * this.#cubeSize;

		const params = {
			//TODO
			/*
			magFilter: LinearFilter,
			minFilter: LinearFilter,
			generateMipmaps: false,
			type: HalfFloatType,
			format: RGBAFormat,
			colorSpace: LinearSRGBColorSpace,
			depthBuffer: false
			*/
			width: width,
			height: height,
		};

		const cubeUVRenderTarget = createRenderTarget(params);

		if (!this.#pingPongRenderTarget || this.#pingPongRenderTarget.getWidth() !== width || this.#pingPongRenderTarget.getHeight() !== height) {
			if (this.#pingPongRenderTarget) {
				this.#dispose();
			}

			this.#pingPongRenderTarget = createRenderTarget(params);

			({ sizeLods: this.#sizeLods, lodPlanes: this.#lodPlanes, sigmas: this.#sigmas } = createPlanes(this.#lodMax));

			this.#blurMaterial = getBlurShader(this.#lodMax, width, height);
			this.#blurMaterial.addUser(this);

		}

		return cubeUVRenderTarget;

	}

	#compileMaterial(material: Material) {
		const tmpMesh = new Mesh({ geometry: this.#lodPlanes[0], material: material });
		//this.#renderer.compile(tmpMesh, flatCamera);

	}

	#sceneToCubeUV(scene: Scene, near: number, far: number, cubeUVRenderTarget: RenderTarget) {

		const fov = 90;
		const aspect = 1;
		const cubeCamera = new Camera({ projection: CameraProjection.Perspective, verticalFov: fov, aspectRatio: aspect, nearPlane: near, farPlane: far });
		const upSign = [1, - 1, 1, 1, 1, 1];
		const forwardSign = [1, 1, 1, - 1, - 1, - 1];
		const renderer = this.#renderer;

		const originalAutoClear = Graphics.autoClear;
		const toneMapping = renderer.getToneMapping();
		Graphics.getClearColor(clearColor);

		renderer.setToneMapping(ToneMapping.None);
		Graphics.autoClear = false;

		const backgroundMaterial = new MeshBasicMaterial({
			name: 'PMREM.Background',
			//side: BackSide,
			depthWrite: false,
			depthTest: false,
		});
		const scene2 = new Scene();
		const backgroundBox = new Box({ material: backgroundMaterial, parent: scene2 });

		const useSolidColor = false;
		const background = scene.background;
		/*
				if (background) {

					if (background.isColor) {

						//backgroundMaterial.color.copy(background);
						vec4.copy(backgroundMaterial.color, background);
						scene.background = undefined;
						useSolidColor = true;

					}

				} else {

					//backgroundMaterial.color.copy(_clearColor);
					vec4.copy(backgroundMaterial.color, clearColor);
					useSolidColor = true;

				}*/

		for (let i = 0; i < 6; i++) {

			const col = i % 3;

			if (col === 0) {

				cubeCamera.upVector = vec3.fromValues(0, upSign[i]!, 0);//cubeCamera.up.set(0, upSign[i], 0);
				cubeCamera.lookAt(vec3.fromValues(forwardSign[i]!, 0, 0));

			} else if (col === 1) {

				cubeCamera.upVector = vec3.fromValues(0, 0, upSign[i]!);//cubeCamera.up.set(0, 0, upSign[i]);
				cubeCamera.lookAt(vec3.fromValues(0, forwardSign[i]!, 0));

			} else {

				cubeCamera.upVector = vec3.fromValues(0, upSign[i]!, 0);//cubeCamera.up.set(0, upSign[i], 0);
				cubeCamera.lookAt(vec3.fromValues(0, 0, forwardSign[i]!));
			}

			const size = this.#cubeSize;

			cubeUVRenderTarget.setViewport(col * size, i > 2 ? size : 0, size, size);

			Graphics.pushRenderTarget(cubeUVRenderTarget);
			if (useSolidColor) {
				renderer.render(scene2, cubeCamera, 0, { DisableToolRendering: true });
			}
			renderer.render(scene, cubeCamera, 0, { DisableToolRendering: true });
			Graphics.popRenderTarget();
		}

		backgroundBox.dispose();

		//renderer.toneMapping = toneMapping;
		renderer.setToneMapping(toneMapping);
		Graphics.autoClear = originalAutoClear;
		scene.background = background;

	}

	#textureToCubeUV(texture: Texture, cubeUVRenderTarget: RenderTarget) {

		const renderer = this.#renderer;


		const isCubeTexture = texture.is('CubeTexture')//(texture.mapping === CubeReflectionMapping || texture.mapping === CubeRefractionMapping);

		let material: Material;
		if (isCubeTexture) {
			if (!this.#cubemapMaterial) {
				this.#cubemapMaterial = getCubemapMaterial();
			}
			this.#cubemapMaterial.uniforms.flipEnvMap = (texture.isRenderTargetTexture === false) ? - 1 : 1;
			material = this.#cubemapMaterial;
		} else {
			if (!this.#equirectMaterial) {
				this.#equirectMaterial = getEquirectMaterial();
			}
			material = this.#equirectMaterial;
		}

		const mesh = new Mesh({ geometry: this.#lodPlanes[0], material: material });
		const scene = new Scene();
		scene.addChild(mesh);

		const uniforms = material.uniforms;

		uniforms['envMap'] = texture;

		const size = this.#cubeSize;

		cubeUVRenderTarget.setViewport(0, 0, 3 * size, 2 * size);

		Graphics.pushRenderTarget(cubeUVRenderTarget);
		renderer.render(scene, flatCamera, 0, { DisableToolRendering: true });
		Graphics.popRenderTarget();

	}

	#applyPMREM(cubeUVRenderTarget: RenderTarget) {

		const renderer = this.#renderer;
		const autoClear = Graphics.autoClear;
		Graphics.autoClear = false;

		for (let i = 1; i < this.#lodPlanes.length; i++) {

			const sigma = Math.sqrt(this.#sigmas[i]! * this.#sigmas[i]! - this.#sigmas[i - 1]! * this.#sigmas[i - 1]!);

			const poleAxis = axisDirections[(i - 1) % axisDirections.length];

			this.#blur(cubeUVRenderTarget, i - 1, i, sigma, poleAxis);

		}

		Graphics.autoClear = autoClear;

	}

	/**
	 * This is a two-pass Gaussian blur for a cubemap. Normally this is done
	 * vertically and horizontally, but this breaks down on a cube. Here we apply
	 * the blur latitudinally (around the poles), and then longitudinally (towards
	 * the poles) to approximate the orthogonally-separable blur. It is least
	 * accurate at the poles, but still does a decent job.
	 */
	#blur(cubeUVRenderTarget: RenderTarget, lodIn: number, lodOut: number, sigma: number, poleAxis?: vec3) {
		if (!this.#pingPongRenderTarget) {
			return;
		}

		this.#halfBlur(
			cubeUVRenderTarget,
			this.#pingPongRenderTarget,
			lodIn,
			lodOut,
			sigma,
			'latitudinal',
			poleAxis);

		this.#halfBlur(
			this.#pingPongRenderTarget,
			cubeUVRenderTarget,
			lodOut,
			lodOut,
			sigma,
			'longitudinal',
			poleAxis);

	}

	#halfBlur(targetIn: RenderTarget, targetOut: RenderTarget, lodIn: number, lodOut: number, sigmaRadians: number, direction: string, poleAxis?: vec3) {
		const renderer = this.#renderer;
		if (!this.#blurMaterial) {
			return;
		}

		if (direction !== 'latitudinal' && direction !== 'longitudinal') {

			console.error(
				'blur direction must be either latitudinal or longitudinal!');

		}

		// Number of standard deviations at which to cut off the discrete approximation.
		const STANDARD_DEVIATIONS = 3;

		const blurMesh = new Mesh({ geometry: this.#lodPlanes[lodOut], material: this.#blurMaterial });
		const blurUniforms = this.#blurMaterial.uniforms;
		const scene = new Scene();
		scene.addChild(blurMesh);

		const pixels = this.#sizeLods[lodIn]! - 1;
		const radiansPerPixel = isFinite(sigmaRadians) ? Math.PI / (2 * pixels) : 2 * Math.PI / (2 * MAX_SAMPLES - 1);
		const sigmaPixels = sigmaRadians / radiansPerPixel;
		const samples = isFinite(sigmaRadians) ? 1 + Math.floor(STANDARD_DEVIATIONS * sigmaPixels) : MAX_SAMPLES;

		if (samples > MAX_SAMPLES) {

			console.warn(`sigmaRadians, ${sigmaRadians}, is too large and will clip, as it requested ${samples} samples when the maximum is set to ${MAX_SAMPLES}`);

		}

		const weights: number[] = [];
		let sum = 0;

		for (let i = 0; i < MAX_SAMPLES; ++i) {

			const x = i / sigmaPixels;
			const weight = Math.exp(- x * x / 2);
			weights.push(weight);

			if (i === 0) {

				sum += weight;

			} else if (i < samples) {

				sum += 2 * weight;

			}

		}

		for (let i = 0; i < weights.length; i++) {

			weights[i] = weights[i]! / sum;

		}

		blurUniforms['envMap'] = targetIn.getTexture();
		blurUniforms['samples'] = samples;
		blurUniforms['weights[0]'] = weights;
		blurUniforms['latitudinal'] = direction === 'latitudinal';

		if (poleAxis) {

			blurUniforms['poleAxis'] = poleAxis;

		}

		blurUniforms['dTheta'] = radiansPerPixel;
		blurUniforms['mipInt'] = this.#lodMax - lodIn;

		const outputSize = this.#sizeLods[lodOut]!;
		const x = 3 * outputSize * (lodOut > this.#lodMax - LOD_MIN ? lodOut - this.#lodMax + LOD_MIN : 0);
		const y = 4 * (this.#cubeSize - outputSize);

		targetOut.setViewport(x, y, 3 * outputSize, 2 * outputSize);
		Graphics.pushRenderTarget(targetOut);
		renderer.render(scene, flatCamera, 0, { DisableToolRendering: true });
		Graphics.popRenderTarget();

	}

}



function createPlanes(lodMax: number) {

	const lodPlanes: BufferGeometry[] = [];
	const sizeLods: number[] = [];
	const sigmas: number[] = [];

	let lod = lodMax;

	const totalLods = lodMax - LOD_MIN + 1 + EXTRA_LOD_SIGMA.length;

	for (let i = 0; i < totalLods; i++) {

		const sizeLod = Math.pow(2, lod);
		sizeLods.push(sizeLod);
		let sigma = 1.0 / sizeLod;

		if (i > lodMax - LOD_MIN) {

			sigma = EXTRA_LOD_SIGMA[i - lodMax + LOD_MIN - 1]!;

		} else if (i === 0) {

			sigma = 0;

		}

		sigmas.push(sigma);

		const texelSize = 1.0 / (sizeLod - 2);
		const min = - texelSize;
		const max = 1 + texelSize;
		const uv1 = [min, min, max, min, max, max, min, min, max, max, min, max];

		const cubeFaces = 6;
		const vertices = 6;
		const positionSize = 3;
		const uvSize = 2;
		const faceIndexSize = 1;


		const indices: number[] = [];
		const position = new Float32Array(positionSize * vertices * cubeFaces);
		const uv = new Float32Array(uvSize * vertices * cubeFaces);
		const faceIndex = new Float32Array(faceIndexSize * vertices * cubeFaces);

		let index = 0;
		for (let face = 0; face < cubeFaces; face++) {

			const x = (face % 3) * 2 / 3 - 1;
			const y = face > 2 ? 0 : - 1;
			const coordinates = [
				x, y, 0,
				x + 2 / 3, y, 0,
				x + 2 / 3, y + 1, 0,
				x, y, 0,
				x + 2 / 3, y + 1, 0,
				x, y + 1, 0
			];
			indices.push(index++);
			indices.push(index++);
			indices.push(index++);
			indices.push(index++);
			indices.push(index++);
			indices.push(index++);
			position.set(coordinates, positionSize * vertices * face);
			uv.set(uv1, uvSize * vertices * face);
			const fill = [face, face, face, face, face, face];
			faceIndex.set(fill, faceIndexSize * vertices * face);

		}

		const planes = new BufferGeometry();
		planes.setIndex(new Uint16BufferAttribute(indices, 1));
		planes.setAttribute('aVertexPosition', new BufferAttribute(position, positionSize));
		planes.setAttribute('aTextureCoord', new BufferAttribute(uv, uvSize));
		planes.setAttribute('faceIndex', new BufferAttribute(faceIndex, faceIndexSize));
		planes.count = indices.length;
		lodPlanes.push(planes);

		if (lod > LOD_MIN) {

			lod--;

		}

	}

	return { lodPlanes, sizeLods, sigmas };

}

function createRenderTarget(params: any) {
	const cubeUVRenderTarget = new RenderTarget(params);
	const renderTargetTexture = cubeUVRenderTarget.getTexture();
	renderTargetTexture.mapping = TextureMapping.CubeUvMapping;
	//cubeUVRenderTarget.texture.mapping = CubeUVReflectionMapping;
	//cubeUVRenderTarget.getTexture().name = 'PMREM.cubeUv';
	cubeUVRenderTarget.setScissorTest(true);
	return cubeUVRenderTarget;

}

function getBlurShader(lodMax: number, width: number, height: number) {

	const weights = new Float32Array(MAX_SAMPLES);
	const poleAxis = vec3.fromValues(0, 1, 0);
	const shaderMaterial = new ShaderMaterial({

		name: 'SphericalGaussianBlur',

		defines: {
			'n': MAX_SAMPLES,
			'CUBEUV_TEXEL_WIDTH': 1.0 / width,
			'CUBEUV_TEXEL_HEIGHT': 1.0 / height,
			'CUBEUV_MAX_MIP': `${lodMax}.0`,
		},

		uniforms: {
			'envMap': null,
			'samples': 1,
			'weights[0]': weights,
			'latitudinal': false,
			'dTheta': 0,
			'mipInt': 0,
			'poleAxis': poleAxis
		},

		vertex: getCommonVertexShader(),

		fragment: /* glsl */`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			//#include <cube_uv_reflection_fragment>

	float getFace( vec3 direction ) {

		vec3 absDirection = abs( direction );

		float face = - 1.0;

		if ( absDirection.x > absDirection.z ) {

			if ( absDirection.x > absDirection.y )

				face = direction.x > 0.0 ? 0.0 : 3.0;

			else

				face = direction.y > 0.0 ? 1.0 : 4.0;

		} else {

			if ( absDirection.z > absDirection.y )

				face = direction.z > 0.0 ? 2.0 : 5.0;

			else

				face = direction.y > 0.0 ? 1.0 : 4.0;

		}

		return face;

	}

	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	// RH coordinate system; PMREM face-indexing convention
	vec2 getUV( vec3 direction, float face ) {

		vec2 uv;

		if ( face == 0.0 ) {

			uv = vec2( direction.z, direction.y ) / abs( direction.x ); // pos x

		} else if ( face == 1.0 ) {

			uv = vec2( - direction.x, - direction.z ) / abs( direction.y ); // pos y

		} else if ( face == 2.0 ) {

			uv = vec2( - direction.x, direction.y ) / abs( direction.z ); // pos z

		} else if ( face == 3.0 ) {

			uv = vec2( - direction.z, direction.y ) / abs( direction.x ); // neg x

		} else if ( face == 4.0 ) {

			uv = vec2( - direction.x, direction.z ) / abs( direction.y ); // neg y

		} else {

			uv = vec2( direction.x, direction.y ) / abs( direction.z ); // neg z

		}

		return 0.5 * ( uv + 1.0 );

	}


			vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {

			float face = getFace( direction );

			float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );

			mipInt = max( mipInt, cubeUV_minMipLevel );

			float faceSize = exp2( mipInt );

			highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0; // #25071

			if ( face > 2.0 ) {

				uv.y += faceSize;

				face -= 3.0;

			}

			uv.x += face * faceSize;

			uv.x += filterInt * 3.0 * cubeUV_minTileSize;

			uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );

			uv.x *= CUBEUV_TEXEL_WIDTH;
			uv.y *= CUBEUV_TEXEL_HEIGHT;

			#ifdef texture2DGradEXT

				return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb; // disable anisotropic filtering

			#else

				return texture2D( envMap, uv ).rgb;

			#endif

		}

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,

		//blending: NoBlending,
		depthTest: false,
		depthWrite: false

	});

	return shaderMaterial;

}

function getEquirectMaterial() {

	return new ShaderMaterial({

		name: 'EquirectangularToCubeUV',

		uniforms: {
			'envMap': null
		},

		vertex: getCommonVertexShader(),

		fragment: /* glsl */`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include common

			vec2 equirectUv( in vec3 dir ) {

	// dir is assumed to be unit length

	float u = atan( dir.z, dir.x ) * RECIPROCAL_TAU + 0.5;

	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;

	return vec2( u, v );

}

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );
				//gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
				//gl_FragColor = vec4(outputDirection, 1.0);

			}
		`,

		//blending: NoBlending,
		depthTest: false,
		depthWrite: false

	});

}

function getCubemapMaterial() {

	return new ShaderMaterial({

		name: 'CubemapToCubeUV',

		uniforms: {
			'envMap': null,
			'flipEnvMap': -1
		},

		vertexShader: getCommonVertexShader(),

		fragmentShader: /* glsl */`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,

		//blending: NoBlending,
		depthTest: false,
		depthWrite: false

	});

}

function getCommonVertexShader() {

	return /* glsl */`

		#include declare_attributes
		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( aTextureCoord, faceIndex );
			gl_Position = vec4( aVertexPosition, 1.0 );

		}
	`;

}
