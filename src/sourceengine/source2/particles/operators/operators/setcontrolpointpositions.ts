import { vec3 } from 'gl-matrix';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Operator } from '../operator';

const v = vec3.create();

export class SetControlPointPositions extends Operator {
	useWorldLocation = false;
	orient = false;
	cp = [1, 2, 3, 4];
	cpPos: Array<vec3> = [vec3.fromValues(128, 0, 0), vec3.fromValues(0, 128, 0), vec3.fromValues(-128, 0, 0), vec3.fromValues(0, -128, 0)];
	headLocation = 0;
	setOnce: boolean;

	_paramChanged(paramName, value) {
		switch (paramName) {
			case 'm_bUseWorldLocation':
				this.useWorldLocation = value;
				break;
			case 'm_bOrient':
				this.orient = value;
				break;
			case 'm_bSetOnce':
				this.setOnce = value;
				break;
			case 'm_nCP1':
				this.cp[0] = Number(value);
				break;
			case 'm_nCP2':
				this.cp[1] = Number(value);
				break;
			case 'm_nCP3':
				this.cp[2] = Number(value);
				break;
			case 'm_nCP4':
				this.cp[3] = Number(value);
				break;
			case 'm_vecCP1Pos':
				vec3.copy(this.cpPos[0], value);
				break;
			case 'm_vecCP2Pos':
				vec3.copy(this.cpPos[1], value);
				break;
			case 'm_vecCP3Pos':
				vec3.copy(this.cpPos[2], value);
				break;
			case 'm_vecCP4Pos':
				vec3.copy(this.cpPos[3], value);
				break;
			case 'm_nHeadLocation':
				this.headLocation = Number(value);
				break;
			default:
				super._paramChanged(paramName, value);
		}
	}

	doOperate(particle, elapsedTime) {
		//const list = ['First', 'Second', 'Third', 'Fourth'];

		const useWorldLocation = this.useWorldLocation;

		const vecControlPoint = this.system.getControlPointPosition(this.headLocation);

		let cpNumber;
		let cpLocation;

		let headLocation = this.system.getControlPoint(this.headLocation);

		for (let cpIndex = 0; cpIndex < 4; ++cpIndex) {
			cpNumber = this.cp[cpIndex];
			cpLocation = this.cpPos[cpIndex];

			let cp = this.system.getControlPoint(cpNumber);
			if (!useWorldLocation) {
				vec3.transformQuat(v, cpLocation, headLocation.currentWorldQuaternion);
				vec3.add(v, v, headLocation.currentWorldPosition);
				cp.position = v;
			} else {
				cp.position = cpLocation;
				this.system.setControlPointPosition(cpNumber, cpLocation);
			}
		}
	}

	isPreEmission() {
		return true;
	}
}
RegisterSource2ParticleOperator('C_OP_SetControlPointPositions', SetControlPointPositions);
