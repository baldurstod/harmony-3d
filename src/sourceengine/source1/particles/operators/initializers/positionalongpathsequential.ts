import { vec3 } from 'gl-matrix';

import { SourceEngineParticleOperators } from '../../sourceengineparticleoperators';
import { SourceEngineParticleOperator } from '../operator';
import { PARAM_TYPE_FLOAT, PARAM_TYPE_INT, PARAM_TYPE_BOOL } from '../../constants';

const tempVec3_1 = vec3.create();
const tempVec3_2 = vec3.create();

export class PositionAlongPathSequential extends SourceEngineParticleOperator {
	static functionName = 'Position Along Path Sequential';
	sequence = 0;
	constructor() {
		super();
		this.addParam('maximum distance', PARAM_TYPE_FLOAT, 0.0);
		this.addParam('bulge', PARAM_TYPE_FLOAT, 0.0);
		this.addParam('start control point number', PARAM_TYPE_INT, 0);
		this.addParam('end control point number', PARAM_TYPE_INT, 0);
		this.addParam('bulge control 0=random 1=orientation of start pnt 2=orientation of end point', PARAM_TYPE_INT, 0);
		this.addParam('mid point position', PARAM_TYPE_FLOAT, 0.5);
		this.addParam('particles to map from start to end', PARAM_TYPE_FLOAT, 100);
		this.addParam('restart behavior (0 = bounce, 1 = loop )', PARAM_TYPE_BOOL, 1);
	}

	doInit(particle, elapsedTime) {
		const startControlPointNumber = this.getParameter('start control point number');
		const endControlPointNumber = this.getParameter('end control point number');

		const startCP = this.particleSystem.getControlPoint(startControlPointNumber);
		const endCP = this.particleSystem.getControlPoint(endControlPointNumber);

		const nbPart = this.getParameter('particles to map from start to end');

		startCP.deltaPosFrom(endCP, tempVec3_1);

		const s = this.sequence / nbPart;
		vec3.scale(tempVec3_1, tempVec3_1, s);
		vec3.add(particle.position, startCP.getWorldPosition(tempVec3_2), tempVec3_1);
		vec3.copy(particle.prevPosition, particle.position);
		++this.sequence;
		if (this.sequence > nbPart) {
			const restartBehavior = this.getParameter('restart behavior (0 = bounce, 1 = loop )');
			if (restartBehavior == 1) {
				this.sequence = 0;
			} else {
				this.sequence = nbPart;
			}
		}
	}

	reset() {
		this.sequence = 0;
	}
}
SourceEngineParticleOperators.registerOperator(PositionAlongPathSequential);
