import { vec3 } from 'gl-matrix';
import { PARAM_TYPE_BOOL, PARAM_TYPE_FLOAT, PARAM_TYPE_INT } from '../../constants';
import { SourceEngineParticle } from '../../particle';
import { SourceEngineParticleOperators } from '../../source1particleoperators';
import { SourceEngineParticleSystem } from '../../source1particlesystem';
import { SourceEngineParticleOperator } from '../operator';

const a = vec3.create();

export class RemapControlPointToScalar extends SourceEngineParticleOperator {
	static functionName = 'remap control point to scalar';

	constructor(system: SourceEngineParticleSystem) {
		super(system);
		this.addParam('operator strength scale control point', PARAM_TYPE_INT, 1);
		this.addParam('input control point number', PARAM_TYPE_INT, 0);

		this.addParam('input minimum', PARAM_TYPE_FLOAT, 0);
		this.addParam('input maximum', PARAM_TYPE_FLOAT, 1);

		this.addParam('output minimum', PARAM_TYPE_FLOAT, 0);
		this.addParam('output maximum', PARAM_TYPE_FLOAT, 1);

		this.addParam('input field 0-2 X/Y/Z', PARAM_TYPE_INT, 0);// X/Y/Z
		this.addParam('output field', PARAM_TYPE_INT, 1);

		this.addParam('output is scalar of initial random range', PARAM_TYPE_BOOL, 0);

		/*
					'operator start fadein' 'float' '0'
					'operator end fadein' 'float' '0'
					'operator start fadeout' 'float' '0'
					'operator end fadeout' 'float' '0'
					'operator fade oscillate' 'float' '0'
					'emitter lifetime start time (seconds)' 'float' '-1'
					'emitter lifetime end time (seconds)' 'float' '-1'
					'input control point number' 'int' '1'
					'input minimum' 'float' '0.25'
					'input maximum' 'float' '1'
					'input field 0-2 X/Y/Z' 'int' '0'
					'output field' 'int' '7'
					'output minimum' 'float' '1'
					'output maximum' 'float' '0'
					'output is scalar of initial random range' 'bool' '0'
					*/
	}

	doInit(particle: SourceEngineParticle, elapsedTime: number): void {
		/*if (!this.firstTime) {
			console.error('I don\'t know what i\'m supposed to do ' + this.functionName);
			console.log(this.parameters);
			this.firstTime = true;
			return;
		}*/
		const inputMinimum = this.getParameter('input minimum');
		const inputMaximum = this.getParameter('input maximum');
		const outputMinimum = this.getParameter('output minimum');
		const outputMaximum = this.getParameter('output maximum');
		const inputField = this.getParameter('input field 0-2 X/Y/Z');
		const outputField = this.getParameter('output field');
		const cpNumber = this.getParameter('input control point number');

		const cp = this.particleSystem.getControlPoint(cpNumber);
		if (cp && (inputField == 0 || inputField == 1 || inputField == 2)) {
			const v = cp._position[inputField]!;//this.getInputValue(inputField, cpNumber);
			const d = (v - inputMinimum) / (inputMaximum - inputMinimum);
			const out = d * (outputMaximum - outputMinimum) + outputMinimum;
			//out = Clamp(out, outputMinimum, outputMaximum);

			this.setOutputValue(outputField, out, particle);
		}

	}

	initMultipleOverride() {
		return true;
	}
}
SourceEngineParticleOperators.registerOperator(RemapControlPointToScalar);
