import { vec3, vec4 } from 'gl-matrix';

import { SourceEngineMaterial } from './sourceenginematerial';
import { SourceEngineVMTLoader } from '../loaders/sourceenginevmtloader';
import { TextureManager } from '../../../textures/texturemanager';
import { Source1TextureManager } from '../textures/source1texturemanager';

let tempVec3 = vec3.create();

export class EyeRefractMaterial extends SourceEngineMaterial {
	#eyeOrigin = vec3.create();
	#eyeForward = vec3.create();
	#eyeUp = vec3.create();
	#eyeRight = vec3.create();
	#irisProjectionU = vec4.create();
	#irisProjectionV = vec4.create();
	constructor(repository, fileName, parameters: any = {}) {//fixme
		parameters.useSrgb = false;
		super(repository, fileName, parameters);
		this.setValues(parameters);

		//this.uniforms['phongfresnelranges'] = SourceEngineMaterial.readColor(parameters['$phongfresnelranges']);

		if (parameters['$iris']) {
			this.setColorMap(Source1TextureManager.getTexture(this.repository, parameters['$iris'], parameters['$frame'] || 0));
		} else {
			this.setColorMap(TextureManager.createCheckerTexture());
		}
	}

	afterProcessProxies() {
		let variables = this.variables;
		let parameters = this.parameters;
		if (parameters['$iris']) {
			this.setColorMap(Source1TextureManager.getTexture(this.repository, parameters['$iris'], parameters['$frame'] || 0));
		}
		if (parameters['$corneatexture']) {
			this.setTexture('corneaMap', Source1TextureManager.getTexture(this.repository, parameters['$corneatexture'], 0));
		}

		const eyeballArray = this.properties.get('eyeballArray');
		const skeleton = this.properties.get('skeleton');
		if (eyeballArray && skeleton) {//TODOv3: do this only once
			let eyeBall = eyeballArray[this.properties.get('materialParam')];
			if (eyeBall) {
				let bone = skeleton._bones[eyeBall.bone];
				if (bone) {
					bone.getWorldPosOffset(eyeBall.org, this.#eyeOrigin);
					this.uniforms['u#eyeOrigin'] = this.#eyeOrigin;
				}
			}
		}
	}


	beforeRender(camera) {//TODO: check params

		const eyeballArray = this.properties.get('eyeballArray');
		const skeleton = this.properties.get('skeleton');
		if (eyeballArray && skeleton) {//TODOv3: do this only once
			let eyeBall = eyeballArray[this.properties.get('materialParam')];
			if (eyeBall) {
				let bone = skeleton._bones[eyeBall.bone];
				if (bone) {
					vec3.transformQuat(this.#eyeUp, eyeBall.up, bone.worldQuat);
					vec3.sub(this.#eyeForward, camera.position, this.#eyeOrigin);
					vec3.cross(this.#eyeRight, this.#eyeForward, this.#eyeUp);
					vec3.normalize(this.#eyeRight, this.#eyeRight);
					vec3.scaleAndAdd(this.#eyeForward, this.#eyeForward, this.#eyeRight, eyeBall.zoffset);
					vec3.normalize(this.#eyeForward, this.#eyeForward);
					vec3.cross(this.#eyeRight, this.#eyeForward, this.#eyeUp);//TODOv3: fix this bullshit
					vec3.normalize(this.#eyeRight, this.#eyeRight);
					vec3.cross(this.#eyeUp, this.#eyeRight, this.#eyeForward);//TODOv3: fix this bullshit
					vec3.normalize(this.#eyeUp, this.#eyeUp);

					let scale = eyeBall.irisScale;//(1 / eyeBall.irisScale);TODOv3

					vec3.scale((this.#irisProjectionU as vec3), this.#eyeRight, -scale);
					vec3.scale((this.#irisProjectionV as vec3), this.#eyeUp, -scale);

					this.#irisProjectionU[3] = -vec3.dot(this.#eyeOrigin, (this.#irisProjectionU as vec3)) + 0.5;
					this.#irisProjectionV[3] = -vec3.dot(this.#eyeOrigin, (this.#irisProjectionV as vec3)) + 0.5;

					this.uniforms['uIrisProjectionU'] = this.#irisProjectionU;
					this.uniforms['uIrisProjectionV'] = this.#irisProjectionV;
				}
			}
		}

	}

	clone() {
		return new EyeRefractMaterial(this.repository, this.fileName, this.parameters);
	}

	get shaderSource() {
		return 'source1_eyerefract';
	}
}
SourceEngineVMTLoader.registerMaterial('eyerefract', EyeRefractMaterial);
