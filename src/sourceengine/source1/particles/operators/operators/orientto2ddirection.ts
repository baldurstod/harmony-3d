import { vec2 } from 'gl-matrix';
import { DEG_TO_RAD } from '../../../../../math/constants';
import { lerp } from '../../../../../math/functions';
import { CDmxAttributeValue } from '../../../export';
import { SourceEngineParticle } from '../../particle';
import { SourceEngineParticleOperators } from '../../sourceengineparticleoperators';
import { SourceEngineParticleOperator } from '../operator';

const DEFAULT_ORIENTATION_OFFSET = 0;
const SPIN_STRENGTH = 1;

const orientTo2dDirectionTempVelocity = vec2.create();
//const orientTo2dDirectionTempVec3_1 = vec3.create();

export class OrientTo2dDirection extends SourceEngineParticleOperator {
	static functionName = 'Rotation Orient to 2D Direction';
	#rotationOffset = DEFAULT_ORIENTATION_OFFSET;
	#spinStrength = SPIN_STRENGTH;

	paramChanged(name: string, param: CDmxAttributeValue | CDmxAttributeValue[]) {
		switch (name) {
			case 'Rotation Offset':
				this.#rotationOffset = (param as number) * DEG_TO_RAD + Math.PI/*Add PI right away*/;//TODO: convert to number
				break;
			case 'Spin Strength':
				this.#spinStrength = param as number;//TODO: convert to boolean
				break;
			default:
				super.paramChanged(name, param);
				break;
		}
	}

	doOperate(particle: SourceEngineParticle, elapsedTime: number) {
		const pos = particle.position;
		vec2.sub(orientTo2dDirectionTempVelocity, particle.position as vec2, particle.prevPosition as vec2);
		vec2.normalize(orientTo2dDirectionTempVelocity, orientTo2dDirectionTempVelocity);

		const currentRotation = particle.rotationRoll;
		const velocityRotation = Math.atan2(orientTo2dDirectionTempVelocity[1], orientTo2dDirectionTempVelocity[0]) + this.#rotationOffset;

		particle.rotationRoll = lerp(currentRotation, velocityRotation, this.#spinStrength);
	}
}
SourceEngineParticleOperators.registerOperator(OrientTo2dDirection);
