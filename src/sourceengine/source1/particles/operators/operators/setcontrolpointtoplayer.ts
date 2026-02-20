import { vec3 } from 'gl-matrix';
import { int32 } from 'harmony-types';
import { PARAM_TYPE_INT, PARAM_TYPE_VECTOR3 } from '../../constants';
import { Source1Particle } from '../../particle';
import { Source1ParticleOperators } from '../../source1particleoperators';
import { Source1ParticleSystem } from '../../source1particlesystem';
import { Source1ParticleOperator } from '../operator';

const tempVec3 = vec3.create();

export class SetControlPointToPlayer extends Source1ParticleOperator {
	static functionName = 'Set Control Point To Player';

	constructor(system: Source1ParticleSystem) {
		super(system);
		this.addParam('Control Point Number', PARAM_TYPE_INT, 1);
		this.addParam('Control Point Offset', PARAM_TYPE_VECTOR3, vec3.create());
	}

	doOperate(/*particle: Source1Particle, elapsedTime: number*/) {
		const controlPointNumber = this.getParameter('Control Point Number') as int32;
		const controlPointOffset = this.getParameter('Control Point Offset') as vec3;

		// TODO: set it to the camera position
		this.particleSystem.setControlPointPosition(controlPointNumber, vec3.fromValues(1000, 0, 0));
	}
}
Source1ParticleOperators.registerOperator(SetControlPointToPlayer);
