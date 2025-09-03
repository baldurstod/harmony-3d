import { quat, vec3, vec4 } from 'gl-matrix';
import { Camera } from '../../../cameras/camera';
import { Entity, EntityParameters } from '../../../entities/entity';
import { Light } from '../../../lights/light';
import { Scene } from '../../../scenes/scene';
import { SourceBSP } from '../export';
import { KvElement } from '../loaders/kvreader';

export function ParseVector(out: vec3, str: string): vec3 | null {// TODO: pass vector as input
	const regex = / *(-?\d*(\.\d*)?) *(-?\d*(\.\d*)?) *(-?\d*(\.\d*)?) */i;

	const result = regex.exec(str);
	if (result && result.length >= 6) {
		return vec3.set(out, Number.parseFloat(result[1]!), Number.parseFloat(result[3]!), Number.parseFloat(result[5]!));
	}
	return null;
}

export function ParseVector2(out: vec3, str: string): vec3 | null {
	const regex = / *(-?\d*(\.\d*)?) *(-?\d*(\.\d*)?) *(-?\d*(\.\d*)?) */i;

	const result = regex.exec(str);
	if (result && result.length >= 6) {
		return vec3.set(out, Number.parseFloat(result[1]!), Number.parseFloat(result[3]!), Number.parseFloat(result[5]!));
	}
	return null;
}

export function ParseVec4(out: vec4, str: string): vec4 | null {
	const regex = / *(-?\d*(\.\d*)?) *(-?\d*(\.\d*)?) *(-?\d*(\.\d*)?) *(-?\d*(\.\d*)?) */i;

	const result = regex.exec(str);
	if (result && result.length >= 8) {
		return vec4.set(out, Number.parseFloat(result[1]!), Number.parseFloat(result[3]!), Number.parseFloat(result[5]!), Number.parseFloat(result[7]!));
	}
	return null;
}

export function parseLightColorIntensity(value: string, light: Light, intensityMultiplier = 1): void {
	const colorValue = vec3.create();
	const arrayValue = value.split(' ');

	colorValue[0] = Math.pow(Number(arrayValue[0]) / 255.0, 2.2);
	colorValue[1] = Math.pow(Number(arrayValue[1]) / 255.0, 2.2);
	colorValue[2] = Math.pow(Number(arrayValue[2]) / 255.0, 2.2);

	light.color = colorValue;
	light.intensity = Number(arrayValue[3]) / 255.0 * intensityMultiplier;
}

export function AngleQuaternion(angles: vec3, outQuat: quat): quat {
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
export function AngleVectors(angles: vec3, forward: vec3): void {
	const sy = Math.sin(angles[1]);
	const cy = Math.cos(angles[1]);
	const sp = Math.sin(angles[0]);
	const cp = Math.cos(angles[0]);

	forward[0] = cp * cy;
	forward[1] = cp * sy;
	forward[2] = -sp;
}

export function ParseAngles(out: vec3, str: string): vec3 | null {
	const angles = ParseVector(out, str)
	if (angles) {
		return vec3.scale(angles, angles, Math.PI / 180);
	}
	return null;
}

export function ParseAngles2(out: vec3, str: string): vec3 | null {
	if (ParseVector2(out, str)) {
		return vec3.scale(out, out, Math.PI / 180);
	}
	return null;
}

export type MapEntityValue = any /*TODO: improve type*/

export type MapEntityParameters = EntityParameters & {
	map: SourceBSP,
	className: string,
};

/**
 * Map entity
 */
export class MapEntity extends Entity {
	static incrementalId = 0;
	classname: string;
	outputs: MapEntityConnection[] = [];
	readonly m_vecVelocity = vec3.create();
	m_flMoveDoneTime = -1;
	m_flLocalTime = 0;
	f = 0;
	keys = new Map<string, MapEntityValue>();
	targetName = '';
	parentName?: string;
	readonly map: SourceBSP;
	#parentEntity: MapEntity | null = null;

	constructor(params: MapEntityParameters) {
		super(params);
		this.name = params.className;
		this.map = params.map;
		this.classname = params.className;
		this.id = String(++MapEntity.incrementalId);
		//this.children = Object.create(null);
	}

	setKeyValues(kvElement: KvElement): void {
		if (kvElement) {
			if ((kvElement as any/*TODO: fix that*/).spawnflags) {
				this.f = Number((kvElement as any/*TODO: fix that*/).spawnflags);
			}

			const entityParams = Object.keys(kvElement);
			for (const key of entityParams) {
				this.setKeyValue(key, (kvElement as any/*TODO: fix that*/)[key]);
			}
		}
	}

	setKeyValue(key: string, value: MapEntityValue): void {
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
					ParseVector(this._position, value);
					break;
				case 'angles':
					const angles = ParseAngles(vec3.create()/*TODO: optimize*/, value);
					if (angles) {
						AngleQuaternion(angles, this._quaternion);
					}
					break;
				case 'parentname':
					this.parentName = value;
					break;
			}
		}
	}

	getValue(key: string): MapEntityValue {
		return this.keys.get(key);
	}

	addOutput(outputName: string, outputValue: any/*TODO: improve type*/): void {
		const output = new MapEntityConnection(outputName);
		this.map.addConnection(output);
		this.outputs.push(output);
		output.fromString(outputValue);
		//console.log(output.outputName, output.getTargetName(), output.getTargetInput(), output.getTargetParameter(), output.getDelay(), output.getFireOnlyOnce());
	}

	setInput(input: string, parameters: any/*TODO: improve type*/): void {
	}

	getFlag(position: number): number {
		return (this.f >> position) & 1;
	}

	move(delta: vec3) {
		this.setPosition(vec3.add(vec3.create(), this._position, delta));//todo remove me
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

	getAbsOrigin(): vec3 {//TODO: optimize
		return vec3.create();
	}

	getLocalOrigin(): vec3 {//removeme ??
		return this._position;
	}

	getLocalVelocity(): vec3 {
		return this.m_vecVelocity;
	}

	update(scene: Scene, camera: Camera, delta: number): void {
		this.m_flLocalTime += delta
		if (this.parentName) {
			throw 'uncomment next line';
			/*const parent = this.map.getEntityByTargetName(this.parentName);
			if (parent) {
				this.setParent(parent);
				delete this.parentName;
			}
			*/
		}
		this.position = vec3.scaleAndAdd(vec3.create(), this.getLocalOrigin(), this.getLocalVelocity(), delta);//TODO removeme : optimize
	}

	setParent(parent: MapEntity) {
		//void CBaseEntity::SetParent(CBaseEntity *pParentEntity, int iAttachment)
		const oldParent = this.parent;
		this.#parentEntity = parent;
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

	setLocalVelocity(vecVelocity: vec3): void {
		vec3.copy(this.m_vecVelocity, vecVelocity);
	}

	setMoveDoneTime(delay: number): void {
		if (delay >= 0) {
			this.m_flMoveDoneTime = this.getLocalTime() + delay;
		} else {
			this.m_flMoveDoneTime = -1;
		}
	}

	getLocalTime(): number {
		return this.m_flLocalTime;
	}

	fireOutput(outputName: string): void {
		for (const output of this.outputs) {
			if (outputName == output.outputName) {
				//result.push(connection);
				output.fire(this.map);
			}
		}
	}

	toString(): string {
		return this.classname;
	}
}
MapEntity.incrementalId = 0;

/**
 * Entity connection
 */
class MapEntityConnection {
	//'OnMapSpawn' 'tonemap_global,SetAutoExposureMax,.8,0,-1'
	name: string;
	parameters: string[] | null = null;

	constructor(name: string) {
		this.name = name;
		this.parameters = null;
	}

	fromString(stringDatas: string) {
		const parameters = stringDatas.split(',');
		if (parameters && parameters.length == 5) {
			this.parameters = parameters;
		}
	}

	get outputName() {
		return this.name;
	}

	getTargetName() {
		const parameters = this.parameters;
		if (parameters) {
			return parameters[0];
		}
	}

	getTargetInput() {
		const parameters = this.parameters;
		if (parameters) {
			return parameters[1];
		}
	}

	getTargetParameter() {
		const parameters = this.parameters;
		if (parameters) {
			return parameters[2];
		}
	}

	getDelay() {
		const parameters = this.parameters;
		if (parameters) {
			return parameters[3];
		}
	}

	getFireOnlyOnce() {
		const parameters = this.parameters;
		if (parameters) {
			return parameters[4];
		}
	}

	fire(map: SourceBSP) {//TODO: delay, fire once
		const parameters = this.parameters;
		if (parameters) {
			throw 'uncomment next line';
			//map.setTargetsInput(parameters[0], parameters[1], parameters[2]);
		}
	}
}
