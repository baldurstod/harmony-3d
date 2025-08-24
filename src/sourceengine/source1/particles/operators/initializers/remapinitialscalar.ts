import { PARAM_TYPE_BOOL, PARAM_TYPE_FLOAT, PARAM_TYPE_INT } from '../../constants';
import { SourceEngineParticleOperators } from '../../sourceengineparticleoperators';
import { SourceEngineParticleSystem } from '../../sourceengineparticlesystem';
import { SourceEngineParticleOperator } from '../operator';

export class RemapInitialScalar extends SourceEngineParticleOperator {
	static functionName = 'Remap Initial Scalar';

	constructor(system: SourceEngineParticleSystem) {
		super(system);
		this.addParam('input minimum', PARAM_TYPE_FLOAT, 0);
		this.addParam('input maximum', PARAM_TYPE_FLOAT, 1);

		this.addParam('output minimum', PARAM_TYPE_FLOAT, 0);
		this.addParam('output maximum', PARAM_TYPE_FLOAT, 1);

		this.addParam('input field', PARAM_TYPE_INT, 0);
		this.addParam('output field', PARAM_TYPE_INT, 0);

		this.addParam('emitter lifetime start time (seconds)', PARAM_TYPE_FLOAT, -1);
		this.addParam('emitter lifetime end time (seconds)', PARAM_TYPE_FLOAT, -1);

		this.addParam('output is scalar of initial random range', PARAM_TYPE_BOOL, 0);
	}

	doInit(particle, elapsedTime) {
		const emitterStartTime = this.getParameter('emitter lifetime start time (seconds)');
		const emitterEndTime = this.getParameter('emitter lifetime end time (seconds)');


		const currentTime = this.particleSystem.currentTime;
		if ((emitterStartTime != -1) && (currentTime < emitterStartTime)) return;
		if ((emitterEndTime != -1) && (currentTime > emitterEndTime)) return;


		const inputMinimum = this.getParameter('input minimum');
		const inputMaximum = this.getParameter('input maximum');
		const outputMinimum = this.getParameter('output minimum');
		const outputMaximum = this.getParameter('output maximum');
		const inputField = this.getParameter('input field');
		const outputField = this.getParameter('output field');
		const init = this.getParameter('output is scalar of initial random range');

		//const v = this.getInputValue(inputField, particle);
		const v = particle.getField(inputField);
		const d = (v - inputMinimum) / (inputMaximum - inputMinimum);
		const out = d * (outputMaximum - outputMinimum) + outputMinimum;
		//out = clamp(out, outputMinimum, outputMaximum);

		//this.setOutputValue(outputField, out, particle);
		particle.setField(outputField, out, init)

	}

	initMultipleOverride() {
		return true;
	}
}
SourceEngineParticleOperators.registerOperator(RemapInitialScalar);
