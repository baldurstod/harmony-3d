import { Camera } from '../../../../cameras/camera';
import { KvElement } from '../../loaders/kvreader';
import { MapEntities } from '../mapentities';
import { MapEntity } from '../mapentity';

export class SkyCamera extends MapEntity {
	camera = new Camera();

	override setKeyValues(kvElement: KvElement): void {
		super.setKeyValues(kvElement);
		const scale = (kvElement as any/*TODO: fix that*/).scale;
		this.camera.setScale(scale);
		this.camera.setPosition(this._position);
	}
}
MapEntities.registerEntity('sky_camera', SkyCamera);
