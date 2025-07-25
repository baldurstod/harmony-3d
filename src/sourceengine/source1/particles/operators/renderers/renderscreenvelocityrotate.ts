import { SourceEngineParticleOperators } from '../../sourceengineparticleoperators';
import { SourceEngineParticleOperator } from '../operator';
import { PARAM_TYPE_FLOAT } from '../../constants';
import { DEG_TO_RAD } from '../../../../../math/constants';

// Note: this operator doesn't render anything, it simply orientate the particle for other renderers
export class RenderScreenVelocityRotate extends SourceEngineParticleOperator {
	static functionName = 'render_screen_velocity_rotate';
	isScreenVelocityRotate = true;
	constructor() {
		super();
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

	updateParticles(particleSystem, particleList) {//TODOv3
		const m_flRotateRate = this.getParameter('rotate_rate(dps)') * DEG_TO_RAD;
		const m_flForward = this.getParameter('forward_angle') * DEG_TO_RAD;

		for (let i = 0; i < particleList.length; i++) {
			const particle = particleList[i];
			particle.renderScreenVelocityRotate = true;
			particle.m_flRotateRate = m_flRotateRate;
			particle.m_flForward = m_flForward;
		}
	}

	initRenderer(particleSystem) {
		// Nothing to do
	}
}
SourceEngineParticleOperators.registerOperator(RenderScreenVelocityRotate);
