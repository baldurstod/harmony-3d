import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Operator } from '../operator';

export class SetPerChildControlPoint extends Operator {
	childGroupID = 0;
	firstControlPoint = 0;
	numControlPoints = 1;
	setOrientation = false;
	numBasedOnParticleCount = false;

	_paramChanged(paramName, value) {
		switch (paramName) {
			case 'm_nChildGroupID':
				this.childGroupID = Number(value);
				break;
			case 'm_nFirstControlPoint':
				this.firstControlPoint = Number(value);
				break;
			case 'm_nNumControlPoints':
				this.numControlPoints = Number(value);
				break;
			case 'm_nParticleIncrement':
			case 'm_nFirstSourcePoint':
				break;
			case 'm_bSetOrientation':
				this.setOrientation = value;
				break;
			case 'm_bNumBasedOnParticleCount':
				this.numBasedOnParticleCount = value;
				break;
			default:
				super._paramChanged(paramName, value);
		}
	}

	doOperate(particle, elapsedTime) {
		//TODO: set m_bSetOrientation
		let particleIncrement = this.getParamScalarValue('m_nParticleIncrement') ?? 1;
		let particleId = this.getParamScalarValue('m_nFirstSourcePoint') ?? 0;


		let children = this.system.childSystems;
		let childId = this.childGroupID;
		let cpId = particleId;
		let count = this.numBasedOnParticleCount ? this.system.livingParticles.length : this.numControlPoints;
		while (count--) {
			let child = children[childId];
			let sourceParticle = this.system.livingParticles[particleId];
			if (child && sourceParticle) {
				let childCp = child.getOwnControlPoint(this.firstControlPoint);
				childCp.position = sourceParticle.position;
			}
			++childId;
			particleId += particleIncrement;
		}

	}
}
RegisterSource2ParticleOperator('C_OP_SetPerChildControlPoint', SetPerChildControlPoint);
