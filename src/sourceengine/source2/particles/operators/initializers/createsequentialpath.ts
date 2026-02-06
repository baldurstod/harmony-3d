import { vec3 } from 'gl-matrix';
import { Source2Particle } from '../../source2particle';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Source2ParticlePathParams } from '../utils/pathparams';

const vec = vec3.create();

const DEFAULT_LOOP = true;
const DEFAULT_CP_PAIR = false;
const DEFAULT_SAVE_OFFSET = false;

export class CreateSequentialPath extends Operator {
	#loop = DEFAULT_LOOP;//restart behavior (0 = bounce, 1 = loop )
	#cpPairs = DEFAULT_CP_PAIR;//use sequential CP pairs between start and end point
	#saveOffset = DEFAULT_SAVE_OFFSET;
	#pathParams = new Source2ParticlePathParams();
	#t = 0;

	override _paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_bLoop':
				this.#loop = param.getValueAsBool() ?? DEFAULT_LOOP;
				break;
			case 'm_bCPPairs':
				this.#cpPairs = param.getValueAsBool() ?? DEFAULT_CP_PAIR;
				break;
			case 'm_bSaveOffset':
				this.#saveOffset = param.getValueAsBool() ?? DEFAULT_SAVE_OFFSET;
				break;
			case 'm_PathParams':
				Source2ParticlePathParams.fromOperatorParam(param, this.#pathParams);
				break;
			case 'm_fMaxDistance':
			case 'm_flNumToAssign':
				//used in doInit
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	override doInit(particle: Source2Particle): void {
		//TODO: use other parameters m_fMaxDistance, m_flNumToAssign
		// TODO: check if m_flNumToAssign is really computed real time
		const startControlPointNumber = this.#pathParams.startControlPointNumber;
		const endControlPointNumber = this.#pathParams.endControlPointNumber;

		const startControlPoint = this.system.getControlPoint(startControlPointNumber);
		const endControlPoint = this.system.getControlPoint(endControlPointNumber);

		if (startControlPoint && endControlPoint) {
			const delta = startControlPoint.deltaPosFrom(endControlPoint, vec);

			vec3.scale(delta, delta, this.#t);
			vec3.add(particle.position, startControlPoint.currentWorldPosition, delta);
			vec3.copy(particle.prevPosition, particle.position);
			//++this.sequence;
			//this.#t += this.step;
			if (this.#t > 1.0) {//TODO: handle loop
				this.#t = 0;
			}
		}
	}
}
//TODO Not sure what the difference is between v1 and v2 ?
RegisterSource2ParticleOperator('C_INIT_CreateSequentialPath', CreateSequentialPath);
RegisterSource2ParticleOperator('C_INIT_CreateSequentialPathV2', CreateSequentialPath);
