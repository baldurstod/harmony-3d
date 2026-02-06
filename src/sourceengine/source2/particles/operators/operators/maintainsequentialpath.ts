import { vec3 } from 'gl-matrix';
import { Source2Particle } from '../../source2particle';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Source2ParticlePathParams } from '../utils/pathparams';

const vec = vec3.create();


const DEFAULT_NUM_TO_ASSIGN = 100;// TODO: check default value
const DEFAULT_LOOP = true;// TODO: check default value
const DEFAULT_MAX_DISTANCE = 0;// TODO: check default value
const DEFAULT_SAVE_OFFSET = false;// TODO: check default value
const DEFAULT_CP_PAIRS = false;// TODO: check default value
const DEFAULT_MID_POINT = 0.5;// TODO: check default value

export class MaintainSequentialPath extends Operator {
	#numToAssign = DEFAULT_NUM_TO_ASSIGN;
	assignedSoFar = 0;
	#step = 0.01;
	loop = DEFAULT_LOOP;
	bounceDirection = 1;
	#maxDistance = DEFAULT_MAX_DISTANCE;
	cpPairs = DEFAULT_CP_PAIRS;
	#saveOffset = DEFAULT_SAVE_OFFSET;
	#midPoint = DEFAULT_MID_POINT;
	#startPointOffset = vec3.create();// TODO: check default value
	#midPointOffset = vec3.create();// TODO: check default value
	#endOffset = vec3.create();// TODO: check default value
	operateAllParticlesRemoveme = true as const;
	#pathParams = new Source2ParticlePathParams();

	override _paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_flNumToAssign':
				this.#numToAssign = param.getValueAsNumber() ?? DEFAULT_NUM_TO_ASSIGN;
				this.#step = 1 / (this.#numToAssign - 1);
				break;
			case 'm_bLoop':
				this.loop = param.getValueAsBool() ?? DEFAULT_LOOP;
				break;
			case 'm_PathParams':
				Source2ParticlePathParams.fromOperatorParam(param, this.#pathParams);
				break;
			case 'm_fMaxDistance':
				this.#maxDistance = param.getValueAsNumber() ?? DEFAULT_MAX_DISTANCE;
				break;
			case 'm_bCPPairs':
				this.cpPairs = param.getValueAsBool() ?? DEFAULT_CP_PAIRS;
				break;
			case 'm_bSaveOffset':
				this.#saveOffset = param.getValueAsBool() ?? DEFAULT_SAVE_OFFSET;
				break;
			case 'm_flMidPoint':
				this.#midPoint = param.getValueAsNumber() ?? DEFAULT_MID_POINT;
				break;
			case 'm_vStartPointOffset':
				param.getValueAsVec3(this.#startPointOffset);
				break;
			case 'm_vMidPointOffset':
				param.getValueAsVec3(this.#midPointOffset);
				break;
			case 'm_vEndOffset':
				param.getValueAsVec3(this.#endOffset);
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doOperate(particles: Source2Particle[]): void {
		const t = vec3.create();
		//TODO: use other parameters
		const startControlPointNumber = this.#pathParams.startControlPointNumber;
		const endControlPointNumber = this.#pathParams.endControlPointNumber;

		const startControlPoint = this.system.getControlPoint(startControlPointNumber);
		const endControlPoint = this.system.getControlPoint(endControlPointNumber);

		if (startControlPoint && endControlPoint) {
			const numToAssign = this.#numToAssign;
			let assignedSoFar = this.assignedSoFar;

			//let particle;
			const delta = startControlPoint.deltaPosFrom(endControlPoint, vec);
			for (const particle of particles) {

				vec3.scale(t, delta, assignedSoFar * this.#step);
				vec3.add(particle.position, startControlPoint.currentWorldPosition, t);
				vec3.copy(particle.prevPosition, particle.position);

				assignedSoFar += this.bounceDirection;
				if (assignedSoFar >= numToAssign || assignedSoFar < 0) {
					if (this.loop) {
						assignedSoFar = 0;
						this.bounceDirection = 1;
					} else {
						this.bounceDirection = -this.bounceDirection;
					}
				}
			}
			this.assignedSoFar = assignedSoFar;
		}
	}
}
RegisterSource2ParticleOperator('C_OP_MaintainSequentialPath', MaintainSequentialPath);
