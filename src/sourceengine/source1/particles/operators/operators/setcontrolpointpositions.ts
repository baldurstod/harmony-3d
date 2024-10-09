import { quat, vec3 } from 'gl-matrix';

import { SourceEngineParticleOperators } from '../../sourceengineparticleoperators';
import { SourceEngineParticleOperator } from '../operator';
import { PARAM_TYPE_BOOL, PARAM_TYPE_FLOAT, PARAM_TYPE_INT, PARAM_TYPE_VECTOR3 } from '../../constants';

const tempVec3 = vec3.create();

export class SetControlPointPositions extends SourceEngineParticleOperator {
	static functionName = 'set control point positions';
	constructor() {
		super();
		this.addParam('Control Point to offset positions from', PARAM_TYPE_INT, 0);
		this.addParam('Set positions in world space', PARAM_TYPE_BOOL, false);
		this.addParam('Control Point to offset positions from', PARAM_TYPE_INT, 0);
		this.addParam('Control Point to offset positions from', PARAM_TYPE_INT, 0);
		this.addParam('Control Point to offset positions from', PARAM_TYPE_INT, 0);

		this.addParam('First Control Point Location', PARAM_TYPE_VECTOR3, vec3.fromValues(128, 0, 0));
		this.addParam('First Control Point Number', PARAM_TYPE_INT, 1);
		this.addParam('First Control Point Parent', PARAM_TYPE_INT, 0);

		this.addParam('Second Control Point Location', PARAM_TYPE_VECTOR3, vec3.fromValues(0, 128, 0));
		this.addParam('Second Control Point Number', PARAM_TYPE_INT, 2);
		this.addParam('Second Control Point Parent', PARAM_TYPE_INT, 0);

		this.addParam('Third Control Point Location', PARAM_TYPE_VECTOR3, vec3.fromValues(-128, 0, 0));
		this.addParam('Third Control Point Number', PARAM_TYPE_INT, 3);
		this.addParam('Third Control Point Parent', PARAM_TYPE_INT, 0);

		this.addParam('Fourth Control Point Location', PARAM_TYPE_VECTOR3, vec3.fromValues(0, -128, 0));
		this.addParam('Fourth Control Point Number', PARAM_TYPE_INT, 4);
		this.addParam('Fourth Control Point Parent', PARAM_TYPE_INT, 0);
	}

	doOperate(particle) {
		const list = ['First', 'Second', 'Third', 'Fourth'];

		const useWorldLocation = this.getParameter('Set positions in world space');
		const headLocation = this.getParameter('Control Point to offset positions from');

		const vecControlPoint = this.particleSystem.getControlPointPosition(headLocation);

		for (let cpIndex = 0; cpIndex < 4; ++cpIndex) {
			const name = list[cpIndex];
			const cpNumber = this.getParameter(name + ' Control Point Number');
			if (cpNumber == headLocation) {
				continue;
			}
			const cpParent = this.getParameter(name + ' Control Point Parent');
			const cpLocation = this.getParameter(name + ' Control Point Location');
			if (!useWorldLocation) {
				const a = vec3.add(tempVec3, cpLocation, vecControlPoint);
				this.particleSystem.setControlPointPosition(cpNumber, a);
			} else {
				this.particleSystem.setControlPointPosition(cpNumber, cpLocation);
			}
			let controlPoint = this.particleSystem.getControlPoint(cpNumber);
			if (controlPoint) {
				controlPoint.setWorldQuaternion(quat.create());
			}
			this.particleSystem.setControlPointParent(cpNumber, cpParent);
		}
	}
}
SourceEngineParticleOperators.registerOperator(SetControlPointPositions);
