import { quat, vec3 } from 'gl-matrix';
import { RAD_TO_DEG } from '../../../../../math/constants';
import { CDmxAttributeValue } from '../../../export';
import { PARAM_TYPE_INT } from '../../constants';
import { SourceEngineParticle } from '../../particle';
import { SourceEngineParticleOperators } from '../../sourceengineparticleoperators';
import { SourceEngineParticleOperator } from '../operator';

const DEFAULT_SET_CP_ORIENTATION_FOR_PARTICLES = false;/* TODO: check default value*/

const setChildControlPointsFromParticlePositionsTempQuat = quat.create();
const setChildControlPointsFromParticlePositionsTempVec3 = vec3.create();
const setChildControlPointsFromParticlePositionsXUnitVec3 = vec3.fromValues(1, 0, 0);

export class SetChildControlPointsFromParticlePositions extends SourceEngineParticleOperator {
	static functionName = 'Set child control points from particle positions';
	#setCpOrientation = DEFAULT_SET_CP_ORIENTATION_FOR_PARTICLES;

	constructor() {
		super();
		this.addParam('# of control points to set', PARAM_TYPE_INT, 1);
		this.addParam('First control point to set', PARAM_TYPE_INT, 0);
	}

	paramChanged(name: string, param: CDmxAttributeValue | CDmxAttributeValue[]) {
		console.info(name, param);
		switch (name) {
			case 'Set cp orientation for particles':
				this.#setCpOrientation = param as boolean;//TODO: convert to boolean
				break;
			default:
				super.paramChanged(name, param);
				break;

			/*
			Set cp radius for particles 1
			Set cp velocity for particles 1
			Set cp density for particles 1
			Set cp orientation for particles 1
			*/

		}
	}

	doOperate(particle: SourceEngineParticle, elapsedTime: number) {
		const number = this.getParameter('# of control points to set');
		const first = this.getParameter('First control point to set');
		//const v = vec3.clone(particle.position);
		//v.add(particle.offsetPosition);
		//const v = vec3.add(vec3.create(), particle.position, particle.cpPosition);//v.add(particle.cpPosition);
		//TODO
		const v = vec3.create(); //TODO: optimize
		particle.getWorldPos(v);
		this.particleSystem.setChildControlPointPosition(first, first + number - 1, v);
		if (this.#setCpOrientation) {
			const b = vec3.sub(setChildControlPointsFromParticlePositionsTempVec3, particle.position, particle.prevPosition);
			setChildControlPointsFromParticlePositionsTempQuat[3] = Math.sqrt(vec3.sqrLen(setChildControlPointsFromParticlePositionsXUnitVec3) * vec3.sqrLen(b)) + vec3.dot(setChildControlPointsFromParticlePositionsXUnitVec3, b);
			vec3.cross(setChildControlPointsFromParticlePositionsTempQuat as vec3/*affect xyz*/, setChildControlPointsFromParticlePositionsXUnitVec3, setChildControlPointsFromParticlePositionsTempVec3);

			this.particleSystem.setChildControlPointOrientation(first, first + number - 1, setChildControlPointsFromParticlePositionsTempQuat);

		}
	}
}
SourceEngineParticleOperators.registerOperator(SetChildControlPointsFromParticlePositions);
