import { quat, vec3, vec4 } from 'gl-matrix';

import { WARN } from '../../../buildoptions.js';
import { clamp } from '../../../math/functions';
import { PARTICLE_FIELD_COLOR, PARTICLE_FIELD_SEQUENCE_NUMBER, PARTICLE_FIELD_POSITION, PARTICLE_FIELD_POSITION_PREVIOUS, PARTICLE_FIELD_SCRATCH_VECTOR, PARTICLE_FIELD_GLOW_RGB, PARTICLE_FIELD_GLOW_ALPHA, PARTICLE_FIELD_SCRATCH_FLOAT, PARTICLE_FIELD_TRAIL_LENGTH, PARTICLE_FIELD_SHADER_EXTRA_DATA_1, PARTICLE_FIELD_SHADER_EXTRA_DATA_2 } from '../../common/particles/particlefields.js';
import { PARTICLE_FIELD_HITBOX_OFFSET_POSITION } from '../../common/particles/particlefields.js';
import { DEG_TO_RAD } from '../../../math/constants';

export const DEFAULT_PARTICLE_NORMAL = vec3.fromValues(0, 0, 1);

export class Source2Particle {
	id;
	isAlive = false;
	position = vec3.create();
	quaternion = quat.create();
	prevPosition = vec3.create();
	velocity = vec3.create();
	color = vec4.create();
	initialColor = vec4.create();
	normal = vec3.create();
	scratchVec = vec3.create();//?
	scratch = 0;
	hitboxOffsetPosition = vec3.create();//?
	glowRGB = vec3.create();
	uMin = 0;
	uMax = 1;
	vMin = 0;
	vMax = 1;
	cTime = 0;
	context = new Map();
	system;
	currentTime;
	timeToLive;
	initialTimeToLive;
	proportionOfLife;
	trail;
	modelName;
	u;
	v;
	radius;
	initialRadius;
	rotationRoll;
	initialRoll;
	rotationSpeedRoll;
	rotationYaw;
	startAlpha;
	alpha;
	glowAlpha;
	sequence;
	initialSequence;
	sequence2;
	frame;
	PositionFromParentParticles;
	posLockedToCP;
	rotLockedToCP;
	trailLength;
	MovementRigidAttachToCP;


	static consoleAlphaAlternate;
	static consolePitch;

	constructor(id, system) {
		//this.name = 'Particle ' + id;
		//this.id = id;
		//this.cpPosition = vec3.create();
		//this.cpOrientation = quat.create();
		//this.cpOrientationInvert = quat.create();
		//this.cpPreviousTransform = mat4.create();//TODO: set this per particle list, not per particle
		//this.offsetPosition = vec3.create();
		this.system = system;
		this.reset(id);
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

	step(elapsedTime) {
		this.currentTime += elapsedTime;
		if (this.timeToLive) {
			this.proportionOfLife = this.currentTime / this.timeToLive;
		}
	}

	start() {
		this.isAlive = true;
		this.currentTime = 0;
		this.proportionOfLife = 0;
		this.trail = new Array();
	}

	die() {
		this.isAlive = false;
		this.modelName = '';
	}

	reset(id) {
		this.id = id;
		//this.firstRender = true;
		this.currentTime = 0;
		this.proportionOfLife = 0;
		this.timeToLive = 1;
		vec3.zero(this.position);
		vec3.zero(this.prevPosition);
		//vec3.zero(this.cpPosition);
		//vec4.zero(this.cpOrientation);
		//vec3.zero(this.offsetPosition);
		vec3.zero(this.velocity);
		vec4.set(this.color, 1, 1, 1, 1);
		vec4.set(this.initialColor, 1, 1, 1, 1);
		vec3.copy(this.normal, DEFAULT_PARTICLE_NORMAL);
		vec3.zero(this.scratchVec);
		this.scratch = 0;
		this.u = 0;
		this.v = 0;
		this.radius = 5;
		this.initialRadius = 5;
		this.rotationRoll = 0;
		this.initialRoll = 0;
		this.rotationSpeedRoll = 0;
		this.rotationYaw = 0;
		this.startAlpha = 1;
		this.alpha = this.startAlpha;
		this.glowAlpha = 1;
		// sequence number for animated textures
		this.sequence = 0;
		this.sequence2 = 0;
		this.frame = 0;
		this.PositionFromParentParticles = false;
		this.posLockedToCP = false;
		this.rotLockedToCP = false;
		this.trailLength = 0.1;
		this.MovementRigidAttachToCP = false;
		this.context.clear();
		//this.initialCPPosition = null;
		//this.initialCPQuaternion = null;
		//mat4.identity(this.cpPreviousTransform);
	}

	setInitialField(field, value, mulInitial) {
		this.setField(field, value, mulInitial, true);
	}

	setField(field = 0, value, mulInitial = false, setInitial = false, additive = false) {
		if (isNaN(field)) { return; }
		//console.log('Field ' + field + ' ' + value);

		switch (field) {
			case 0: // Position
				if (additive) {
					vec3.add(this.position, this.position, value);
				} else {
					vec3.copy(this.position, value);
				}
				if (setInitial) {
					vec3.copy(this.prevPosition, this.position);
				}
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
			//case 2: vector position ?
			case 3:
				if (mulInitial) {
					value *= this.initialRadius;
				}
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
				this.rotationSpeedRoll = value * DEG_TO_RAD;
				break;
			case 6: // Color
				if (mulInitial) {
					value[0] *= this.initialColor[0];
					value[1] *= this.initialColor[1];
					value[2] *= this.initialColor[2];
				}
				if (additive) {
					vec3.add((this.color as vec3), (this.color as vec3), value);
				} else {
					vec3.copy((this.color as vec3), value);
				}
				//this.color.setColor({r:value[0], g:value[1], b:value[2]});
				this.color[0] = clamp(this.color[0], 0.0, 1.0);
				this.color[1] = clamp(this.color[1], 0.0, 1.0);
				this.color[2] = clamp(this.color[2], 0.0, 1.0);
				//vec3.copy(this.color, this.color[);
				if (setInitial) {
					vec3.copy((this.initialColor as vec3), value);
					//this.initialColor.setColor({r:value[0], g:value[1], b:value[2]});
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
			case PARTICLE_FIELD_SEQUENCE_NUMBER:
				this.sequence = value << 0;
				break;
			case PARTICLE_FIELD_TRAIL_LENGTH:
				this.trailLength = value;
				break;
			case 12: // yaw
				if (value instanceof Float32Array) {
					value = value[0];
				}
				this.rotationYaw = value; //TODO
				break;
			case PARTICLE_FIELD_HITBOX_OFFSET_POSITION:
				vec3.copy(this.hitboxOffsetPosition, value);
				break;
			case 16:
				if (!Source2Particle.consoleAlphaAlternate) {
					console.warn('alpha alternate code me');
					Source2Particle.consoleAlphaAlternate = true;
				}
				break;
			case PARTICLE_FIELD_SCRATCH_VECTOR:
				vec3.copy(this.scratchVec, value);
				break;
			case PARTICLE_FIELD_SCRATCH_FLOAT:
				this.scratch = value;
				break
			case 20:
				if (!Source2Particle.consolePitch) {
					console.warn('pitch code me');
					Source2Particle.consolePitch = true;
				}
				break;
			case 21:
				//TODO
				vec3.copy(this.normal, value);
				break;
			case PARTICLE_FIELD_GLOW_RGB:
				vec3.copy(this.glowRGB, value);
				break;
			case PARTICLE_FIELD_GLOW_ALPHA:
				this.glowAlpha = value;
				break;
			case PARTICLE_FIELD_SHADER_EXTRA_DATA_1:
			case PARTICLE_FIELD_SHADER_EXTRA_DATA_2:
				//TODO
				break;
			default:
				if (WARN) {
					throw 'Unknown field ' + field;
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
	*/

	getField(field = 0, initial = false) {

		switch (field) {
			case PARTICLE_FIELD_POSITION:
				return this.position;
				break;
			case 1: // Time to live
				return initial ? this.initialTimeToLive : this.timeToLive;
				break;
			case PARTICLE_FIELD_POSITION_PREVIOUS:
				return this.prevPosition;
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
			case PARTICLE_FIELD_COLOR:
				return this.color;
				break;
			case 7:
				return this.alpha;
				break;
			case 8: //creation time
				return this.cTime;
				//return this.system.currentTime+1;
				break;
			case PARTICLE_FIELD_SEQUENCE_NUMBER:
				return this.sequence;
				break;
			case PARTICLE_FIELD_TRAIL_LENGTH:
				return this.trailLength;
				break;
			case 12: //yaw
				return this.rotationYaw;
				break;
			case PARTICLE_FIELD_HITBOX_OFFSET_POSITION:
				return this.hitboxOffsetPosition;
				break;
			case 16:
				if (!Source2Particle.consoleAlphaAlternate) {
					console.warn('alpha alternate code me');
					Source2Particle.consoleAlphaAlternate = true;
				}
				break;
			case PARTICLE_FIELD_SCRATCH_VECTOR:
				return this.scratchVec;
				break;
			case PARTICLE_FIELD_SCRATCH_FLOAT:
				return this.scratch;
				break;
			case 20:
				if (!Source2Particle.consolePitch) {
					console.warn('pitch code me');
					Source2Particle.consolePitch = true;
				}
				break;
			case 21:
				return this.normal;
				break;
			case PARTICLE_FIELD_GLOW_RGB:
				return this.glowRGB;
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
	setInitialSequence(sequence) {
		this.sequence = sequence;
		this.initialSequence = sequence;
	}

	/**
	* TODO
	*/
	setInitialRadius(radius) {
		this.radius = radius;
		this.initialRadius = radius;
	}
	/**
	* TODO
	*/
	setInitialTTL(timeToLive) {
		this.timeToLive = timeToLive;
		this.initialTimeToLive = timeToLive;
	}
	/**
	* TODO
	*/
	setInitialColor(color) {
		this.color = color;
		this.initialColor = color;
	}
	/**
	* Set particle initial rotation roll.
	* @param {Number} roll Initial rotation roll.
	*/
	setInitialRoll(roll) {
		this.rotationRoll = roll;
		this.initialRoll = roll;
	}


	/**
	* Get particle world position
	* @param {vec3|null} The receiving vector. Created if null.
	* @return {vec3} The world position.
	*/
	getWorldPos(worldPos) {
		worldPos = worldPos || vec3.create();
		//vec3.transformQuat(worldPos, this.position, this.cpOrientation);
		//vec3.transformQuat(worldPos, this.position, quat.create());

		//vec3.transformQuat(worldPos, this.position, this.system.currentOrientation);
		//vec3.transformQuat(worldPos, this.position, this.cpOrientation);
		//if (this.initialCPPosition) {
			//vec3.add(worldPos, worldPos, this.cpPosition);
		//}
		vec3.copy(worldPos, this.position);
		return worldPos;
	}

	/**
	* Get particle world position
	* @param {vec3|null} The receiving vector. Created if null.
	* @return {vec3} The world position.
	*/
	getLocalPos(worldPos) {
		worldPos = worldPos || vec3.create();
		//vec3.transformQuat(worldPos, this.position, this.cpOrientation);
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
