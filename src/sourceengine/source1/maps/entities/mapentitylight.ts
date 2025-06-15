import { MapEntity, parseLightColorIntensity } from '../mapentity';
import { MapEntities } from '../mapentities';
import { PointLight } from '../../../../lights/pointlight';

//const colorIntensity = vec4.create();

export class MapEntityLight extends MapEntity {
	pointLight = new PointLight();

	setKeyValues(kvElement) {//TODOv3 fix me
		super.setKeyValues(kvElement);
		this.m.addChild(this.pointLight);
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

	update(map, delta) {
		super.update(map, delta);
		this.pointLight.position = this._position;
	}
}
MapEntities.registerEntity('light', MapEntityLight);
