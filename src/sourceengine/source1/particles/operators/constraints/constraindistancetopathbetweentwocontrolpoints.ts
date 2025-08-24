import { vec3 } from 'gl-matrix';
import { clamp } from '../../../../../math/functions';
import { PARAM_TYPE_FLOAT, PARAM_TYPE_INT, PARAM_TYPE_VECTOR } from '../../constants';
import { SourceEngineParticleOperators } from '../../sourceengineparticleoperators';
import { SourceEngineParticleSystem } from '../../sourceengineparticlesystem';
import { SourceEngineParticleOperator } from '../operator';

const a = vec3.create();
const b = vec3.create();

/*
	DMXELEMENT_UNPACK_FIELD( "minimum distance", "0", float, m_fMinDistance )
	DMXELEMENT_UNPACK_FIELD( "maximum distance", "100", float, m_flMaxDistance0 )
	DMXELEMENT_UNPACK_FIELD( "maximum distance middle", "-1", float, m_flMaxDistanceMid )
	DMXELEMENT_UNPACK_FIELD( "maximum distance end", "-1", float, m_flMaxDistance1 )
	DMXELEMENT_UNPACK_FIELD( "travel time", "10", float, m_flTravelTime )
	DMXELEMENT_UNPACK_FIELD( "random bulge", "0", float, m_PathParameters.m_flBulge )
	DMXELEMENT_UNPACK_FIELD( "start control point number", "0", int, m_PathParameters.m_nStartControlPointNumber )
	DMXELEMENT_UNPACK_FIELD( "end control point number", "0", int, m_PathParameters.m_nEndControlPointNumber )
	DMXELEMENT_UNPACK_FIELD( "bulge control 0=random 1=orientation of start pnt 2=orientation of end point", "0", int, m_PathParameters.m_nBulgeControl )
	DMXELEMENT_UNPACK_FIELD( "mid point position", "0.5", float, m_PathParameters.m_flMidPoint )
	*/


export class ConstrainDistanceToPathBetweenTwoControlPoints extends SourceEngineParticleOperator {
	static functionName = 'Constrain distance to path between two control points';

	constructor(system: SourceEngineParticleSystem) {
		super(system);
		//this.setNameId('constrain distance to path between two control points');
		this.addParam('start control point number', PARAM_TYPE_INT, 0);
		this.addParam('end control point number', PARAM_TYPE_INT, 0);
		this.addParam('travel time', PARAM_TYPE_FLOAT, 10);
		this.addParam('minimum distance', PARAM_TYPE_FLOAT, 0);
		this.addParam('maximum distance', PARAM_TYPE_FLOAT, 100);
		this.addParam('offset of center', PARAM_TYPE_VECTOR, vec3.create());
		// TODO: add more parameters
	}

	applyConstraint(particle) {
		const startNumber = this.getParameter('start control point number') || 0;
		const endNumber = this.getParameter('end control point number') || 1;
		let travelTime = this.getParameter('travel time') || 1;
		travelTime = clamp(particle.currentTime / travelTime, 0, 1);

		const startCP = this.particleSystem.getControlPoint(startNumber);
		const endCP = this.particleSystem.getControlPoint(endNumber);

		if (startCP && endCP) {
			const delta = vec3.sub(vec3.create(), endCP.getWorldPosition(b), startCP.getWorldPosition(a));
			vec3.scaleAndAdd(particle.position, a, delta, travelTime);
		}
	}
}
SourceEngineParticleOperators.registerOperator(ConstrainDistanceToPathBetweenTwoControlPoints);
