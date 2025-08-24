import { vec3 } from 'gl-matrix';
import { NoiseSIMD } from '../../../../common/math/noise';
import { PARAM_TYPE_BOOL, PARAM_TYPE_FLOAT, PARAM_TYPE_INT, PARAM_TYPE_VECTOR } from '../../constants';
import { SourceEngineParticle } from '../../particle';
import { SourceEngineParticleOperators } from '../../sourceengineparticleoperators';
import { SourceEngineParticleSystem } from '../../sourceengineparticlesystem';
import { SourceEngineParticleOperator } from '../operator';

export class VelocityNoise extends SourceEngineParticleOperator {
	static functionName = 'Velocity Noise';
	#randX = Math.random() * 1000;
	#randY = Math.random() * 1000;
	#randZ = Math.random() * 1000;

	constructor(system: SourceEngineParticleSystem) {
		super(system);
		this.addParam('', PARAM_TYPE_INT, 0);
		this.addParam('Control Point Number', PARAM_TYPE_INT, 0);
		this.addParam('Time Noise Coordinate Scale', PARAM_TYPE_FLOAT, 1.0);
		this.addParam('Spatial Noise Coordinate Scale', PARAM_TYPE_FLOAT, 0.01);
		this.addParam('Time Coordinate Offset', PARAM_TYPE_FLOAT, 0.0);
		this.addParam('Spatial Coordinate Offset', PARAM_TYPE_VECTOR, vec3.create());
		this.addParam('Absolute Value', PARAM_TYPE_VECTOR, vec3.create());
		this.addParam('Invert Abs Value', PARAM_TYPE_VECTOR, vec3.create());
		this.addParam('output minimum', PARAM_TYPE_VECTOR, vec3.create());
		this.addParam('output maximum', PARAM_TYPE_VECTOR, vec3.fromValues(1, 1, 1));
		this.addParam('Apply Velocity in Local Space (0/1)', PARAM_TYPE_BOOL, false);
		//	DMXELEMENT_UNPACK_FIELD('Control Point Number','0',int,m_nControlPointNumber)
		//	DMXELEMENT_UNPACK_FIELD('Time Noise Coordinate Scale','1',float,m_flNoiseScale)
		//	DMXELEMENT_UNPACK_FIELD('Spatial Noise Coordinate Scale','0.01',float,m_flNoiseScaleLoc)
		//	DMXELEMENT_UNPACK_FIELD('Time Coordinate Offset','0', float, m_flOffset)
		//	DMXELEMENT_UNPACK_FIELD('Spatial Coordinate Offset','0 0 0', Vector, m_vecOffsetLoc)
		//	DMXELEMENT_UNPACK_FIELD('Absolute Value','0 0 0', Vector, m_vecAbsVal)
		//	DMXELEMENT_UNPACK_FIELD('Invert Abs Value','0 0 0', Vector, m_vecAbsValInv)
		//	DMXELEMENT_UNPACK_FIELD('output minimum','0 0 0', Vector, m_vecOutputMin)
		//	DMXELEMENT_UNPACK_FIELD('output maximum','1 1 1', Vector, m_vecOutputMax)
		//	DMXELEMENT_UNPACK_FIELD('Apply Velocity in Local Space (0/1)','0', bool, m_bLocalSpace)
	}

	doInit(particle: SourceEngineParticle, elapsedTime: number) {
		const m_nControlPointNumber = this.getParameter('Control Point Number');
		const m_flNoiseScale = this.getParameter('Time Noise Coordinate Scale');
		const m_flNoiseScaleLoc = this.getParameter('Spatial Noise Coordinate Scale');
		const m_flOffset = this.getParameter('Time Coordinate Offset');
		const m_vecOffsetLoc = this.getParameter('Spatial Coordinate Offset');
		const m_vecAbsVal = this.getParameter('Absolute Value');
		const m_vecAbsValInv = this.getParameter('Invert Abs Value');
		const m_vecOutputMin = this.getParameter('output minimum');
		const m_vecOutputMax = this.getParameter('output maximum');
		const m_bLocalSpace = this.getParameter('Apply Velocity in Local Space (0/1)');
		//	DMXELEMENT_UNPACK_FIELD('Control Point Number','0',int,m_nControlPointNumber)
		//	DMXELEMENT_UNPACK_FIELD('Time Noise Coordinate Scale','1',float,m_flNoiseScale)
		//	DMXELEMENT_UNPACK_FIELD('Spatial Noise Coordinate Scale','0.01',float,m_flNoiseScaleLoc)
		//	DMXELEMENT_UNPACK_FIELD('Time Coordinate Offset','0', float, m_flOffset)
		//	DMXELEMENT_UNPACK_FIELD('Spatial Coordinate Offset','0 0 0', Vector, m_vecOffsetLoc)
		//	DMXELEMENT_UNPACK_FIELD('Absolute Value','0 0 0', Vector, m_vecAbsVal)
		//	DMXELEMENT_UNPACK_FIELD('Invert Abs Value','0 0 0', Vector, m_vecAbsValInv)
		//	DMXELEMENT_UNPACK_FIELD('output minimum','0 0 0', Vector, m_vecOutputMin)
		//	DMXELEMENT_UNPACK_FIELD('output maximum','1 1 1', Vector, m_vecOutputMax)
		//	DMXELEMENT_UNPACK_FIELD('Apply Velocity in Local Space (0/1)','0', bool, m_bLocalSpace)
		let flAbsScaleX, flAbsScaleY, flAbsScaleZ;
		let fl4AbsValX, fl4AbsValY, fl4AbsValZ;
		fl4AbsValX = 0xffffffff;
		fl4AbsValY = 0xffffffff;
		fl4AbsValZ = 0xffffffff;
		flAbsScaleX = 0.5;
		flAbsScaleY = 0.5;
		flAbsScaleZ = 0.5;

		// Set up single if check for absolute value inversion inside the loop
		const m_bNoiseAbs = (m_vecAbsValInv[0] != 0.0) || (m_vecAbsValInv[1] != 0.0) || (m_vecAbsValInv[2] != 0.0);
		// Set up values for more optimal absolute value calculations inside the loop
		if (m_vecAbsVal[0] != 0.0) {
			fl4AbsValX = g_SIMD_clear_signmask;
			flAbsScaleX = 1.0;
		}
		if (m_vecAbsVal[1] != 0.0) {
			fl4AbsValY = g_SIMD_clear_signmask;
			flAbsScaleY = 1.0;
		}
		if (m_vecAbsVal[2] != 0.0) {
			fl4AbsValZ = g_SIMD_clear_signmask;
			flAbsScaleZ = 1.0;
		}

		const ValueScaleX = (flAbsScaleX * (m_vecOutputMax[0] - m_vecOutputMin[0]));
		const ValueBaseX = (m_vecOutputMin[0] + ((1.0 - flAbsScaleX) * (m_vecOutputMax[0] - m_vecOutputMin[0])));

		const ValueScaleY = (flAbsScaleY * (m_vecOutputMax[1] - m_vecOutputMin[1]));
		const ValueBaseY = (m_vecOutputMin[1] + ((1.0 - flAbsScaleY) * (m_vecOutputMax[1] - m_vecOutputMin[1])));

		const ValueScaleZ = (flAbsScaleZ * (m_vecOutputMax[2] - m_vecOutputMin[2]));
		const ValueBaseZ = (m_vecOutputMin[2] + ((1.0 - flAbsScaleZ) * (m_vecOutputMax[2] - m_vecOutputMin[2])));

		const fl4ValueBaseX = ValueBaseX;
		const fl4ValueBaseY = ValueBaseY;
		const fl4ValueBaseZ = ValueBaseZ;

		const fl4ValueScaleX = ValueScaleX;
		const fl4ValueScaleY = ValueScaleY;
		const fl4ValueScaleZ = ValueScaleZ;

		const CoordScale = m_flNoiseScale;
		const CoordScaleLoc = m_flNoiseScaleLoc;

		const ofs_y = vec3.fromValues(100000.5, 300000.25, 9000000.75);
		const ofs_z = vec3.fromValues(110000.25, 310000.75, 9100000.5);

		/*size_t attr_stride;

		const FourVectors *xyz = pParticles->Get4VAttributePtr(PARTICLE_ATTRIBUTE_XYZ, &attr_stride);
		xyz += attr_stride * start_block;
		FourVectors *pxyz = pParticles->Get4VAttributePtrForWrite(PARTICLE_ATTRIBUTE_PREV_XYZ, &attr_stride);
		pxyz += attr_stride * start_block;
		const fltx4 *pCreationTime = pParticles->GetM128AttributePtr(PARTICLE_ATTRIBUTE_CREATION_TIME, &attr_stride);
		pCreationTime += attr_stride * start_block;*/

		// setup
		/*fltx4 fl4Offset = ReplicateX4(m_flOffset);*/
		const fvOffsetLoc = vec3.clone(m_vecOffsetLoc);//TODO use it ?
		/*CParticleSIMDTransformation CPTransform;
		float flCreationTime = SubFloat(*pCreationTime, 0);
		pParticles->GetControlPointTransformAtTime(m_nControlPointNumber, flCreationTime, &CPTransform);*/

		//while(n_blocks--)
		{
			const fvCoordLoc = vec3.clone(particle.position);
			vec3.add(fvCoordLoc, fvCoordLoc, fvCoordLoc);//fvCoordLoc += fvOffsetLoc;

			const c = particle.cTime * 30 + m_flOffset;//vec3.add(vec3.create(), [particle.cTime, particle.cTime, particle.cTime], m_flOffset);
			const fvCoord = vec3.fromValues(c, c, c);
			//fvCoord[0] = AddSIMD(*pCreationTime, fl4Offset);
			//fvCoord[1] = AddSIMD(*pCreationTime, fl4Offset);
			//fvCoord[2] = AddSIMD(*pCreationTime, fl4Offset);
			vec3.scale(fvCoordLoc, fvCoordLoc, CoordScaleLoc);//fvCoordLoc *= CoordScaleLoc;
			vec3.scale(fvCoord, fvCoord, CoordScale * 0.01);//fvCoord *= CoordScale;
			vec3.add(fvCoord, fvCoord, fvCoordLoc);//fvCoord += fvCoordLoc;

			const fvCoord2 = vec3.clone(fvCoord);
			let fvOffsetTemp = vec3.clone(ofs_y);
			//fvOffsetTemp.DuplicateVector(ofs_y);
			vec3.add(fvCoord2, fvCoord2, fvOffsetTemp);//fvCoord2 +=	fvOffsetTemp;
			const fvCoord3 = vec3.clone(fvCoord);
			fvOffsetTemp = vec3.clone(ofs_z);
			//fvOffsetTemp.DuplicateVector(ofs_z);
			vec3.add(fvCoord3, fvCoord3, fvOffsetTemp);//fvCoord3 += fvOffsetTemp;

			let fl4NoiseX = NoiseSIMD(fvCoord[0], fvCoord[1], fvCoord[2]);

			let fl4NoiseY = NoiseSIMD(fvCoord2[0], fvCoord2[1], fvCoord2[2]);

			let fl4NoiseZ = NoiseSIMD(fvCoord3[0], fvCoord3[1], fvCoord3[2]);
			//console.log(fl4NoiseX/*, fl4NoiseY, fl4NoiseZ*/);

			//fl4NoiseX = fl4NoiseX & fl4AbsValX;//AndSIMD (fl4NoiseX, fl4AbsValX);
			//fl4NoiseY = fl4NoiseY & fl4AbsValY;//AndSIMD (fl4NoiseY, fl4AbsValY);
			//fl4NoiseZ = fl4NoiseZ & fl4AbsValZ;//AndSIMD (fl4NoiseZ, fl4AbsValZ);

			//fl4NoiseX = Math.random();
			//fl4NoiseY = Math.random();
			//fl4NoiseZ = Math.random();

			if (m_bNoiseAbs) {
				if (m_vecAbsValInv[0] != 0.0) {
					fl4NoiseX = 1.0 - fl4NoiseX;//SubSIMD(Four_Ones, fl4NoiseX);
				}

				if (m_vecAbsValInv[1] != 0.0) {
					fl4NoiseY = 1.0 - fl4NoiseY;//SubSIMD(Four_Ones, fl4NoiseY);
				}
				if (m_vecAbsValInv[2] != 0.0) {
					fl4NoiseZ = 1.0 - fl4NoiseZ;//SubSIMD(Four_Ones, fl4NoiseZ);
				}
			}

			const fvOffset = vec3.create();

			fvOffset[0] = fl4ValueBaseX + fl4ValueScaleX * fl4NoiseX;//AddSIMD(fl4ValueBaseX, (MulSIMD(fl4ValueScaleX , fl4NoiseX)));
			fvOffset[1] = fl4ValueBaseY + fl4ValueScaleY * fl4NoiseY;//AddSIMD(fl4ValueBaseY, (MulSIMD(fl4ValueScaleY , fl4NoiseY)));
			fvOffset[2] = fl4ValueBaseZ + fl4ValueScaleZ * fl4NoiseZ;//AddSIMD(fl4ValueBaseZ, (MulSIMD(fl4ValueScaleZ , fl4NoiseZ)));

			//TODO fvOffset *= pParticles->m_flPreviousDt;

			if (m_bLocalSpace) {
				//CPTransform.VectorRotate(fvOffset);
				//TODO
				const cp = particle.system.getControlPoint(m_nControlPointNumber);
				if (cp) {
					vec3.transformQuat(fvOffset, fvOffset, cp.getWorldQuaternion());
					//vec3.add(randpos, randpos, cp.getOrigin());
				}
			}
			//console.log(fvOffset);
			vec3.add(particle.velocity, particle.velocity, fvOffset);

			vec3.scaleAndAdd(particle.prevPosition, particle.prevPosition, fvOffset, -elapsedTime);
			//vec3.scaleAndAdd(particle.velocity, particle.velocity, fvOffset, -10);
			//vec3.scaleAndAdd(particle.prevPosition, particle.prevPosition, fvOffset, -this.particleSystem.elapsedTime);
			//vec3.scaleAndAdd(particle.prevPosition, particle.position, fvOffset, 0.1);
			//vec3.scaleAndAdd(particle.prevPosition, particle.position, [0, 0, 1], 0.1);
			//particle.prevPosition = vec3.create();

		}
	}

	initMultipleOverride() {
		return true;
	}
}
SourceEngineParticleOperators.registerOperator(VelocityNoise);
/*

VelocityNoise.prototype.getNoise = function (particle, time) {
	//return NoiseSIMD(particle.position, particle.cTime);
	//return Math.random();
	return Math.cos(time * 5) * 0.5 + 0.5;
}
	*/

// Clamp velocity to min/max values if set
/*VelocityNoise.prototype.clampVelocity = function(velocity) {
	const output_minimum = this.getParameter('output minimum');
	const output_maximum = this.getParameter('output maximum');

	if (output_minimum != null) {
		if (velocity.x < output_minimum.x) velocity.x = output_minimum.x;
		if (velocity.y < output_minimum.y) velocity.y = output_minimum.y;
		if (velocity.z < output_minimum.z) velocity.z = output_minimum.z;
	}

	if (output_maximum != null) {
		if (velocity.x > output_maximum.x) velocity.x = output_maximum.x;
		if (velocity.y > output_maximum.y) velocity.y = output_maximum.y;
		if (velocity.z > output_maximum.z) velocity.z = output_maximum.z;
	}
}*/

//TODO: place somewhere else
const g_SIMD_clear_signmask = 0x7fffffff;
const g_SIMD_signmask = 0x80000000;
const g_SIMD_lsbmask = 0xfffffffe;
