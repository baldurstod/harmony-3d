import { vec3 } from 'gl-matrix';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Operator } from '../operator';

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

	_paramChanged(paramName, value) {
		switch (paramName) {
			case 'm_flNumToAssign':
				this.numToAssign = value;
				this.step = 1 / value;
				break;
			case 'm_bLoop':
				this.loop = value;
				break;
			case 'm_PathParams':
				for (const subName of Object.keys(value)) {
					this._paramChanged(subName, value[subName]);
				}
				break;
			case 'm_fMaxDistance':
				this.maxDistance = value;
				break;
			case 'm_bCPPairs':
				this.cpPairs = value;
				break;
			case 'm_bSaveOffset':
				this.saveOffset = value;
				break;
			case 'm_nStartControlPointNumber':
				this.startControlPointNumber = Number(value);
				break;
			case 'm_nEndControlPointNumber':
				this.endControlPointNumber = Number(value);
				break;
			case 'm_nBulgeControl':
				this.bulgeControl = Number(value);
				break;
			case 'm_flBulge':
				this.bulge = value;
				break;
			case 'm_flMidPoint':
				this.midPoint = value;
				break;
			case 'm_vStartPointOffset':
				vec3.copy(this.startPointOffset, value);
				break;
			case 'm_vMidPointOffset':
				vec3.copy(this.midPointOffset, value);
				break;
			case 'm_vEndOffset':
				vec3.copy(this.endOffset, value);
				break;
			default:
				super._paramChanged(paramName, value);
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
