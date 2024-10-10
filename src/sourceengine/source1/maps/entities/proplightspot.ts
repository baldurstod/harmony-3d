import { quat, vec3 } from 'gl-matrix';

import { MapEntity,  AngleQuaternion, ParseAngles2, parseLightColorIntensity } from '../mapentity';
import { MapEntities } from '../mapentities';
import { SpotLight } from '../../../../lights/spotlight';
import { DEG_TO_RAD } from '../../../../math/constants';

const tempQuaternion = quat.create();
const tempVec3 = vec3.create();

const SPOTLIGHT_DEFAULT_QUATERNION = quat.fromValues(0, -1, 0, 1);

export class PropLightSpot extends MapEntity {
	spotLight = new SpotLight();
	//this.spotLight.visible = false;
	_angles = vec3.fromValues(-90, 0, 0);
	constructor(classname) {
		super(classname);
		this.quaternion = SPOTLIGHT_DEFAULT_QUATERNION;
	}

	setKeyValues(kvElement) {//TODOv3 fix me
		super.setKeyValues(kvElement);
		this.m.addChild(this.spotLight);
		this.spotLight.position = this._position;
		this.spotLight.quaternion = this._quaternion;
	}

	setKeyValue(key, value) {
		let spotLight = this.spotLight;
		spotLight.range = 1000;
		switch (key) {
			case '_zero_percent_distance':
				spotLight.range = Number(value);
				break;
			case '_cone':
				spotLight.angle = value * DEG_TO_RAD;
				break;
			case '_inner_cone':
				spotLight.innerAngle = value * DEG_TO_RAD;
				break;
			case '_light':
				parseLightColorIntensity(value, spotLight, 0.1);
				break;
			case 'pitch':
				//angles should suffice
				this._angles[0] = -value * DEG_TO_RAD;
				this.setAngles();
				break;
			case 'angles':
				ParseAngles2(tempVec3, value);
				this._angles[1] = tempVec3[1];
				this._angles[2] = tempVec3[1];
				this.setAngles();
				break;
			case '_quadratic_attn':
				//TODO
				break;
			case '_linear_attn':
				//TODO
				break;
			case '_lightscalehdr':
				//TODO
				break;
			case '_lighthdr':
				//TODO
				break;
			default:
				super.setKeyValue(key, value);
		}
	}

	setAngles() {
		AngleQuaternion(this._angles, tempQuaternion);
		quat.mul(this._quaternion, SPOTLIGHT_DEFAULT_QUATERNION, tempQuaternion);
	}

	setInput(inputName, parameter) {
		throw 'code me';
		/*
		switch (inputName.toLowerCase()) {
			case 'skin':
				this.model.setSkin(parameter);
				break;
		}*/
	}

	update(map, delta) {
		super.update(map, delta);
		this.spotLight.position = this._position;
		this.spotLight.quaternion = this._quaternion;
	}
}
MapEntities.registerEntity('light_spot', PropLightSpot);
MapEntities.registerEntity('light_glspot', PropLightSpot);
