import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

export class SetPerChildControlPoint extends Operator {
	childGroupID = 0;
	firstControlPoint = 0;
	numControlPoints = 1;
	setOrientation = false;
	numBasedOnParticleCount = false;

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_nChildGroupID':
				this.childGroupID = (param);
				break;
			case 'm_nFirstControlPoint':
				this.firstControlPoint = (param);
				break;
			case 'm_nNumControlPoints':
				this.numControlPoints = (param);
				break;
			case 'm_nParticleIncrement':
			case 'm_nFirstSourcePoint':
				break;
			case 'm_bSetOrientation':
				this.setOrientation = param;
				break;
			case 'm_bNumBasedOnParticleCount':
				this.numBasedOnParticleCount = param;
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doOperate(particle, elapsedTime) {
		//TODO: set m_bSetOrientation
		const particleIncrement = this.getParamScalarValue('m_nParticleIncrement') ?? 1;
		let particleId = this.getParamScalarValue('m_nFirstSourcePoint') ?? 0;


		const children = this.system.childSystems;
		let childId = this.childGroupID;
		const cpId = particleId;
		let count = this.numBasedOnParticleCount ? this.system.livingParticles.length : this.numControlPoints;
		while (count--) {
			const child = children[childId];
			const sourceParticle = this.system.livingParticles[particleId];
			if (child && sourceParticle) {
				const childCp = child.getOwnControlPoint(this.firstControlPoint);
				childCp.position = sourceParticle.position;
			}
			++childId;
			particleId += particleIncrement;
		}

	}
}
RegisterSource2ParticleOperator('C_OP_SetPerChildControlPoint', SetPerChildControlPoint);
