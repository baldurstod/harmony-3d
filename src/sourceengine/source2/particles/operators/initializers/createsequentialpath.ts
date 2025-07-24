import { vec3 } from 'gl-matrix';
import { Source2ParticlePathParams } from '../utils/pathparams';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Source2Particle } from '../../source2particle';

const vec = vec3.create();

export class CreateSequentialPath extends Operator {
	numToAssign = 100;
	step = 0.01;
	loop = true;
	maxDistance = 0;
	cpPairs = false;
	saveOffset = false;
	/*
	startControlPointNumber = 0;
	endControlPointNumber = 0;
	bulgeControl = 0; => path
	bulge = 0;
	*/
	midPoint = 0.5;
	startPointOffset = vec3.create();
	midPointOffset = vec3.create();
	endOffset = vec3.create();
	t = 0;
	#pathParams = new Source2ParticlePathParams();

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_flNumToAssign':
				console.error('do this param', paramName, param, this.constructor.name);
				this.numToAssign = param;
				this.step = 1 / param;
				break;
			case 'm_bLoop':
				console.error('do this param', paramName, param, this.constructor.name);
				this.loop = param;
				break;
			case 'm_PathParams':
				console.error('do this param', paramName, param, this.constructor.name);
				Source2ParticlePathParams.fromOperatorParam(param, this.#pathParams);
				break;
			case 'm_fMaxDistance':
				console.error('do this param', paramName, param, this.constructor.name);
				this.maxDistance = param;
				break;
			case 'm_bCPPairs':
				console.error('do this param', paramName, param, this.constructor.name);
				this.cpPairs = param;
				break;
			case 'm_bSaveOffset':
				console.error('do this param', paramName, param, this.constructor.name);
				this.saveOffset = param;
				break;
			case 'm_nStartControlPointNumber':
				console.error('do this param', paramName, param, this.constructor.name);
				this.startControlPointNumber = (param);
				break;
			case 'm_nEndControlPointNumber':
				console.error('do this param', paramName, param, this.constructor.name);
				this.endControlPointNumber = (param);
				break;
			case 'm_nBulgeControl':
				console.error('do this param', paramName, param, this.constructor.name);
				this.bulgeControl = (param);
				break;
			case 'm_flBulge':
				console.error('do this param', paramName, param, this.constructor.name);
				this.bulge = param;
				break;
			case 'm_flMidPoint':
				console.error('do this param', paramName, param, this.constructor.name);
				this.midPoint = param;
				break;
			case 'm_vStartPointOffset':
				console.error('do this param', paramName, param, this.constructor.name);
				vec3.copy(this.startPointOffset, param);
				break;
			case 'm_vMidPointOffset':
				console.error('do this param', paramName, param, this.constructor.name);
				vec3.copy(this.midPointOffset, param);
				break;
			case 'm_vEndOffset':
				console.error('do this param', paramName, param, this.constructor.name);
				vec3.copy(this.endOffset, param);
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doInit(particle: Source2Particle, elapsedTime: number, strength: number): void {
		//TODO: use other parameters
		const startControlPointNumber = this.#pathParams.startControlPointNumber;
		const endControlPointNumber = this.#pathParams.endControlPointNumber;

		const startControlPoint = this.system.getControlPoint(startControlPointNumber);
		const endControlPoint = this.system.getControlPoint(endControlPointNumber);

		if (startControlPoint && endControlPoint) {
			const numToAssign = this.numToAssign;
			const delta = startControlPoint.deltaPosFrom(endControlPoint, vec);

			vec3.scale(delta, delta, this.t);
			vec3.add(particle.position, startControlPoint.currentWorldPosition, delta);
			vec3.copy(particle.prevPosition, particle.position);
			//++this.sequence;
			this.t += this.step;
			if (this.t > 1.0) {//TODO: handle loop
				this.t = 0;
			}
		}
	}
}
//TODO Not sure what the difference is between v1 and v2 ?
RegisterSource2ParticleOperator('C_INIT_CreateSequentialPath', CreateSequentialPath);
RegisterSource2ParticleOperator('C_INIT_CreateSequentialPathV2', CreateSequentialPath);
