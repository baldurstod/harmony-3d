import { Source2ParticleVectorField } from '../../enums';
import { Source2Particle } from '../../source2particle';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

export const DEFAULT_CHILD_GROUP_ID = 0;
export const DEFAULT_FIRST_CONTROL_POINT = 0;
export const DEFAULT_NUM_CONTROL_POINTS = 1;
export const DEFAULT_SET_ORIENTATION = false;
export const DEFAULT_ORIENTATION_FIELD = Source2ParticleVectorField.Disabled;
export const DEFAULT_NUM_BASED_ON_PARTICLE_COUNT = false;

export class SetPerChildControlPoint extends Operator {
	#childGroupID = DEFAULT_CHILD_GROUP_ID;
	#firstControlPoint = DEFAULT_FIRST_CONTROL_POINT;
	#numControlPoints = DEFAULT_NUM_CONTROL_POINTS;
	#setOrientation = DEFAULT_SET_ORIENTATION;//set orientation from velocity
	#orientationField = DEFAULT_ORIENTATION_FIELD;//orientation vector
	#numBasedOnParticleCount = DEFAULT_NUM_BASED_ON_PARTICLE_COUNT;

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_nChildGroupID':
				this.#childGroupID = param.getValueAsNumber() ?? DEFAULT_CHILD_GROUP_ID;
				break;
			case 'm_nFirstControlPoint':
				this.#firstControlPoint = param.getValueAsNumber() ?? DEFAULT_FIRST_CONTROL_POINT;
				break;
			case 'm_nNumControlPoints':
				this.#numControlPoints = param.getValueAsNumber() ?? DEFAULT_NUM_CONTROL_POINTS;
				break;
			case 'm_bSetOrientation':
				this.#setOrientation = param.getValueAsBool() ?? DEFAULT_SET_ORIENTATION;
				break;
			case 'm_nOrientationField':
				this.#orientationField = param.getValueAsNumber() ?? DEFAULT_ORIENTATION_FIELD;
				break;
			case 'm_bNumBasedOnParticleCount':
				this.#numBasedOnParticleCount = param.getValueAsBool() ?? DEFAULT_NUM_BASED_ON_PARTICLE_COUNT;
				break;
			case 'm_nParticleIncrement':
			case 'm_nFirstSourcePoint':
				//used in doOperate
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void {
		//TODO: use m_nChildGroupID
		//TODO: set m_bSetOrientation
		const particleIncrement = this.getParamScalarValue('m_nParticleIncrement') ?? 1;// TODO: check default value
		let particleId = this.getParamScalarValue('m_nFirstSourcePoint') ?? 0;// TODO: check default value


		const children = this.system.childSystems;
		let childId = this.#childGroupID;
		const cpId = particleId;
		let count = this.#numBasedOnParticleCount ? this.system.livingParticles.length : this.#numControlPoints;
		while (count--) {
			const child = children[childId];
			const sourceParticle = this.system.livingParticles[particleId];
			if (child && sourceParticle) {
				const childCp = child.getOwnControlPoint(this.#firstControlPoint);
				childCp.position = sourceParticle.position;
			}
			++childId;
			particleId += particleIncrement;
		}

	}
}
RegisterSource2ParticleOperator('C_OP_SetPerChildControlPoint', SetPerChildControlPoint);
