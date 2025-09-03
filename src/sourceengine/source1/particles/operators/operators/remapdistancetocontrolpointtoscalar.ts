import { vec3 } from 'gl-matrix';
import { lerp, RemapValClamped } from '../../../../../math/functions';
import { PARAM_TYPE_BOOL, PARAM_TYPE_FLOAT, PARAM_TYPE_INT } from '../../constants';
import { SourceEngineParticle } from '../../particle';
import { SourceEngineParticleOperators } from '../../source1particleoperators';
import { SourceEngineParticleSystem } from '../../source1particlesystem';
import { SourceEngineParticleOperator } from '../operator';

const tempVec3 = vec3.create();

export class RemapDistanceToControlPointToScalar extends SourceEngineParticleOperator {
	static functionName = 'Remap Distance to Control Point to Scalar';

	constructor(system: SourceEngineParticleSystem) {
		super(system);
		this.addParam('control point', PARAM_TYPE_INT, 0);
		this.addParam('distance fade range', PARAM_TYPE_INT, 0);

		this.addParam('distance minimum', PARAM_TYPE_FLOAT, 0);
		this.addParam('distance maximum', PARAM_TYPE_FLOAT, 128);

		this.addParam('output minimum', PARAM_TYPE_FLOAT, 0);
		this.addParam('output maximum', PARAM_TYPE_FLOAT, 1);

		this.addParam('output field', PARAM_TYPE_INT, 1);
		this.addParam('output is scalar of initial random range', PARAM_TYPE_BOOL, 0);
		this.addParam('only active within specified distance', PARAM_TYPE_BOOL, 0);
	}

	doOperate(particle: SourceEngineParticle, elapsedTime: number) {
		const cpNumber = this.getParameter('control point');
		const dMin = this.getParameter('distance minimum');
		const dMax = this.getParameter('distance maximum');

		const oMin = this.getParameter('output minimum');
		const oMax = this.getParameter('output maximum');

		const field = this.getParameter('output field');
		const init = this.getParameter('output is scalar of initial random range');

		const active = this.getParameter('only active within specified distance');

		const cp = this.particleSystem.getControlPoint(cpNumber);
		if (cp) {
			const delta = vec3.subtract(tempVec3, cp.getWorldPosition(tempVec3), particle.position);
			const deltaL = vec3.length(delta);

			if (active && ((deltaL < dMin) || (deltaL > dMax))) {
				return;
			}
			const output = RemapValClamped(deltaL, dMin, dMax, oMin, oMax);//(deltaL-dMin)/(dMax-dMin) * (oMax-oMin) + oMin;
			const strength = this.getOperatorStrength();

			if (strength == 1) {
				particle.setField(field, output, init);//TODO
			} else {
				const value = particle.getField(field);
				particle.setField(field, lerp(value, output, strength), init);//TODO
			}
		}
	}
}
SourceEngineParticleOperators.registerOperator(RemapDistanceToControlPointToScalar);


/*
					'id' 'elementid' '141980ed-af1c-4ffb-9890-b42e39fc0d28'
					'name' 'string' 'Remap Distance to Control Point to Scalar'
					'functionName' 'string' 'Remap Distance to Control Point to Scalar'
					'operator start fadein' 'float' '0'
					'operator end fadein' 'float' '0'
					'operator start fadeout' 'float' '0'
					'operator end fadeout' 'float' '0'
					'operator fade oscillate' 'float' '0'
					'distance minimum' 'float' '0'
					'distance maximum' 'float' '200'
					'output field' 'int' '1'
					'output minimum' 'float' '1'
					'output maximum' 'float' '0'
					'control point' 'int' '0'
					'ensure line of sight' 'bool' '0'
					'LOS collision group' 'string' 'NONE'
					'Maximum Trace Length' 'float' '-1'
					'LOS Failure Scalar' 'float' '0'
					'output is scalar of initial random range' 'bool' '1'
					'only active within specified distance' 'bool' '0'
					*/
