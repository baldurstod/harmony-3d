import { vec3, vec4 } from 'gl-matrix';
import { Entity } from '../../../entities/entity';

export function ParseVector(str) {
	const regex = / *(-?\d*(\.\d*)?) *(-?\d*(\.\d*)?) *(-?\d*(\.\d*)?) */i;

	const result = regex.exec(str);
	if (result) {
		return vec3.fromValues(Number.parseFloat(result[1]), Number.parseFloat(result[3]), Number.parseFloat(result[5]));
	}
	return null;
}

export function ParseVector2(out, str) {
	const regex = / *(-?\d*(\.\d*)?) *(-?\d*(\.\d*)?) *(-?\d*(\.\d*)?) */i;

	const result = regex.exec(str);
	if (result) {
		return vec3.set(out, Number.parseFloat(result[1]), Number.parseFloat(result[3]), Number.parseFloat(result[5]));
	}
	return null;
}

export function ParseVec4(out, str) {
	const regex = / *(-?\d*(\.\d*)?) *(-?\d*(\.\d*)?) *(-?\d*(\.\d*)?) *(-?\d*(\.\d*)?) */i;

	const result = regex.exec(str);
	if (result) {
		return vec4.set(out, Number.parseFloat(result[1]), Number.parseFloat(result[3]), Number.parseFloat(result[5]), Number.parseFloat(result[7]));
	}
	return null;
}

export function parseLightColorIntensity(value, light, intensityMultiplier = 1) {
	let colorValue = vec3.create();
	let arrayValue = value.split(' ');

	colorValue[0] = Math.pow(arrayValue[0] / 255.0, 2.2);
	colorValue[1] = Math.pow(arrayValue[1] / 255.0, 2.2);
	colorValue[2] = Math.pow(arrayValue[2] / 255.0, 2.2);

	light.color = colorValue;
	light.intensity = arrayValue[3] / 255.0 * intensityMultiplier;
}

export function AngleQuaternion(angles, outQuat) {
	const sy = Math.sin(angles[1] * 0.5);
	const cy = Math.cos(angles[1] * 0.5);
	const sp = Math.sin(angles[0] * 0.5);
	const cp = Math.cos(angles[0] * 0.5);
	const sr = Math.sin(angles[2] * 0.5);
	const cr = Math.cos(angles[2] * 0.5);
	/*SinCos(DEG2RAD(angles[1]) * 0.5f, &sy, &cy);
	SinCos(DEG2RAD(angles[0]) * 0.5f, &sp, &cp);
	SinCos(DEG2RAD(angles[2]) * 0.5f, &sr, &cr);*/

	// NJS: for some reason VC6 wasn't recognizing the common subexpressions:
	const srXcp = sr * cp, crXsp = cr * sp;
	outQuat[0] = srXcp * cy - crXsp * sy; // X
	outQuat[1] = crXsp * cy + srXcp * sy; // Y

	const crXcp = cr * cp, srXsp = sr * sp;
	outQuat[2] = crXcp * sy - srXsp * cy; // Z
	outQuat[3] = crXcp * cy + srXsp * sy; // W (real component)
	return outQuat;
}

//angles[PITCH, YAW, ROLL]
export function AngleVectors(angles, forward) {
	const sy = Math.sin(angles[1]);
	const cy = Math.cos(angles[1]);
	const sp = Math.sin(angles[0]);
	const cp = Math.cos(angles[0]);

	forward[0] = cp * cy;
	forward[1] = cp * sy;
	forward[2] = -sp;
}

export function ParseAngles(str) {
	const angles = ParseVector(str)
	if (angles) {
		return vec3.scale(angles, angles, Math.PI / 180);
	}
	return null;
}

export function ParseAngles2(out, str) {
	if (ParseVector2(out, str)) {
		return vec3.scale(out, out, Math.PI / 180);
	}
	return null;
}

/**
 * Map entity
 */
export class MapEntity extends Entity {
	static incrementalId = 0;
	classname: string;
	outputs = [];
	m_vecVelocity = vec3.create();
	m_flMoveDoneTime = -1;
	m_flLocalTime = 0;
	f = 0;
	keys = new Map();
	targetName;
	parentName;
	m;
	constructor(classname: string) {
		super({ name: classname });
		this.classname = classname;
		this.id = String(++MapEntity.incrementalId);
		//this.children = Object.create(null);
	}

	setKeyValues(kvElement) {
		if (kvElement) {
			if (kvElement.spawnflags) {
				this.f = kvElement.spawnflags * 1;
			}

			let entityParams = Object.keys(kvElement);
			for (let i = 0, l = entityParams.length; i < l; i++) {
				let key = entityParams[i];
				this.setKeyValue(key, kvElement[key]);
			}
		}
	}

	setKeyValue(key, value) {
		if (key) {
			this.keys.set(key, value);
			if (key.indexOf('on') == 0) {
				this.addOutput(key.replace(/#\d+$/, ''), value);
			}
			switch (key) {
				case 'targetname':
					this.targetName = value;
					break;
				case 'origin':
					this._position = ParseVector(value);
					break;
				case 'angles':
					AngleQuaternion(ParseAngles(value), this._quaternion);
					break;
				case 'parentname':
					this.parentName = value;
					break;
			}
		}
	}

	getValue(key) {
		return this.keys.get(key);
	}

	addOutput(outputName, outputValue) {
		let output = new MapEntityConnection(outputName);
		this.m.addConnection(output);
		this.outputs.push(output);
		output.fromString(outputValue);
		//console.log(output.outputName, output.getTargetName(), output.getTargetInput(), output.getTargetParameter(), output.getDelay(), output.getFireOnlyOnce());
	}

	setInput(input, parameter) {
	}

	getFlag(position) {
		return (this.f >> position) & 1;
	}

	set map(map) {
		this.m = map;
	}

	get map() {
		return this.m;
	}

	move(delta) {
		this.position = vec3.add(vec3.create(), this._position, delta);//todo remove me
	}

	/*set position(o) {
		if (o) {
			let oo = this._position;
			if ((o[0] != oo[0]) || (o[1] != oo[1]) || (o[2] != oo[2])) {
				this._position = o;
				let delta = vec3.sub(vec3.create(), this._position, o);
				for (let i in this.children) {
					let child = this.children[i];
					child.move(delta, /*initiator || * /this);
				}
			}
		}
	}*/

	/*
	get position() {
		return super.position;
	}
		*/

	getAbsOrigin() {
		return null;
	}

	getLocalOrigin() {//removeme ??
		return this._position;
	}

	getLocalVelocity() {
		return this.m_vecVelocity;
	}

	update(map, delta) {
		this.m_flLocalTime += delta
		if (this.parentName) {
			let parent = map.getEntityByTargetName(this.parentName);
			if (parent) {
				this.setParent(parent);
				delete this.parentName;
			}
		}
		this.position = vec3.scaleAndAdd(vec3.create(), this.getLocalOrigin(), this.getLocalVelocity(), delta);//TODO removeme : optimize
	}

	setParent(parent) {
		//void CBaseEntity::SetParent(CBaseEntity *pParentEntity, int iAttachment)
		let oldParent = this.parent;
		this.parent = parent;
		if (parent == this) {
			this.parent = null;
		}
		if (oldParent) {
			oldParent.removeChild(this);
		}
		if (this.parent) {
			this.parent.addChild(this);
		}
	}

	/*addChild(child) {
		if (child) {
			this.children[child.id] = child;
		}
	}

	removeChild(child) {
		if (child) {
			delete this.children[child.id];
		}
	}*/

	setLocalVelocity(vecVelocity) {
		vec3.copy(this.m_vecVelocity, vecVelocity);
	}

	setMoveDoneTime(delay) {
		if (delay >= 0) {
			this.m_flMoveDoneTime = this.getLocalTime() + delay;
		} else {
			this.m_flMoveDoneTime = -1;
		}
	}

	getLocalTime() {
		return this.m_flLocalTime;
	}

	fireOutput(outputName) {
		let outputs = this.outputs;
		let result = [];
		for (let i = 0, l = outputs.length; i < l; i++) {
			let output = outputs[i];
			if (outputName == output.outputName) {
				//result.push(connection);
				output.fire(this.m);
			}
		}
		return result;
	}

	toString() {
		return this.classname;
	}
}
MapEntity.incrementalId = 0;

/**
 * Entity connection
 */
class MapEntityConnection {
	//'OnMapSpawn' 'tonemap_global,SetAutoExposureMax,.8,0,-1'
	n;
	p;
	constructor(name) {
		this.n = name;
		this.p = null;
	}
	fromString(stringDatas) {
		let parameters = stringDatas.split(',');
		if (parameters && parameters.length == 5) {
			this.p = parameters;
		}
	}
	get outputName() {
		return this.n;
	}
	getTargetName() {
		let parameters = this.p;
		if (parameters) {
			return parameters[0];
		}
	}
	getTargetInput() {
		let parameters = this.p;
		if (parameters) {
			return parameters[1];
		}
	}
	getTargetParameter() {
		let parameters = this.p;
		if (parameters) {
			return parameters[2];
		}
	}
	getDelay() {
		let parameters = this.p;
		if (parameters) {
			return parameters[3];
		}
	}
	getFireOnlyOnce() {
		let parameters = this.p;
		if (parameters) {
			return parameters[4];
		}
	}

	fire(map) {//TODO: delay, fire once
		let parameters = this.p;
		if (parameters) {
			map.setTargetsInput(parameters[0], parameters[1], parameters[2]);
		}
	}
}
