import { Camera } from '../../../../cameras/camera';
import { PointLight } from '../../../../lights/pointlight';
import { Scene } from '../../../../scenes/scene';
import { MapEntities } from '../mapentities';
import { MapEntity, parseLightColorIntensity } from '../mapentity';

//const colorIntensity = vec4.create();

export class MapEntityLight extends MapEntity {
	pointLight = new PointLight();

	setKeyValues(kvElement) {//TODOv3 fix me
		super.setKeyValues(kvElement);
		this.map.addChild(this.pointLight);
		this.pointLight.position = this._position;
	}

	setKeyValue(key, value) {
		const pointLight = this.pointLight;
		pointLight.range = 1000;
		switch (key) {
			case '_zero_percent_distance':
				pointLight.range = Number(value);
				break;
			case '_light':
				parseLightColorIntensity(value, pointLight, 1.0);
				break;
			//TODO: other parameters
			default:
				super.setKeyValue(key, value);
		}
	}

	update(scene: Scene, camera: Camera, delta: number): void {
		super.update(scene, camera, delta);
		this.pointLight.setPosition(this._position);
	}
}
MapEntities.registerEntity('light', MapEntityLight);
