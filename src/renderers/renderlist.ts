function sortLights(first, second) {
	if (first.castShadow) {
		return -1;
	}
	return 1;
}

export class RenderList {
	lights = [];
	pointLights = [];
	spotLights = [];
	ambientLights = [];
	transparentList = [];
	opaqueList = [];
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

	addObject(entity) {
		if (entity.visible !== false) {
			if (entity.isLight) {
				this.lights.push(entity)
				if (entity.isAmbientLight) {
					this.ambientLights.push(entity);
				} else if (entity.isPointLight) {
					this.pointLights.push(entity);
					if (entity.castShadow) {
						++this.pointLightShadows;
					}
				} else if (entity.isSpotLight) {
					this.spotLights.push(entity);
					if (entity.castShadow) {
						++this.spotLightShadows;
					}
				}
			} else {
				let material = entity.material;
				if (material) {
					if (material.blend) {//TODOv3 changeblend
						this.transparentList.push(entity);
					} else {
						this.opaqueList.push(entity);
					}
				}
			}
		}
	}
}
