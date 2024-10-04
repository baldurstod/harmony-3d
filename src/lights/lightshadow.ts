import { mat4, vec2, vec4 } from 'gl-matrix';

import { RenderTarget } from '../textures/rendertarget';
import { Camera } from '../cameras/camera';
import { Light } from './light';

let tempMat4 = mat4.create();

export class LightShadow {
	#textureSize: vec2 = vec2.create();
	light: Light;
	camera: Camera;
	shadowMatrix: mat4 = mat4.create();
	viewPorts: Array<vec4>;
	viewPortsLength: number;
	renderTarget: RenderTarget;
	constructor(light: Light, camera: Camera) {
		camera.hideInExplorer = true;
		camera.serializable = false;
		light.addChild(camera);
		this.light = light;
		this.camera = camera;
		this.#textureSize = vec2.set(this.#textureSize, light.shadowTextureSize, light.shadowTextureSize);
		this.shadowMatrix = mat4.create();
		this.viewPorts = [vec4.fromValues(0, 0, 1, 1)];
		this.viewPortsLength = 1;
		this.renderTarget = new RenderTarget({ width: this.#textureSize[0], height: this.#textureSize[0], });
		this.renderTarget.resize(this.#textureSize[0], this.#textureSize[1]);
	}

	set range(range: number) {
	}

	set textureSize(textureSize: number) {
		vec2.set(this.#textureSize, textureSize, textureSize);
		this.renderTarget.resize(this.#textureSize[0], this.#textureSize[1]);
	}

	get textureSize(): vec2 {
		return this.#textureSize;
	}

	computeShadowMatrix(mapIndex) {
		let shadowCamera = this.camera;
		let shadowMatrix = this.shadowMatrix;

		mat4.set(shadowMatrix,
			0.5, 0.0, 0.0, 0.0,
			0.0, 0.5, 0.0, 0.0,
			0.0, 0.0, 0.5, 0.0,
			0.5, 0.5, 0.5, 1.0
		);
		shadowCamera.dirty();

		mat4.mul(shadowMatrix, shadowMatrix, shadowCamera.projectionMatrix);
		mat4.mul(shadowMatrix, shadowMatrix, shadowCamera.worldMatrixInverse);
	}
}
