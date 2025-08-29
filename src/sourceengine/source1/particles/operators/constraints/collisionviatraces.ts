import { vec3 } from 'gl-matrix';
import { TESTING } from '../../../../../buildoptions';
import { World } from '../../../../../objects/world';
import { Raycaster } from '../../../../../raycasting/raycaster';
import { Scene } from '../../../../../scenes/scene';
import { CDmxAttributeValue } from '../../../export';
import { PARAM_TYPE_BOOL, PARAM_TYPE_FLOAT, PARAM_TYPE_INT, PARAM_TYPE_STRING, PARAM_TYPE_VECTOR } from '../../constants';
import { SourceEngineParticle } from '../../particle';
import { SourceEngineParticleOperators } from '../../sourceengineparticleoperators';
import { SourceEngineParticleSystem } from '../../sourceengineparticlesystem';
import { SourceEngineParticleOperator } from '../operator';

const COLLISION_MODE_PER_PARTICLE_TRACE = 0;
const COLLISION_MODE_PER_FRAME_PLANESET = 1;
const COLLISION_MODE_INITIAL_TRACE_DOWN = 2;
const COLLISION_MODE_USE_NEAREST_TRACE = 3;

const tempVec3_1 = vec3.create();
const tempVec3_2 = vec3.create();

export class CollisionViaTraces extends SourceEngineParticleOperator {
	static functionName = 'Collision via traces';
	#raycaster = new Raycaster();
	#world?: World;
	#collisionMode: number = -1;/*TODO: create enum*/;

	constructor(system: SourceEngineParticleSystem) {
		super(system);
		this.addParam('collision mode', PARAM_TYPE_INT, 0);
		this.addParam('amount of bounce', PARAM_TYPE_FLOAT, 0.0);
		this.addParam('amount of slide', PARAM_TYPE_FLOAT, 0.0);
		this.addParam('radius scale', PARAM_TYPE_FLOAT, 1.0);
		this.addParam('brush only', PARAM_TYPE_BOOL, 0);
		this.addParam('collision group', PARAM_TYPE_STRING, 0.0);
		this.addParam('control point offset for fast collisions', PARAM_TYPE_VECTOR, vec3.create());
		this.addParam('control point movement distance tolerance', PARAM_TYPE_FLOAT, 5.0);
		this.addParam('kill particle on collision', PARAM_TYPE_BOOL, 0.0);
		this.addParam('trace accuracy tolerance', PARAM_TYPE_FLOAT, 24.0);

		//DMXELEMENT_UNPACK_FIELD( "collision mode", "0", int, m_nCollisionMode )
		//DMXELEMENT_UNPACK_FIELD( "amount of bounce", "0", float, m_flBounceAmount )
		//DMXELEMENT_UNPACK_FIELD( "amount of slide", "0", float, m_flSlideAmount )
		//DMXELEMENT_UNPACK_FIELD( "radius scale", "1", float, m_flRadiusScale )
		//DMXELEMENT_UNPACK_FIELD( "brush only", "0", bool, m_bBrushOnly )
		//DMXELEMENT_UNPACK_FIELD_STRING( "collision group", "NONE", m_CollisionGroupName )
		//DMXELEMENT_UNPACK_FIELD( "control point offset for fast collisions", "0 0 0", Vector, m_vecCpOffset )
		//DMXELEMENT_UNPACK_FIELD( "control point movement distance tolerance", "5", float, m_flCpMovementTolerance )
		//DMXELEMENT_UNPACK_FIELD( "kill particle on collision", "0", bool, m_bKillonContact )
		//DMXELEMENT_UNPACK_FIELD( "trace accuracy tolerance", "24", float, m_flTraceTolerance )
	}

	paramChanged(name: string, value: CDmxAttributeValue | CDmxAttributeValue[]) {
		switch (name) {
			case 'collision mode':
				this.#collisionMode = value as number;
				console.log('collisionMode', this.#collisionMode);
				break;
		}
	}

	applyConstraint(particle: SourceEngineParticle) {
		const world = TESTING && (this.#world ?? this.#getWorld());
		if (world) {
			this.#worldCollision(particle, world);
		} else {
			if (particle.position[2] < 0.0) {
				particle.position[2] = 0.0
			}
		}
		//TODO: do a proper collision
	}

	#worldCollision(particle: SourceEngineParticle, world: World) {
		//const cp = this.particleSystem.getControlPoint(0);
		//particle.prevPosition[2] = 50;

		const rayDirection = vec3.sub(tempVec3_1, particle.position, particle.prevPosition);
		const distance = vec3.len(rayDirection);
		vec3.normalize(rayDirection, rayDirection);

		// We probably already are on the surface, move back the ray origin to prevent falling thru
		const rayPosition = vec3.scaleAndAdd(tempVec3_2, particle.prevPosition, rayDirection, -0.001);

		const intersections = this.#raycaster.castRay(rayPosition, rayDirection, [world], true);
		if (intersections.length) {
			//console.error(intersections);
			let min = Infinity;
			for (const intersection of intersections) {
				if (intersection.distance < min) {
					vec3.copy(particle.position, intersection.position);
					min = intersection.distance;
				}
			}
		} else {
			if (TESTING) {
				console.log(...particle.prevPosition, ...particle.position)
			}
		}
	}

	#getWorld() {
		const iterator = this.particleSystem.getParentIterator();

		for (const e of iterator) {
			if (e.is('Scene')) {
				const world = (e as Scene).getWorld();
				if (world) {
					this.#world = world;
					iterator.return(null);
					return world;
				}
			}
		}
	}
}
SourceEngineParticleOperators.registerOperator(CollisionViaTraces);
