import { PARAM_TYPE_BOOL, PARAM_TYPE_FLOAT, PARAM_TYPE_INT } from '../../constants';
import { Source1Particle } from '../../particle';
import { Source1ParticleOperators } from '../../source1particleoperators';
import { Source1ParticleSystem } from '../../source1particlesystem';
import { Source1ParticleOperator } from '../operator';

export class RemapScalar extends Source1ParticleOperator {
	static functionName = 'remap scalar';

	constructor(system: Source1ParticleSystem) {
		super(system);
		this.addParam('input minimum', PARAM_TYPE_FLOAT, 0);
		this.addParam('input maximum', PARAM_TYPE_FLOAT, 1);

		this.addParam('output minimum', PARAM_TYPE_FLOAT, 0);
		this.addParam('output maximum', PARAM_TYPE_FLOAT, 1);

		this.addParam('input field', PARAM_TYPE_INT, 0);
		this.addParam('output field', PARAM_TYPE_INT, 0);

		this.addParam('output is scalar of initial random range', PARAM_TYPE_BOOL, 0);
	}

	doOperate(particle: Source1Particle, elapsedTime: number) {
		const inputMinimum = this.getParameter('input minimum');
		const inputMaximum = this.getParameter('input maximum');
		const outputMinimum = this.getParameter('output minimum');
		const outputMaximum = this.getParameter('output maximum');
		const inputField = this.getParameter('input field');
		const outputField = this.getParameter('output field');
		const init = this.getParameter('output is scalar of initial random range');

		//const v = this.getInputValue(inputField, particle);
		const v = particle.getField(inputField, init);
		const d = (v - inputMinimum) / (inputMaximum - inputMinimum);
		const out = d * (outputMaximum - outputMinimum) + outputMinimum;

		this.setOutputValue(outputField, out, particle);

	}
}
Source1ParticleOperators.registerOperator(RemapScalar);
