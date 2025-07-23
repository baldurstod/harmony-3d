import { vec3 } from 'gl-matrix';
import { Source2Particle } from '../../source2particle';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

const v = vec3.create();

export class SetControlPointPositions extends Operator {
	useWorldLocation = false;
	orient = false;
	cp = [1, 2, 3, 4];
	cpPos: vec3[] = [vec3.fromValues(128, 0, 0), vec3.fromValues(0, 128, 0), vec3.fromValues(-128, 0, 0), vec3.fromValues(0, -128, 0)];
	headLocation = 0;
	setOnce: boolean = false;

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_bUseWorldLocation':
				this.useWorldLocation = param;
				break;
			case 'm_bOrient':
				this.orient = param;
				break;
			case 'm_bSetOnce':
				this.setOnce = param;
				break;
			case 'm_nCP1':
				this.cp[0] = (param);
				break;
			case 'm_nCP2':
				this.cp[1] = (param);
				break;
			case 'm_nCP3':
				this.cp[2] = (param);
				break;
			case 'm_nCP4':
				this.cp[3] = (param);
				break;
			case 'm_vecCP1Pos':
				vec3.copy(this.cpPos[0], param);
				break;
			case 'm_vecCP2Pos':
				vec3.copy(this.cpPos[1], param);
				break;
			case 'm_vecCP3Pos':
				vec3.copy(this.cpPos[2], param);
				break;
			case 'm_vecCP4Pos':
				vec3.copy(this.cpPos[3], param);
				break;
			case 'm_nHeadLocation':
				this.headLocation = (param);
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doOperate(particle: Source2Particle | Source2Particle[] | undefined | null, elapsedTime: number, strength: number) {
		//const list = ['First', 'Second', 'Third', 'Fourth'];

		const useWorldLocation = this.useWorldLocation;

		const vecControlPoint = this.system.getControlPointPosition(this.headLocation);

		let cpNumber;
		let cpLocation;

		const headLocation = this.system.getControlPoint(this.headLocation);

		for (let cpIndex = 0; cpIndex < 4; ++cpIndex) {
			cpNumber = this.cp[cpIndex];
			cpLocation = this.cpPos[cpIndex];

			const cp = this.system.getControlPoint(cpNumber);
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
