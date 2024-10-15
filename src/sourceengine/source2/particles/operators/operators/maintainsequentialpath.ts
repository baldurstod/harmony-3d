import { vec3 } from 'gl-matrix';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Operator } from '../operator';

let vec = vec3.create();

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

	_paramChanged(paramName, value) {
		switch (paramName) {
			case 'm_flNumToAssign':
				this.numToAssign = value;
				this.step = 1 / (value - 1);
				break;
			case 'm_bLoop':
				this.loop = value;
				break;
			case 'm_PathParams':
				for (let subName of Object.keys(value)) {
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

	doOperate(particles, elapsedTime) {
		let t = vec3.create();
		//TODO: use other parameters
		let startControlPointNumber = this.startControlPointNumber;
		let endControlPointNumber = this.endControlPointNumber;

		let startControlPoint = this.system.getControlPoint(startControlPointNumber);
		let endControlPoint = this.system.getControlPoint(endControlPointNumber);

		if (startControlPoint && endControlPoint) {
			let numToAssign = this.numToAssign;
			let assignedSoFar = this.assignedSoFar;

			let particle;
			let delta = startControlPoint.deltaPosFrom(endControlPoint, vec);
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
