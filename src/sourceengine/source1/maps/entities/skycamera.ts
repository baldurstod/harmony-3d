import { vec3 } from 'gl-matrix';

import { MapEntity } from '../mapentity';
import { MapEntities } from '../mapentities';
import { Camera } from '../../../../cameras/camera';

export class SkyCamera extends MapEntity {
	camera = new Camera();

	setKeyValues(kvElement) {
		super.setKeyValues(kvElement);
		this.camera.scale = vec3.fromValues(kvElement.scale, kvElement.scale, kvElement.scale);
		this.camera.position = this._position;
	}
}
MapEntities.registerEntity('sky_camera', SkyCamera);
