import { DEG_TO_RAD } from '../../../../../math/constants';
import { PARAM_TYPE_FLOAT } from '../../constants';
import { SourceEngineParticle } from '../../particle';
import { SourceEngineParticleOperators } from '../../source1particleoperators';
import { SourceEngineParticleSystem } from '../../source1particlesystem';
import { SourceEngineParticleOperator } from '../operator';

// Note: this operator doesn't render anything, it simply orientate the particle for other renderers
export class RenderScreenVelocityRotate extends SourceEngineParticleOperator {
	static functionName = 'render_screen_velocity_rotate';
	isScreenVelocityRotate = true;

	constructor(system: SourceEngineParticleSystem) {
		super(system);
		this.addParam('rotate_rate(dps)', PARAM_TYPE_FLOAT, 0.0);
		this.addParam('forward_angle', PARAM_TYPE_FLOAT, -90.0);
	}
	/*
		doRender(particleList, elapsedTime, material) {
			for (let i = 0; i < particleList.length; ++i) {
				this.renderAnimatedSprites(particleList[i], elapsedTime, material);
			}
		}
	*/

	updateParticles(particleSystem: SourceEngineParticleSystem, particleList: SourceEngineParticle[], elapsedTime: number) {
		const m_flRotateRate = this.getParameter('rotate_rate(dps)') * DEG_TO_RAD;
		const m_flForward = this.getParameter('forward_angle') * DEG_TO_RAD;

		for (let i = 0; i < particleList.length; i++) {
			const particle: SourceEngineParticle = particleList[i]!;
			particle.renderScreenVelocityRotate = true;
			particle.m_flRotateRate = m_flRotateRate;
			particle.m_flForward = m_flForward;
		}
	}

	initRenderer() {
		// Nothing to do
	}
}
SourceEngineParticleOperators.registerOperator(RenderScreenVelocityRotate);
