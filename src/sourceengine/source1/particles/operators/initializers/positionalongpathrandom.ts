import { vec3 } from 'gl-matrix';

import { SourceEngineParticleOperators } from '../../sourceengineparticleoperators';
import { SourceEngineParticleOperator } from '../operator';
import { PARAM_TYPE_FLOAT, PARAM_TYPE_INT, PARAM_TYPE_BOOL } from '../../constants';

const a = vec3.create();

export class PositionAlongPathRandom extends SourceEngineParticleOperator {
	static functionName = 'Position Along Path Random';
	sequence = 0;
	constructor() {
		super();
		this.addParam('restart behavior (0 = bounce, 1 = loop )', PARAM_TYPE_BOOL, 0);
		this.addParam('particles to map from start to end', PARAM_TYPE_FLOAT, 2);
		this.addParam('mid point position', PARAM_TYPE_FLOAT, 0.5);
		this.addParam('bulge control 0=random 1=orientation of start pnt 2=orientation of end point', PARAM_TYPE_INT, 0);
		this.addParam('start control point number', PARAM_TYPE_INT, 1);
		this.addParam('end control point number', PARAM_TYPE_INT, 2);
		this.addParam('bulge', PARAM_TYPE_FLOAT, 0);
		this.addParam('maximum distance', PARAM_TYPE_FLOAT, 0);
	}

	doInit(particle, elapsedTime) {
		const startNumber = this.getParameter('start control point number') ?? 1;
		const endNumber = this.getParameter('end control point number') ?? 2;

		const startCP = this.particleSystem.getControlPoint(startNumber);
		const endCP = this.particleSystem.getControlPoint(endNumber);

		const nbPart = this.getParameter('particles to map from start to end') || 2;

		const delta = startCP.deltaPosFrom(endCP);

		const s = this.sequence / nbPart;
		vec3.scale(delta, delta, Math.random());
		vec3.add(particle.position, startCP.getWorldPosition(a), delta);
		vec3.copy(particle.prevPosition, particle.position);
		++this.sequence;
		if (this.sequence>nbPart) {//TODO: handle loop
			this.sequence = 0;
		}
	}

	reset() {
		this.sequence = 0;
	}
}
SourceEngineParticleOperators.registerOperator(PositionAlongPathRandom);
