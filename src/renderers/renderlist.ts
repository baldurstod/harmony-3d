import { Entity } from '../entities/entity';
import { AmbientLight } from '../lights/ambientlight';
import { Light } from '../lights/light';
import { PointLight } from '../lights/pointlight';
import { SpotLight } from '../lights/spotlight';
import { Mesh } from '../objects/mesh';

function sortLights(first: Light, second: Light) {
	if (first.castShadow) {
		return -1;
	}
	return 1;
}

export class RenderList {
	lights: Light[] = [];
	pointLights: PointLight[] = [];
	spotLights: SpotLight[] = [];
	ambientLights: AmbientLight[] = [];
	transparentList: Mesh[] = [];
	opaqueList: Mesh[] = [];
	pointLightShadows = 0;
	spotLightShadows = 0;

	reset() {
		this.lights = [];
		this.pointLights = [];
		this.spotLights = [];
		this.ambientLights = [];
		this.transparentList = [];
		this.opaqueList = [];
		this.pointLightShadows = 0;
		this.spotLightShadows = 0;
	}

	finish() {
		this.pointLights.sort(sortLights);
		this.spotLights.sort(sortLights);
	}

	addObject(entity: Entity) {
		if (entity.isVisible() !== false) {
			if ((entity as Light).isLight) {
				this.lights.push(entity as Light)
				if ((entity as AmbientLight).isAmbientLight) {
					this.ambientLights.push(entity as AmbientLight);
				} else if ((entity as PointLight).isPointLight) {
					this.pointLights.push(entity as PointLight);
					if (entity.castShadow) {
						++this.pointLightShadows;
					}
				} else if ((entity as SpotLight).isSpotLight) {
					this.spotLights.push(entity as SpotLight);
					if (entity.castShadow) {
						++this.spotLightShadows;
					}
				}
			} else {
				const material = (entity as Mesh).material;
				if (material) {
					if (material.blend) {//TODOv3 changeblend
						this.transparentList.push(entity as Mesh);
					} else {
						this.opaqueList.push(entity as Mesh);
					}
				}
			}
		}
	}
}
