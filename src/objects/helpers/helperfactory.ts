import { Camera } from '../../cameras/camera';
import { Entity } from '../../entities/entity';
import { PointLightHelper } from '../../lights/helpers/pointlighthelper';
import { SpotLightHelper } from '../../lights/helpers/spotlighthelper';
import { CameraFrustum } from './camerafrustum';
import { Grid } from './grid';

export function getHelper(type: Entity) {
	switch (type.constructor.name) {
		case 'PointLight':
			return new PointLightHelper();
		case 'SpotLight':
			return new SpotLightHelper();
		case 'Scene':
			return new Grid();
	}

	if (type instanceof Camera) {
		return new CameraFrustum();
	}
}
