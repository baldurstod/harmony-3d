import { vec3 } from 'gl-matrix';

import { SourceEngineParticleOperators } from '../../sourceengineparticleoperators';
import { SourceEngineParticleOperator } from '../operator';
import { PARAM_TYPE_INT, PARAM_TYPE_VECTOR } from '../../constants';

const a = vec3.create();

export class PositionOnModelRandom extends SourceEngineParticleOperator {
	static functionName = 'Position on Model Random';
	constructor() {
		super();
		this.addParam('control_point_number', PARAM_TYPE_INT, 0);
		this.addParam('force to be inside model', PARAM_TYPE_INT, 0);
		this.addParam('hitbox scale', PARAM_TYPE_INT, 1);
		this.addParam('direction bias', PARAM_TYPE_VECTOR, vec3.create());


	//	DMXELEMENT_UNPACK_FIELD( 'control_point_number', '0', int, m_nControlPointNumber )
	//	DMXELEMENT_UNPACK_FIELD( 'force to be inside model', '0', int, m_nForceInModel )
	//	DMXELEMENT_UNPACK_FIELD( 'hitbox scale', '1.0', int, m_flHitBoxScale )
	//	DMXELEMENT_UNPACK_FIELD( 'direction bias', '0 0 0', Vector, m_vecDirectionBias )
	}

	doInit(particle, elapsedTime) {
		const controlPointNumber = this.getParameter('control_point_number');
		const forceInModel = this.getParameter('force to be inside model');

		if (forceInModel != 0) {
			particle.die();
			return;
		}


		const controlPoint = particle.system.getControlPoint(controlPointNumber);

		// TODO : Actually we should get the model parenting the control point
		const controllingModel = controlPoint.parentModel;
		if (controllingModel) {
			//TODOv3
			const bones = [];
			particle.bones = bones;
			particle.initialVec = vec3.create();
			const position = controllingModel.getRandomPointOnModel(vec3.create(), particle.initialVec, bones);
			//vec3.copy(particle.position, position);
			//vec3.copy(particle.prevPosition, position);
			if (controlPoint) {
				vec3.copy(particle.position, position);
				vec3.copy(particle.prevPosition, position);
			}
		} else {
			if (controlPoint) {
				vec3.copy(particle.position, controlPoint.getWorldPosition(a));
				vec3.copy(particle.prevPosition, particle.position);
			}
		}
	}
}
SourceEngineParticleOperators.registerOperator(PositionOnModelRandom);
