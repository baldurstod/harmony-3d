import { vec3, vec4 } from 'gl-matrix';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Operator } from '../operator';

const DEFAULT_POSITION = vec3.fromValues(128, 0, 0);
const v = vec3.create();
const tempVec4 = vec4.create();

export class SetSingleControlPointPosition extends Operator {
	useWorldLocation = false;
	setOnce = false;
	cp1 = 1;
	headLocation = 0;
	set = false;

	_paramChanged(paramName, value) {
		switch (paramName) {
			case 'm_vecCP1Pos':
				break;
			case 'm_bUseWorldLocation':
				this.useWorldLocation = value;
				break;
			case 'm_bSetOnce':
				this.setOnce = value;
				break;
			case 'm_nCP1':
				this.cp1 = Number(value);
				break;
			case 'm_nHeadLocation':
				this.headLocation = Number(value);
				break;
			default:
				super._paramChanged(paramName, value);
		}
	}

	reset() {
		this.set = false;
	}

	doOperate(particle, elapsedTime) {
		const cp1Pos = this.getParamVectorValue('m_vecCP1Pos', particle, tempVec4) ?? DEFAULT_POSITION;
		//TODO
		if (!this.setOnce || !this.set) {
			const cp = this.system.getOwnControlPoint(this.cp1);
			if (this.useWorldLocation) {
				cp.position = cp1Pos;
			} else {
				const headCp = this.system.getControlPoint(this.headLocation);
				vec3.transformQuat(v, cp1Pos, headCp.currentWorldQuaternion);
				vec3.add(v, v, headCp.currentWorldPosition);
				cp.position = v;
			}
			this.set = true;
		}
	}

	isPreEmission() {
		return true;
	}
}
RegisterSource2ParticleOperator('C_OP_SetSingleControlPointPosition', SetSingleControlPointPosition);
