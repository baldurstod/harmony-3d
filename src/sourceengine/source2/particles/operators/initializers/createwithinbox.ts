import { quat, vec3 } from 'gl-matrix';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Operator } from '../operator';
import { vec3RandomBox } from '../../../../../math/functions';
import { Source2Particle } from '../../source2particle';

const tempQuat = quat.create();
const tempVec3 = vec3.create();
const tempVec3_2 = vec3.create();

export class CreateWithinBox extends Operator {
	vecMin = vec3.create();
	vecMax = vec3.create();
	localSpace = false;
	scaleCP = -1;

	_paramChanged(paramName: string, value: any) {
		switch (paramName) {
			case 'm_vecMin':
				vec3.copy(this.vecMin, value);
				break;
			case 'm_vecMax':
				vec3.copy(this.vecMax, value);
				break;
			case 'm_bLocalSpace':
				this.localSpace = value;
				break;
			case 'm_nScaleCP':
				this.scaleCP = Number(value);
				break;
			default:
				super._paramChanged(paramName, value);
		}
	}

	doInit(particle: Source2Particle, elapsedTime: number) {
		vec3RandomBox(tempVec3, this.vecMin, this.vecMax);
		if (this.scaleCP !== -1) {
			const scaleCp = this.system.getControlPointForScale(this.scaleCP);
			if (scaleCp) {
				scaleCp.getWorldPosition(tempVec3_2);
				vec3.scale(tempVec3, tempVec3, tempVec3_2[0]);//x position of the scale cp is used as scaling
			}
		}

		const controlPoint = this.system.getControlPoint(this.controlPointNumber);
		if (controlPoint) {
			controlPoint.getWorldPosition(tempVec3_2);
			if (this.localSpace) {
				vec3.transformQuat(tempVec3, tempVec3, controlPoint.getWorldQuaternion(tempQuat));
				vec3.add(tempVec3, tempVec3, tempVec3_2);
			} else {
				vec3.add(tempVec3, tempVec3, tempVec3_2);
			}
		}
		vec3.copy(particle.position, tempVec3);
		vec3.copy(particle.prevPosition, tempVec3);
	}
}
RegisterSource2ParticleOperator('C_INIT_CreateWithinBox', CreateWithinBox);
