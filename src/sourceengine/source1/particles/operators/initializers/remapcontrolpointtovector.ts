import { vec3 } from 'gl-matrix';

import { SourceEngineParticleOperators } from '../../sourceengineparticleoperators';
import { SourceEngineParticleOperator } from '../operator';
import { PARAM_TYPE_BOOL, PARAM_TYPE_INT, PARAM_TYPE_VECTOR } from '../../constants';

const tempVec3_1 = vec3.create();
const tempVec3_2 = vec3.create();
const tempVec3_3 = vec3.create();
const tempVec3_4 = vec3.create();
const tempVec3_5 = vec3.create();

const a = vec3.create();

export class RemapControlPointToVector extends SourceEngineParticleOperator {
	static functionName = 'remap control point to vector';
	constructor() {
		super();
		this.addParam('operator strength scale control point', PARAM_TYPE_INT, 1);
		this.addParam('input control point number', PARAM_TYPE_INT, 0);

		this.addParam('input minimum', PARAM_TYPE_VECTOR, vec3.create());
		this.addParam('input maximum', PARAM_TYPE_VECTOR, vec3.create());

		this.addParam('output minimum', PARAM_TYPE_VECTOR, vec3.create());
		this.addParam('output maximum', PARAM_TYPE_VECTOR, vec3.create());

		this.addParam('output field', PARAM_TYPE_INT, 1);

		this.addParam('output is scalar of initial random range', PARAM_TYPE_BOOL, 0);

				/*'operator strength scale control point' 'int' '16'
				'input control point number' 'int' '15'
				'input maximum' 'vector3' '255 255 255'
				'output field' 'int' '6'
				'output maximum' 'vector3' '1 1 1'*/
	}

	doInit(particle, elapsedTime) {
		const inputMinimum = this.getParameter('input minimum');
		const inputMaximum = this.getParameter('input maximum');
		const outputMinimum = this.getParameter('output minimum');
		const outputMaximum = this.getParameter('output maximum');
		const outputField = this.getParameter('output field');
		const cpNumber = this.getParameter('input control point number');
		const init = this.getParameter('output is scalar of initial random range');

		const cp = this.particleSystem.getControlPoint(cpNumber);
		if (cp) {
			const iDelta = vec3.sub(tempVec3_1, inputMaximum, inputMinimum);
			const oDelta = vec3.sub(tempVec3_2, outputMaximum, outputMinimum);
			const vDelta = vec3.sub(tempVec3_3, cp._position, inputMinimum);
			const v1Delta = vec3.div(tempVec3_4, vDelta, iDelta);

			const v2Delta = vec3.mul(tempVec3_5, v1Delta, oDelta);
			vec3.add(v2Delta, v2Delta,outputMinimum);

			particle.setInitialField(outputField, v2Delta, init);
		}
	}

	getInputValue(inputField, cpNumber) {
		console.log('Input field ' + inputField + ' ' + cpNumber);
		if (inputField==0||inputField==1||inputField==2) {
			const cp = this.particleSystem.getControlPoint(cpNumber);
			if (cp) {
				return cp.getWorldPosition(a)[inputField];
			}
		}
		return 0;
	}

	initMultipleOverride() {
		return true;
	}
}
SourceEngineParticleOperators.registerOperator(RemapControlPointToVector);
