import { vec3 } from 'gl-matrix';
import { TESTING } from '../../../../../buildoptions';
import { PARTICLE_FIELD_POSITION } from '../../../../common/particles/particlefields';
import { ATTRIBUTE_NAME_PER_FIELD } from '../../particleconstants';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Source2Particle } from '../../source2particle';

/*
export const PARTICLE_FIELD_LIFETIME = 1;
export const PARTICLE_FIELD_POSITION_PREVIOUS = 2;
export const PARTICLE_FIELD_RADIUS = 3;
export const PARTICLE_FIELD_ROTATION_ROLL = 4;
export const PARTICLE_FIELD_ROTATION_ROLL_SPEED = 5;
export const PARTICLE_FIELD_COLOR = 6;
export const PARTICLE_FIELD_ALPHA = 7;
export const PARTICLE_FIELD_CREATION_TIME = 8;
export const PARTICLE_FIELD_SEQUENCE_NUMBER = 9;
export const PARTICLE_FIELD_TRAIL_LENGTH = 10;
export const PARTICLE_FIELD_PARTICLE_ID = 11;
export const PARTICLE_FIELD_YAW = 12;
export const PARTICLE_FIELD_SEQUENCE_NUMBER_2 = 13;
export const PARTICLE_FIELD_HITBOX_INDEX = 14;
export const PARTICLE_FIELD_HITBOX_OFFSET_POSITION = 15;
export const PARTICLE_FIELD_ALPHA_ALTERNATE = 16;
export const PARTICLE_FIELD_SCRATCH_VECTOR = 17;
export const PARTICLE_FIELD_SCRATCH_FLOAT = 18;
export const PARTICLE_FIELD_NONE = 19;
export const PARTICLE_FIELD_PITCH = 20;
export const PARTICLE_FIELD_NORMAL = 21;
export const PARTICLE_FIELD_GLOW_RGB = 22;
export const PARTICLE_FIELD_GLOW_ALPHA = 23;
export const PARTICLE_FIELD_SCRATCH_FLOAT_1 = 26;
export const PARTICLE_FIELD_SCRATCH_FLOAT_2 = 27;
export const PARTICLE_FIELD_SCRATCH_VECTOR2 = 30;
export const PARTICLE_FIELD_BONE_INDICE = 31;
export const PARTICLE_FIELD_BONE_WEIGHT = 32;
export const PARTICLE_FIELD_PARENT_PARTICLE_INDEX = 33;
export const PARTICLE_FIELD_FORCE_SCALE = 34;
export const PARTICLE_FIELD_MANUAL_ANIMATION_FRAME = 38;
export const PARTICLE_FIELD_SHADER_EXTRA_DATA_1 = 39;
export const PARTICLE_FIELD_SHADER_EXTRA_DATA_2 = 40;
*/
const v = vec3.create();

const DEFAULT_ATTRIBUTE_TO_READ = -1;// TODO: check default value
const DEFAULT_ATTRIBUTE_TO_WRITE = PARTICLE_FIELD_POSITION;// TODO: check default value
const DEFAULT_LOCAL_SPACE_CP = 0;// TODO: check default value
const DEFAULT_RANDOM = false;// TODO: check default value
const DEFAULT_REVERSE = false;// TODO: check default value
const DEFAULT_RANDOM_SEED = 0;// TODO: check default value
const DEFAULT_LOCAL_SPACE_ANGLES = false;// TODO: check default value

export class InitFromCPSnapshot extends Operator {
	#attributeToRead = DEFAULT_ATTRIBUTE_TO_READ;
	#attributeToWrite = DEFAULT_ATTRIBUTE_TO_WRITE;
	#localSpaceCP = DEFAULT_LOCAL_SPACE_CP;
	#random = DEFAULT_RANDOM;
	#reverse = DEFAULT_REVERSE;
	#randomSeed = DEFAULT_RANDOM_SEED;
	#localSpaceAngles = DEFAULT_LOCAL_SPACE_ANGLES;

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_nAttributeToRead':
				this.#attributeToRead = param.getValueAsNumber() ?? DEFAULT_ATTRIBUTE_TO_READ;
				break;
			case 'm_nAttributeToWrite':
				this.#attributeToWrite = param.getValueAsNumber() ?? DEFAULT_ATTRIBUTE_TO_WRITE;
				break;
			case 'm_nLocalSpaceCP':
				this.#localSpaceCP = param.getValueAsNumber() ?? DEFAULT_LOCAL_SPACE_CP;
				break;
			case 'm_bRandom':
				this.#random = param.getValueAsBool() ?? DEFAULT_RANDOM;
				break;
			case 'm_bReverse':
				this.#reverse = param.getValueAsBool() ?? DEFAULT_REVERSE;
				break;
			case 'm_nRandomSeed':
				this.#randomSeed = param.getValueAsNumber() ?? DEFAULT_RANDOM_SEED;
				break;
			case 'm_bLocalSpaceAngles':
				this.#localSpaceAngles = param.getValueAsBool() ?? DEFAULT_LOCAL_SPACE_ANGLES;
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doInit(particle: Source2Particle, elapsedTime: number, strength: number): void {
		if (this.#attributeToRead == -1) {
			return;
		}

		const system = this.system;
		const snapshot = system.getControlPoint(this.controlPointNumber)?.snapshot;
		if (snapshot) {
			const attributeToReadName = ATTRIBUTE_NAME_PER_FIELD[this.#attributeToRead]!;//TODO: check this.#attributeToRead range
			if (TESTING && attributeToReadName === undefined) {
				throw 'Unknown field';
			}
			const attributeToRead = snapshot.attributes[attributeToReadName];
			if (attributeToRead) {
				let id;
				if (this.#random) {
					id = (snapshot.particleCount * Math.random() << 0) % snapshot.particleCount;
				} else {
					id = (particle.id - 1) % snapshot.particleCount;
				}
				if (this.#attributeToWrite == PARTICLE_FIELD_POSITION) {
					const localSpaceCP = system.getControlPoint(this.#localSpaceCP);
					if (localSpaceCP) {
						//TODO: check attributeToRead[id] is actually a vector
						//TODO: only transform position when this.localSpaceAngles = true
						if (true || this.#localSpaceAngles) {
							vec3.transformMat4(v, attributeToRead[id], localSpaceCP.currentWorldTransformation);
						} else {
							vec3.add(v, attributeToRead[id], localSpaceCP.currentWorldPosition);
						}
						particle.setInitialField(this.#attributeToWrite, v);
					}
				} else {
					particle.setInitialField(this.#attributeToWrite, attributeToRead[id]);
				}
			}
		}
	}
}
RegisterSource2ParticleOperator('C_INIT_InitFromCPSnapshot', InitFromCPSnapshot);
