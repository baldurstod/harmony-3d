import { vec3 } from 'gl-matrix';
import { RemapValClamped } from '../../../../../math/functions';
import { PARAM_TYPE_FLOAT, PARAM_TYPE_INT } from '../../constants';
import { SourceEngineParticleOperators } from '../../sourceengineparticleoperators';
import { SourceEngineParticleSystem } from '../../sourceengineparticlesystem';
import { SourceEngineParticleOperator } from '../operator';

const a = vec3.create();

export class RemapCPSpeedToCP extends SourceEngineParticleOperator {
	static functionName = 'remap cp speed to cp';

	constructor(system: SourceEngineParticleSystem) {
		super(system);
		this.addParam('operator strength scale control point', PARAM_TYPE_INT, 1);
		this.addParam('input control point', PARAM_TYPE_INT, 0);

		this.addParam('input minimum', PARAM_TYPE_FLOAT, 0);
		this.addParam('input maximum', PARAM_TYPE_FLOAT, 1);

		this.addParam('output minimum', PARAM_TYPE_FLOAT, 0);
		this.addParam('output maximum', PARAM_TYPE_FLOAT, 1);

		this.addParam('Output field 0-2 X/Y/Z', PARAM_TYPE_INT, 0);// X/Y/Z
		this.addParam('output control point', PARAM_TYPE_INT, 1);
	}

	doOperate(particle, elapsedTime) {
		const inputMinimum = this.getParameter('input minimum');
		const inputMaximum = this.getParameter('input maximum');
		const outputMinimum = this.getParameter('output minimum');
		const outputMaximum = this.getParameter('output maximum');
		const outputField = this.getParameter('Output field 0-2 X/Y/Z');
		const inCPNumber = this.getParameter('input control point');
		const outCPNumber = this.getParameter('output control point');

		const incp = this.particleSystem.getControlPoint(inCPNumber);
		const outcp = this.particleSystem.getControlPoint(outCPNumber);
		if (incp && outcp && (outputField == 0 || outputField == 1 || outputField == 2)) {
			const v = vec3.length(incp.getWorldPosition(a));

			const position = outcp.position;//TODO optimize
			position[outputField] = RemapValClamped(200, inputMinimum, inputMaximum, outputMinimum, outputMaximum);
			outcp.position = position;
		}
	}
}
SourceEngineParticleOperators.registerOperator(RemapCPSpeedToCP);
