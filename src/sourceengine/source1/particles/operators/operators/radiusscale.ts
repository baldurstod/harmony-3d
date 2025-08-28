import { SimpleSpline } from '../../../../../math/functions';
import { AddSIMD, AndSIMD, BiasSIMD, CmpGeSIMD, CmpGtSIMD, CmpLtSIMD, MulSIMD, ReciprocalEstSIMD, ReciprocalSIMD, SubSIMD } from '../../../../common/math/sse';
import { PARAM_TYPE_BOOL, PARAM_TYPE_FLOAT } from '../../constants';
import { SourceEngineParticle } from '../../particle';
import { SourceEngineParticleOperators } from '../../sourceengineparticleoperators';
import { SourceEngineParticleSystem } from '../../sourceengineparticlesystem';
import { SourceEngineParticleOperator } from '../operator';

export class RadiusScale extends SourceEngineParticleOperator {
	static functionName = 'Radius Scale';

	constructor(system: SourceEngineParticleSystem) {
		super(system);
		this.addParam('radius_start_scale', PARAM_TYPE_FLOAT, 1);
		this.addParam('radius_end_scale', PARAM_TYPE_FLOAT, 1);
		this.addParam('start_time', PARAM_TYPE_FLOAT, 0);
		this.addParam('end_time', PARAM_TYPE_FLOAT, 1);
		this.addParam('scale_bias', PARAM_TYPE_FLOAT, 0.5); //Neutral bias
		this.addParam('ease_in_and_out', PARAM_TYPE_BOOL, 0); //Neutral bias
		/*DMXELEMENT_UNPACK_FIELD('start_time', '0', float, m_flStartTime)
		DMXELEMENT_UNPACK_FIELD('end_time', '1', float, m_flEndTime)
		DMXELEMENT_UNPACK_FIELD('radius_start_scale', '1', float, m_flStartScale)
		DMXELEMENT_UNPACK_FIELD('radius_end_scale', '1', float, m_flEndScale)
		DMXELEMENT_UNPACK_FIELD('ease_in_and_out', '0', bool, m_bEaseInAndOut)
		DMXELEMENT_UNPACK_FIELD('scale_bias', '0.5', float, m_flBias)*/
	}

	doOperate(particle: SourceEngineParticle, elapsedTime: number) {
		const radius_start_scale = this.getParameter('radius_start_scale');
		const radius_end_scale = this.getParameter('radius_end_scale');
		const start_time = this.getParameter('start_time');
		const end_time = this.getParameter('end_time');
		const scaleBias = this.getParameter('scale_bias');
		const easeInAndOut = this.getParameter('ease_in_and_out');

		const fl4OOTimeWidth = ReciprocalSIMD(SubSIMD(end_time, start_time));

		const biasParam = 1 / scaleBias - 2;
		const fl4LifeDuration = particle.timeToLive;
		let fl4GoodMask = CmpGtSIMD(fl4LifeDuration, 0);
		const fl4CurTime = this.particleSystem.currentTime;
		const fl4ScaleWidth = radius_end_scale - radius_start_scale;
		const fl4LifeTime = MulSIMD(SubSIMD(fl4CurTime, particle.cTime), ReciprocalEstSIMD(fl4LifeDuration)); // maybe need accurate div here?
		fl4GoodMask = AndSIMD(fl4GoodMask, CmpGeSIMD(fl4LifeTime, start_time));
		fl4GoodMask = AndSIMD(fl4GoodMask, CmpLtSIMD(fl4LifeTime, end_time));

		fl4GoodMask = (fl4LifeDuration > 0) && (fl4LifeTime >= start_time) && (fl4LifeTime < end_time);
		if (fl4GoodMask/* IsAnyNegative(fl4GoodMask) */) {
			let fl4FadeWindow = MulSIMD(SubSIMD(fl4LifeTime, start_time), fl4OOTimeWidth);
			if (easeInAndOut) {
				fl4FadeWindow = AddSIMD(radius_start_scale, MulSIMD(SimpleSpline(fl4FadeWindow), fl4ScaleWidth));
			} else {
				if (scaleBias != 0.5) {
					fl4FadeWindow = AddSIMD(radius_start_scale, MulSIMD(BiasSIMD(fl4FadeWindow, biasParam), fl4ScaleWidth));
				} else {
					fl4FadeWindow = AddSIMD(radius_start_scale, MulSIMD(fl4FadeWindow, fl4ScaleWidth));
				}
			}
			if (fl4GoodMask) {
				particle.radius = fl4FadeWindow * particle.initialRadius;
			}
		}
	}
}
SourceEngineParticleOperators.registerOperator(RadiusScale);
