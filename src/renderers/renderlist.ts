import { Entity } from "../entities/entity";
import { AmbientLight } from "../lights/ambientlight";
import { Light } from "../lights/light";
import { PointLight } from "../lights/pointlight";
import { SpotLight } from "../lights/spotlight";
import { Mesh } from "../objects/mesh";

function sortLights(first, second) {
	if (first.castShadow) {
		return -1;
	}
	return 1;
}

export class RenderList {
	lights = [];
	pointLights: Array<PointLight> = [];
	spotLights: Array<SpotLight> = [];
	ambientLights: Array<AmbientLight> = [];
	transparentList: Array<Mesh> = [];
	opaqueList: Array<Mesh> = [];
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
				this.lights.push(entity)
				if ((entity as AmbientLight).isAmbientLight) {
					this.ambientLights.push(entity);
				} else if ((entity as PointLight).isPointLight) {
					this.pointLights.push(entity);
					if (entity.castShadow) {
						++this.pointLightShadows;
					}
				} else if ((entity as SpotLight).isSpotLight) {
					this.spotLights.push(entity);
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
