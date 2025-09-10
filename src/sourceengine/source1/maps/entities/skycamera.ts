import { vec3 } from 'gl-matrix';
import { Camera } from '../../../../cameras/camera';
import { KvElement } from '../../loaders/kvreader';
import { MapEntities } from '../mapentities';
import { MapEntity } from '../mapentity';

export class SkyCamera extends MapEntity {
	camera = new Camera();

	setKeyValues(kvElement: KvElement) {
		super.setKeyValues(kvElement);
		const scale = (kvElement as any/*TODO: fix that*/).scale;
		this.camera.scale = vec3.fromValues(scale, scale, scale);
		this.camera.position = this._position;
	}
}
MapEntities.registerEntity('sky_camera', SkyCamera);
