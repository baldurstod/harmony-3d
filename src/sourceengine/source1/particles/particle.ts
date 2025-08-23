import { quat, vec3, vec4 } from 'gl-matrix';
import { WARN } from '../../../buildoptions';
import { clamp } from '../../../math/functions';
import { Bone } from '../../../objects/bone';
import { SourceParticleFieldValue } from '../../common/particles/types';
import { Color } from './color';
import { SourceEngineParticleSystem } from './sourceengineparticlesystem';

/**
 * TODO
 */
export class SourceEngineParticle {
	currentTime = 0;
	previousElapsedTime = 0;
	name: string;
	id: string;
	isAlive = false;
	readonly position = vec3.create();
	readonly prevPosition = vec3.create();
	readonly cpPosition = vec3.create();
	readonly cpOrientation = quat.create();//TODO: rename this var
	readonly cpOrientationInvert = quat.create();
	velocity = vec3.create();
	color = new Color(255, 255, 255);
	initialColor = new Color(255, 255, 255);
	uMin = 0;
	uMax = 1;
	vMin = 0;
	vMax = 1;
	system: SourceEngineParticleSystem;
	cTime = 0;
	timeToLive: number = 0;
	initialTimeToLive: number = 0;
	proportionOfLife: number = 0;
	u = 0;
	v = 0;
	radius = 1;
	initialRadius = 1;
	rotationRoll = 0;
	initialRoll = 0;
	rotationSpeedRoll = 0;
	rotationYaw = 0;
	startAlpha = 175 / 255;
	alpha = 175 / 255;
	alpha2 = 1.0;
	sequence = 0;
	initialSequence = 0;
	frame = 0;
	PositionFromParentParticles = false;
	posLockedToCP = false;
	rotLockedToCP = false;
	trailLength = 0.1;
	initialCPPosition = null;
	initialCPQuaternion = null;
	renderScreenVelocityRotate = false;
	initialVec?: vec3;
	bones?: [Bone, number][];

	constructor(id: string, system: SourceEngineParticleSystem) {
		this.name = 'Particle ' + id;
		this.id = id;
		//this.offsetPosition = vec3.create();
		this.system = system;
		this.reset();
		/*
			SetAttributeToConstant(PARTICLE_ATTRIBUTE_XYZ, 0.0f, 0.0f, 0.0f);
			SetAttributeToConstant(PARTICLE_ATTRIBUTE_PREV_XYZ, 0.0f, 0.0f, 0.0f);
			SetAttributeToConstant(PARTICLE_ATTRIBUTE_LIFE_DURATION, 1.0f);
			SetAttributeToConstant(PARTICLE_ATTRIBUTE_RADIUS, pDef->m_flConstantRadius);
			SetAttributeToConstant(PARTICLE_ATTRIBUTE_ROTATION, pDef->m_flConstantRotation);
			SetAttributeToConstant(PARTICLE_ATTRIBUTE_ROTATION_SPEED, pDef->m_flConstantRotationSpeed);
			SetAttributeToConstant(PARTICLE_ATTRIBUTE_TINT_RGB,
				pDef->m_ConstantColor.r() / 255.0f, pDef->m_ConstantColor.g() / 255.0f,
				pDef->m_ConstantColor.g() / 255.0f);
			SetAttributeToConstant(PARTICLE_ATTRIBUTE_ALPHA, pDef->m_ConstantColor.a() / 255.0f);
			SetAttributeToConstant(PARTICLE_ATTRIBUTE_CREATION_TIME, 0.0f);
			SetAttributeToConstant(PARTICLE_ATTRIBUTE_SEQUENCE_NUMBER, pDef->m_nConstantSequenceNumber);
			SetAttributeToConstant(PARTICLE_ATTRIBUTE_SEQUENCE_NUMBER1, pDef->m_nConstantSequenceNumber1);
			SetAttributeToConstant(PARTICLE_ATTRIBUTE_TRAIL_LENGTH, 0.1f);
			SetAttributeToConstant(PARTICLE_ATTRIBUTE_PARTICLE_ID, 0);
			SetAttributeToConstant(PARTICLE_ATTRIBUTE_YAW, 0);*/
	}

	step(elapsedTime: number): void {
		this.currentTime += elapsedTime;
		if (this.timeToLive) {
			this.proportionOfLife = this.currentTime / this.timeToLive;
		}
	}

	start(): void {
		this.isAlive = true;
		this.currentTime = 0;
		this.proportionOfLife = 0;
		//this.trail = new Array();
	}

	die(): void {
		this.isAlive = false;
	}

	reset(): void {
		//this.firstRender = true;
		this.currentTime = 0;
		this.proportionOfLife = 0;
		this.timeToLive = 1;
		vec3.zero(this.position);
		vec3.zero(this.prevPosition);
		vec3.zero(this.cpPosition);
		vec4.zero(this.cpOrientation);
		//vec3.zero(this.offsetPosition);
		vec3.zero(this.velocity);
		this.color.setWhite();
		this.initialColor.setWhite();
		this.u = 0;
		this.v = 0;
		this.radius = 1;
		this.initialRadius = 1;
		this.rotationRoll = 0;
		this.initialRoll = 0;
		this.rotationSpeedRoll = 0;
		this.rotationYaw = 0;
		this.startAlpha = 175 / 255;
		this.alpha = this.startAlpha;
		this.alpha2 = 1.0;
		// sequence number for animated textures
		this.sequence = 0;
		this.frame = 0;
		this.PositionFromParentParticles = false;
		this.posLockedToCP = false;
		this.rotLockedToCP = false;
		this.trailLength = 0.1;
		this.initialCPPosition = null;
		this.initialCPQuaternion = null;
		this.renderScreenVelocityRotate = false;
	}

	setInitialField(field: number/*TODO: use enum*/, value: SourceParticleFieldValue, mulInitial: boolean): void {
		this.setField(field, value, mulInitial, true);
	}

	setField(field = 0, value: SourceParticleFieldValue, mulInitial = false, setInitial = false): void {
		if (isNaN(field)) { return; }
		//console.log('Field ' + field + ' ' + value);

		switch (field) {
			case 0: // Position
				vec3.copy(this.position, value);
				break;
			case 1: // Time to live
				//if (mulInitial) {value*=this.initialSequence;}
				//this.sequence = Math.round(value);
				if (mulInitial) { value += this.initialTimeToLive; }
				this.timeToLive = value;
				//console.log(value);
				break;
			case 2: // Previous position
				vec3.copy(this.prevPosition, value);
				break;
			case 3:
				if (mulInitial) { value += this.initialRadius; }
				this.radius = value;
				if (setInitial) {
					this.initialRadius = value;
				}
				break;
			case 4: //roll
				//value*=57.3;
				if (value instanceof Float32Array) {
					value = value[0];
				}
				if (mulInitial) { value += this.initialRoll; }
				this.rotationRoll = value; //TODO
				break;
			case 5:
				this.rotationSpeedRoll = value;
				break;
			case 6: // Color
				if (mulInitial) {
					value[0] += this.initialColor.r;
					value[1] += this.initialColor.g;
					value[2] += this.initialColor.b;
				}
				value[0] = clamp(value[0], 0.0, 1.0);
				value[1] = clamp(value[1], 0.0, 1.0);
				value[2] = clamp(value[2], 0.0, 1.0);
				this.color.fromVec3(value);
				if (setInitial) {
					this.initialColor.fromVec3(value);
				}
				break;
			case 7: // Alpha
				if (mulInitial) {
					value *= this.startAlpha;
				}
				if (setInitial) {
					this.startAlpha = value;
				}
				this.alpha = value;
				break;
			//case 8: // creation time
			//case 9: // sequence#
			//case 10: // trail length
			case 12: // yaw
				if (value instanceof Float32Array) {
					value = value[0];
				}
				this.rotationYaw = value; //TODO
				break;
			case 16: // Alpha2
				this.alpha2 = value;
				break;
			default:
				if (WARN) {
					console.warn('Unknown field ' + field);
				}
		}
	}

	/**
	* TODO
	*/
	/*
	// required
	DEFPARTICLE_ATTRIBUTE(XYZ, 0);

	// particle lifetime (duration) of particle as a float.
	DEFPARTICLE_ATTRIBUTE(LIFE_DURATION, 1);

	// prev coordinates for verlet integration
	DEFPARTICLE_ATTRIBUTE(PREV_XYZ, 2);

	// radius of particle
	DEFPARTICLE_ATTRIBUTE(RADIUS, 3);

	// rotation angle of particle
	DEFPARTICLE_ATTRIBUTE(ROTATION, 4);

	// rotation speed of particle
	DEFPARTICLE_ATTRIBUTE(ROTATION_SPEED, 5);

	// tint of particle
	DEFPARTICLE_ATTRIBUTE(TINT_RGB, 6);

	// alpha tint of particle
	DEFPARTICLE_ATTRIBUTE(ALPHA, 7);

	// creation time stamp (relative to particle system creation)
	DEFPARTICLE_ATTRIBUTE(CREATION_TIME, 8);

	// sequnece # (which animation sequence number this particle uses)
	DEFPARTICLE_ATTRIBUTE(SEQUENCE_NUMBER, 9);

	// length of the trail
	DEFPARTICLE_ATTRIBUTE(TRAIL_LENGTH, 10);

	// unique particle identifier
	DEFPARTICLE_ATTRIBUTE(PARTICLE_ID, 11);

	// unique rotation around up vector
	DEFPARTICLE_ATTRIBUTE(YAW, 12);

	// second sequnece # (which animation sequence number this particle uses)
	DEFPARTICLE_ATTRIBUTE(SEQUENCE_NUMBER1, 13);

	// hit box index
	DEFPARTICLE_ATTRIBUTE(HITBOX_INDEX, 14);

	DEFPARTICLE_ATTRIBUTE(HITBOX_RELATIVE_XYZ, 15);

	DEFPARTICLE_ATTRIBUTE( ALPHA2, 16 );
	*/

	getField(field = 0, initial = false): SourceParticleFieldValue {

		switch (field) {
			case 1: // Time to live
				return initial ? this.initialTimeToLive : this.timeToLive;
				break;
			case 3:
				return this.radius;
				break;
			case 4:
				return this.rotationRoll;
				break;
			case 5:
				return this.rotationSpeedRoll;
				break;
			case 7:
				return this.alpha;
				break;
			case 8: //creation time
				return this.cTime;
				//return this.system.currentTime+1;
				break;
			case 12: //yaw
				return this.rotationYaw;
				break;
			case 16: //alpha2
				return this.alpha2;
				break;
			default:
				if (WARN) {
					console.warn('Unknown field ' + field);
				}
		}
		return 0;
	}

	/**
	* TODO
	*/
	setInitialSequence(sequence: number): void {
		this.sequence = sequence;
		this.initialSequence = sequence;
	}

	/**
	* TODO
	*/
	setInitialRadius(radius: number): void {
		this.radius = radius;
		this.initialRadius = radius;
	}
	/**
	* TODO
	*/
	setInitialTTL(timeToLive: number): void {
		this.timeToLive = timeToLive;
		this.initialTimeToLive = timeToLive;
	}
	/**
	* TODO
	*/
	setInitialColor(color: Color): void {
		this.color = color;
		this.initialColor = color;
	}
	/**
	* Set particle initial rotation roll.
	* @param {Number} roll Initial rotation roll.
	*/
	setInitialRoll(roll: number): void {
		this.rotationRoll = roll;
		this.initialRoll = roll;
	}


	/**
	* Get particle world position
	* @param {vec3|null} The receiving vector. Created if null.
	* @return {vec3} The world position.
	*/
	getWorldPos(worldPos: vec3): vec3 {
		worldPos = worldPos || vec3.create();
		//vec3.transformQuat(worldPos, this.position, this.cpOrientation);
		//vec3.transformQuat(worldPos, this.position, quat.create());

		//vec3.transformQuat(worldPos, this.position, this.system.currentOrientation);
		vec3.transformQuat(worldPos, this.position, this.cpOrientation);
		if (this.initialCPPosition) {
			//vec3.add(worldPos, worldPos, this.cpPosition);
		}
		vec3.copy(worldPos, this.position);
		return worldPos;
	}

	/**
	* Get particle world position
	* @param {vec3|null} The receiving vector. Created if null.
	* @return {vec3} The world position.
	*/
	getLocalPos(worldPos: vec3): vec3 {
		worldPos = worldPos || vec3.create();
		vec3.transformQuat(worldPos, this.position, this.cpOrientation);
		vec3.transformQuat(worldPos, this.position, quat.create());
		//vec3.add(worldPos, worldPos, this.cpPosition);
		return worldPos;
	}

}

/* FIELDS
0:velocity ??
1: TTL
3:radius
4:roll
5:roll speed ??
6: color
7: alpha
8:current time
10:scale
12:yaw???
//-----------------------------------------------------------------------------
// Particle attributes
//-----------------------------------------------------------------------------
#define MAX_PARTICLE_ATTRIBUTES 32

#define DEFPARTICLE_ATTRIBUTE(name, bit)						\
	const int PARTICLE_ATTRIBUTE_##name##_MASK = (1 << bit);	\
	const int PARTICLE_ATTRIBUTE_##name = bit;

// required
DEFPARTICLE_ATTRIBUTE(XYZ, 0);

// particle lifetime (duration) of particle as a float.
DEFPARTICLE_ATTRIBUTE(LIFE_DURATION, 1);

// prev coordinates for verlet integration
DEFPARTICLE_ATTRIBUTE(PREV_XYZ, 2);

// radius of particle
DEFPARTICLE_ATTRIBUTE(RADIUS, 3);

// rotation angle of particle
DEFPARTICLE_ATTRIBUTE(ROTATION, 4);

// rotation speed of particle
DEFPARTICLE_ATTRIBUTE(ROTATION_SPEED, 5);

// tint of particle
DEFPARTICLE_ATTRIBUTE(TINT_RGB, 6);

// alpha tint of particle
DEFPARTICLE_ATTRIBUTE(ALPHA, 7);

// creation time stamp (relative to particle system creation)
DEFPARTICLE_ATTRIBUTE(CREATION_TIME, 8);

// sequnece # (which animation sequence number this particle uses)
DEFPARTICLE_ATTRIBUTE(SEQUENCE_NUMBER, 9);

// length of the trail
DEFPARTICLE_ATTRIBUTE(TRAIL_LENGTH, 10);

// unique particle identifier
DEFPARTICLE_ATTRIBUTE(PARTICLE_ID, 11);

// unique rotation around up vector
DEFPARTICLE_ATTRIBUTE(YAW, 12);

// second sequnece # (which animation sequence number this particle uses)
DEFPARTICLE_ATTRIBUTE(SEQUENCE_NUMBER1, 13);

// hit box index
DEFPARTICLE_ATTRIBUTE(HITBOX_INDEX, 14);

DEFPARTICLE_ATTRIBUTE(HITBOX_RELATIVE_XYZ, 15);

*/

/**
 * TODO
 */
