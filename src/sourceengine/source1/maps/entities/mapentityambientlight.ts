import { Camera } from '../../../../cameras/camera';
import { AmbientLight } from '../../../../lights/ambientlight';
import { Scene } from '../../../../scenes/scene';
import { KvElement } from '../../loaders/kvreader';
import { MapEntities } from '../mapentities';
import { MapEntity, MapEntityValue, parseLightColorIntensity } from '../mapentity';

export class MapEntityAmbientLight extends MapEntity {
	#ambientLight = new AmbientLight();

	setKeyValues(kvElement: KvElement) {//TODOv3 fix me
		super.setKeyValues(kvElement);
		this.map.addChild(this.#ambientLight);
		this.#ambientLight.position = this._position;
	}

	setKeyValue(key: string, value: MapEntityValue): void {
		const ambientLight = this.#ambientLight;
		//pointLight.range = 1000;
		switch (key) {
			case '_ambient':
				parseLightColorIntensity(value, ambientLight, 0.1);
				break;
			//TODO: other parameters
			default:
				super.setKeyValue(key, value);
		}
	}

	update(scene: Scene, camera: Camera, delta: number): void {
		super.update(scene, camera, delta);
		this.#ambientLight.setPosition(this._position);
	}
}
MapEntities.registerEntity('light_environment', MapEntityAmbientLight);

/*
{
"origin" "216 -632 -48.4408"
"SunSpreadAngle" "0"
"pitch" "-45"
"angles" "-45 204 0"
"_lightscaleHDR" "1"
"_lightHDR" "-1 -1 -1 1"
"_light" "253 243 208 500"
"_AmbientScaleHDR" "1"
"_ambientHDR" "-1 -1 -1 1"
"_ambient" "124 138 203 500"
"classname" "light_environment"
"hammerid" "1351"
}
*/
