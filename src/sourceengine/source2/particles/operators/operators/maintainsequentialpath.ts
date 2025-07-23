import { vec3 } from 'gl-matrix';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

const vec = vec3.create();

export class MaintainSequentialPath extends Operator {
	numToAssign = 100;
	assignedSoFar = 0;
	step = 0.01;
	loop = true;
	bounceDirection = 1;
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
	operateAllParticlesRemoveme = true;

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_flNumToAssign':
				this.numToAssign = param;
				this.step = 1 / (param - 1);
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

	doOperate(particles, elapsedTime) {
		const t = vec3.create();
		//TODO: use other parameters
		const startControlPointNumber = this.startControlPointNumber;
		const endControlPointNumber = this.endControlPointNumber;

		const startControlPoint = this.system.getControlPoint(startControlPointNumber);
		const endControlPoint = this.system.getControlPoint(endControlPointNumber);

		if (startControlPoint && endControlPoint) {
			const numToAssign = this.numToAssign;
			let assignedSoFar = this.assignedSoFar;

			let particle;
			const delta = startControlPoint.deltaPosFrom(endControlPoint, vec);
			for (let i = 0; i < particles.length; ++i) {
				particle = particles[i];

				vec3.scale(t, delta, assignedSoFar * this.step);
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
