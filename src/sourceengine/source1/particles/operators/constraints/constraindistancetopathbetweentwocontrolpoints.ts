import { vec3 } from 'gl-matrix';
import { CDmxAttributeValue } from '../../../export';
import { PARAM_TYPE_FLOAT, PARAM_TYPE_INT } from '../../constants';
import { Source1Particle } from '../../particle';
import { PathParameters } from '../../path';
import { Source1ParticleOperators } from '../../source1particleoperators';
import { Source1ParticleSystem } from '../../source1particlesystem';
import { Source1ParticleOperator } from '../operator';
import { MaskedAssign } from '../../../../common/math/sse';

const a = vec3.create();
const b = vec3.create();

const startPnt = vec3.create();
const endPnt = vec3.create();
const midP = vec3.create();

export class ConstrainDistanceToPathBetweenTwoControlPoints extends Source1ParticleOperator {
	static functionName = 'Constrain distance to path between two control points';

	#minDistance = 0;
	#maxDistance0 = 100;
	#maxDistanceMid = -1;
	#maxDistance1 = -1;
	#travelTime = 10;
	#pathParameters: PathParameters = {
		startControlPointNumber: 0,
		endControlPointNumber: 0,
		bulgeControl: 0,
		bulge: 0,
		midPoint: 0.5,
	};

	constructor(system: Source1ParticleSystem) {
		super(system);
		// TODO: remove those params ?
		this.addParam('minimum distance', PARAM_TYPE_FLOAT, 0);
		this.addParam('maximum distance', PARAM_TYPE_FLOAT, 100);
		this.addParam('maximum distance middle', PARAM_TYPE_FLOAT, -1);
		this.addParam('maximum distance end', PARAM_TYPE_FLOAT, -1);
		this.addParam('travel time', PARAM_TYPE_FLOAT, 10);
		this.addParam('random bulge', PARAM_TYPE_FLOAT, 0);
		this.addParam('start control point number', PARAM_TYPE_INT, 0);
		this.addParam('end control point number', PARAM_TYPE_INT, 0);
		this.addParam('bulge control 0=random 1=orientation of start pnt 2=orientation of end point', PARAM_TYPE_INT, 0);
		this.addParam('mid point position', PARAM_TYPE_FLOAT, 0.5);
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
	}

	paramChanged(name: string, value: CDmxAttributeValue | CDmxAttributeValue[]) {
		switch (name) {
			case 'minimum distance':
				this.#minDistance = value as number;
				break;
			case 'maximum distance':
				this.#maxDistance0 = value as number;
				break;
			case 'maximum distance middle':
				this.#maxDistanceMid = value as number;
				break;
			case 'maximum distance end':
				this.#maxDistance1 = value as number;
				break;
			case 'travel time':
				this.#travelTime = value as number;
				break;
			case 'random bulge':
				this.#pathParameters.bulge = value as number;
				break;
			case 'start control point number':
				this.#pathParameters.startControlPointNumber = value as number;
				break;
			case 'end control point number':
				this.#pathParameters.endControlPointNumber = value as number;
				break;
			case 'bulge control 0=random 1=orientation of start pnt 2=orientation of end point':
				this.#pathParameters.bulgeControl = value as number;
				break;
			case 'mid point position':
				this.#pathParameters.midPoint = value as number;
				break;
		}
	}

	applyConstraint(particle: Source1Particle) {
		this.particleSystem.calculatePathValues(this.#pathParameters, this.particleSystem.currentTime, startPnt, midP, endPnt);

		const CurTime = this.particleSystem.currentTime;
		const TimeScale = (1.0 / (Math.max(0.001, this.#travelTime)));
		let bConstantRadius = true;
		const Rad0 = this.#maxDistance0;
		let Radm = Rad0;



		if (this.#maxDistanceMid >= 0.0) {
			bConstantRadius = (this.#maxDistanceMid == this.#maxDistance0);
			Radm = this.#maxDistanceMid;
		}
		let Rad1 = Radm;
		if (this.#maxDistance1 >= 0.0) {
			bConstantRadius = bConstantRadius && (this.#maxDistance1 == this.#maxDistance0);
			Rad1 = this.#maxDistance1;
		}

		const RadmMinusRad0 = Radm - Rad0;
		const Rad1MinusRadm = Rad1 - Radm;

		const SIMDMinDist = this.#minDistance;
		const SIMDMinDist2 = this.#minDistance * this.#minDistance;

		let SIMDMaxDist = Math.max(Rad0, Math.max(Radm, Rad1));
		const SIMDMaxDist2 = SIMDMaxDist * SIMDMaxDist;

		let bChangedSomething = false;
		const StartP = vec3.clone(startPnt);

		const MiddleP = vec3.clone(midP);

		// form delta terms needed for quadratic bezier
		const Delta0 = vec3.sub(vec3.create(), midP, startPnt);

		const Delta1 = vec3.sub(vec3.create(), endPnt, midP);

		//do {
		const TScale = Math.min(1, TimeScale * (CurTime - particle.cTime));

		// bezier(a,b,c,t)=lerp( lerp(a,b,t),lerp(b,c,t),t)
		const L0 = vec3.scale(vec3.create(), Delta0, TScale);
		vec3.add(L0, L0, StartP);

		const L1 = vec3.scale(vec3.create(), Delta1, TScale);
		vec3.add(L1, L1, MiddleP);

		const Center = vec3.sub(vec3.create(), L1, L0);
		vec3.scaleAndAdd(Center, L0, Center, TScale);

		const pts = vec3.sub(vec3.create(), particle.position, Center);

		// calculate radius at the point. !!speed!! - use speical case for constant radius

		const dist_squared = vec3.sqrDist(particle.position, Center);
		let TooFarMask = (dist_squared > SIMDMaxDist2);
		if ((!bConstantRadius) && (!(TooFarMask))) {
			// need to calculate and adjust for true radius =- we've only trivilally rejected note
			// voodoo here - we update simdmaxdist for true radius, but not max dist^2, since
			// that's used only for the trivial reject case, which we've already done
			const R0 = (Rad0 + (RadmMinusRad0 * TScale));
			const R1 = (Radm + (Rad1MinusRadm * TScale));
			SIMDMaxDist = (R0 + ((R1 - R0) * TScale));

			// now that we know the true radius, update our mask
			TooFarMask = (dist_squared > (SIMDMaxDist * SIMDMaxDist));
		}

		const TooCloseMask = (dist_squared < SIMDMinDist2);
		const NeedAdjust = (TooFarMask || TooCloseMask);
		if ((NeedAdjust)) {				// any out of bounds?
			if (!bConstantRadius) {
				// need to calculate and adjust for true radius =- we've only trivilally rejected

			}

			// change squared distance into approximate rsqr root
			let guess = Math.sqrt(dist_squared);
			// newton iteration for 1/sqrt(x) : y(n+1)=1/2 (y(n)*(3-x*y(n)^2));
			//guess = MulSIMD(guess, SubSIMD(Four_Threes, MulSIMD(dist_squared, MulSIMD(guess, guess))));
			//guess = MulSIMD(Four_PointFives, guess);
			//pts *= guess;
			vec3.scale(pts, pts, guess)

			const clamp_far = vec3.scaleAndAdd(vec3.create(), Center, pts, SIMDMaxDist);
			//clamp_far *= SIMDMaxDist;
			//clamp_far += Center;
			const clamp_near = vec3.scaleAndAdd(vec3.create(), Center, pts, SIMDMinDist);
			//clamp_near *= SIMDMinDist;
			//clamp_near += Center;
			pts[0] = MaskedAssign(TooCloseMask, clamp_near[0], MaskedAssign(TooFarMask, clamp_far[0], particle.position[0]));
			pts[1] = MaskedAssign(TooCloseMask, clamp_near[1], MaskedAssign(TooFarMask, clamp_far[1], particle.position[1]));
			pts[2] = MaskedAssign(TooCloseMask, clamp_near[2], MaskedAssign(TooFarMask, clamp_far[2], particle.position[2]));
			//* (pXYZ) = pts;
			vec3.copy(particle.position, pts);
			bChangedSomething = true;
		}
		//++pXYZ;
		//++pCreationTime;
		//} while (--nNumBlocks);
		return bChangedSomething;
	}
	/*
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
	*/


	/*

	bool C_OP_ConstrainDistanceToPath::EnforceConstraint( int nStartBlock,
														  int nNumBlocks,
														  CParticleCollection *pParticles,
														  void *pContext,
														  int nNumValidParticlesInLastChunk ) const
	{
		C4VAttributeWriteIterator pXYZ( PARTICLE_ATTRIBUTE_XYZ, pParticles );
		pXYZ += nStartBlock;

		CM128AttributeIterator pCreationTime( PARTICLE_ATTRIBUTE_CREATION_TIME, pParticles );
		pCreationTime += nStartBlock;


		Vector StartPnt, EndPnt, MidP;

		pParticles->CalculatePathValues( m_PathParameters, pParticles->m_flCurTime,
										 &StartPnt, &MidP, &EndPnt );

		fltx4 CurTime = ReplicateX4( pParticles->m_flCurTime );
		fltx4 TimeScale= ReplicateX4( 1.0/(max(0.001f,  m_flTravelTime ) ) );

		// calculate radius spline
		bool bConstantRadius = true;
		fltx4 Rad0=ReplicateX4(m_flMaxDistance0);
		fltx4 Radm=Rad0;

		if ( m_flMaxDistanceMid >= 0.0 )
		{
			bConstantRadius = ( m_flMaxDistanceMid == m_flMaxDistance0 );
			Radm=ReplicateX4( m_flMaxDistanceMid);
		}
		fltx4 Rad1=Radm;
		if ( m_flMaxDistance1 >= 0.0 )
		{
			bConstantRadius &= ( m_flMaxDistance1 == m_flMaxDistance0 );
			Rad1=ReplicateX4( m_flMaxDistance1 );
		}

		fltx4 RadmMinusRad0=SubSIMD( Radm, Rad0);
		fltx4 Rad1MinusRadm=SubSIMD( Rad1, Radm);

		fltx4 SIMDMinDist=ReplicateX4( m_fMinDistance );
		fltx4 SIMDMinDist2=ReplicateX4( m_fMinDistance*m_fMinDistance );

		fltx4 SIMDMaxDist=MaxSIMD( Rad0, MaxSIMD( Radm, Rad1 ) );
		fltx4 SIMDMaxDist2=MulSIMD( SIMDMaxDist, SIMDMaxDist);

		bool bChangedSomething = false;
		FourVectors StartP;
		StartP.DuplicateVector( StartPnt );

		FourVectors MiddleP;
		MiddleP.DuplicateVector( MidP );

		// form delta terms needed for quadratic bezier
		FourVectors Delta0;
		Delta0.DuplicateVector( MidP-StartPnt );

		FourVectors Delta1;
		Delta1.DuplicateVector( EndPnt-MidP );
		do
		{
			fltx4 TScale=MinSIMD(
				Four_Ones,
				MulSIMD( TimeScale, SubSIMD( CurTime, *pCreationTime ) ) );

			// bezier(a,b,c,t)=lerp( lerp(a,b,t),lerp(b,c,t),t)
			FourVectors L0 = Delta0;
			L0 *= TScale;
			L0 += StartP;

			FourVectors L1= Delta1;
			L1 *= TScale;
			L1 += MiddleP;

			FourVectors Center = L1;
			Center -= L0;
			Center *= TScale;
			Center += L0;

			FourVectors pts = *(pXYZ);
			pts -= Center;

			// calculate radius at the point. !!speed!! - use speical case for constant radius

			fltx4 dist_squared= pts * pts;
			fltx4 TooFarMask = CmpGtSIMD( dist_squared, SIMDMaxDist2 );
			if ( ( !bConstantRadius) && ( ! IsAnyNegative( TooFarMask ) ) )
			{
				// need to calculate and adjust for true radius =- we've only trivilally rejected note
				// voodoo here - we update simdmaxdist for true radius, but not max dist^2, since
				// that's used only for the trivial reject case, which we've already done
				fltx4 R0=AddSIMD( Rad0, MulSIMD( RadmMinusRad0, TScale ) );
				fltx4 R1=AddSIMD( Radm, MulSIMD( Rad1MinusRadm, TScale ) );
				SIMDMaxDist = AddSIMD( R0, MulSIMD( SubSIMD( R1, R0 ), TScale) );

				// now that we know the true radius, update our mask
				TooFarMask = CmpGtSIMD( dist_squared, MulSIMD( SIMDMaxDist, SIMDMaxDist ) );
			}

			fltx4 TooCloseMask = CmpLtSIMD( dist_squared, SIMDMinDist2 );
			fltx4 NeedAdjust = OrSIMD( TooFarMask, TooCloseMask );
			if ( IsAnyNegative( NeedAdjust ) )				// any out of bounds?
			{
				if ( ! bConstantRadius )
				{
					// need to calculate and adjust for true radius =- we've only trivilally rejected

				}

				// change squared distance into approximate rsqr root
				fltx4 guess=ReciprocalSqrtEstSIMD(dist_squared);
				// newton iteration for 1/sqrt(x) : y(n+1)=1/2 (y(n)*(3-x*y(n)^2));
				guess=MulSIMD(guess,SubSIMD(Four_Threes,MulSIMD(dist_squared,MulSIMD(guess,guess))));
				guess=MulSIMD(Four_PointFives,guess);
				pts *= guess;

				FourVectors clamp_far=pts;
				clamp_far *= SIMDMaxDist;
				clamp_far += Center;
				FourVectors clamp_near=pts;
				clamp_near *= SIMDMinDist;
				clamp_near += Center;
				pts.x = MaskedAssign( TooCloseMask, clamp_near.x, MaskedAssign( TooFarMask, clamp_far.x, pXYZ->x ));
				pts.y = MaskedAssign( TooCloseMask, clamp_near.y, MaskedAssign( TooFarMask, clamp_far.y, pXYZ->y ));
				pts.z = MaskedAssign( TooCloseMask, clamp_near.z, MaskedAssign( TooFarMask, clamp_far.z, pXYZ->z ));
				*(pXYZ) = pts;
				bChangedSomething = true;
			}
			++pXYZ;
			++pCreationTime;
		} while (--nNumBlocks);
		return bChangedSomething;
	}
		*/
}
Source1ParticleOperators.registerOperator(ConstrainDistanceToPathBetweenTwoControlPoints);
