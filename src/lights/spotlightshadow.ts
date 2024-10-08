import { LightShadow } from './lightshadow';
import { Camera } from '../cameras/camera';
import { RAD_TO_DEG } from '../math/constants';
import { SpotLight } from './spotlight';

export class SpotLightShadow extends LightShadow {
	constructor(light: SpotLight) {
		super(light, new Camera());//TODO: adjust default variables
		const textureSize = this.textureSize;
		this.aspect = textureSize[0] / textureSize[1];
		this.angle = (this.light as SpotLight).angle;
		this.range = this.light.range;
	}

	set angle(angle) {
		this.camera.verticalFov = RAD_TO_DEG * 2.0 * angle;
	}

	set range(range) {
		this.camera.farPlane = range || 1000.0;
	}

	set aspect(aspect) {
		this.camera.aspectRatio = aspect;
	}
}
