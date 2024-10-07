import { CameraFrustum } from './camerafrustum';
import { Grid } from './grid';
import { PointLightHelper } from '../../lights/helpers/pointlighthelper';
import { SpotLightHelper } from '../../lights/helpers/spotlighthelper';
import { Camera } from '../../cameras/camera';

export function getHelper(type) {
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
