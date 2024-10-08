import { SourceEngineParticleOperators } from '../../sourceengineparticleoperators';
import { SourceEngineParticleOperator } from '../operator';
import { PARAM_TYPE_BOOL, PARAM_TYPE_INT, PARAM_TYPE_FLOAT } from '../../constants';
import { TESTING } from '../../../../../buildoptions';

export class RemapNoiseToScalar extends SourceEngineParticleOperator {
	static functionName = 'remap noise to scalar';
	constructor() {
		super();
		if (TESTING) {
			console.error('Fix this operator');
		}
		this.addParam('output field', PARAM_TYPE_INT, 0);
		this.addParam('output minimum', PARAM_TYPE_FLOAT, 0);
		this.addParam('output maximum', PARAM_TYPE_FLOAT, 0);
	}

	doInit(particle, elapsedTime) {
		const field = this.getParameter('output field') || 1;
		const minimum = this.getParameter('output minimum') || 0.0;
		const maximum = this.getParameter('output maximum') || 1.0;

		//TODO: do a proper noise
		const noise = (maximum - minimum) * Math.random() + minimum;

		particle.setInitialField(field, noise);
	}
}
SourceEngineParticleOperators.registerOperator(RemapNoiseToScalar);

/*

					'id' 'elementid' '7668c8af-2f2a-4c07-9e93-f9e6123b172e'
					'name' 'string' 'Remap Noise to Scalar'
					'functionName' 'string' 'Remap Noise to Scalar'
					'world time noise coordinate scale' 'float' '0'
					'output maximum' 'float' '3'
					'output minimum' 'float' '1'
					'invert absolute value' 'bool' '0'
					'absolute value' 'bool' '0'
					'spatial coordinate offset' 'vector3' '0 0 0'
					'time coordinate offset' 'float' '0'
					'output field' 'int' '3'
					'spatial noise coordinate scale' 'float' '3'
					'time noise coordinate scale' 'float' '5'
					'operator fade oscillate' 'float' '0'
					'operator end fadeout' 'float' '0'
					'operator start fadeout' 'float' '0'
					'operator end fadein' 'float' '0'
					'operator start fadein' 'float' '0'
*/
