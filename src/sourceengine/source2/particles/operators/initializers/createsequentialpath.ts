import { vec3 } from 'gl-matrix';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';

const vec = vec3.create();

export class CreateSequentialPath extends Operator {
	numToAssign = 100;
	step = 0.01;
	loop = true;
	maxDistance = 0;
	cpPairs = false;
	saveOffset = false;
	startControlPointNumber = 0;
	endControlPointNumber = 0;
	bulgeControl = 0;
	bulge = 0;
	midPoint = 0.5;
	startPointOffset = vec3.create();
	midPointOffset = vec3.create();
	endOffset = vec3.create();
	t = 0;

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_flNumToAssign':
				this.numToAssign = param;
				this.step = 1 / param;
				break;
			case 'm_bLoop':
				this.loop = param;
				break;
			case 'm_PathParams':
				for (const subName of Object.keys(param)) {
					this._paramChanged(subName, param[subName]);
				}
				break;
			case 'm_fMaxDistance':
				this.maxDistance = param;
				break;
			case 'm_bCPPairs':
				this.cpPairs = param;
				break;
			case 'm_bSaveOffset':
				this.saveOffset = param;
				break;
			case 'm_nStartControlPointNumber':
				this.startControlPointNumber = (param);
				break;
			case 'm_nEndControlPointNumber':
				this.endControlPointNumber = (param);
				break;
			case 'm_nBulgeControl':
				this.bulgeControl = (param);
				break;
			case 'm_flBulge':
				this.bulge = param;
				break;
			case 'm_flMidPoint':
				this.midPoint = param;
				break;
			case 'm_vStartPointOffset':
				vec3.copy(this.startPointOffset, param);
				break;
			case 'm_vMidPointOffset':
				vec3.copy(this.midPointOffset, param);
				break;
			case 'm_vEndOffset':
				vec3.copy(this.endOffset, param);
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doInit(particle, elapsedTime) {
		//TODO: use other parameters
		const startControlPointNumber = this.startControlPointNumber;
		const endControlPointNumber = this.endControlPointNumber;

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
