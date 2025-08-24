import { SourceEngineParticleOperators } from '../../sourceengineparticleoperators';
import { SourceEngineParticleOperator } from '../operator';
import { PARAM_TYPE_COLOR } from '../../constants';
import { BLACK, Color, WHITE } from '../../color';
import { SourceEngineParticleSystem } from '../../sourceengineparticlesystem';

export class ColorRandom extends SourceEngineParticleOperator {
	static functionName = 'Color Random';

	constructor(system: SourceEngineParticleSystem) {
		super(system);
		this.addParam('color1', PARAM_TYPE_COLOR, BLACK);
		this.addParam('color2', PARAM_TYPE_COLOR, WHITE);
	}

	doInit(particle, elapsedTime) {
		particle.color.randomize(this.getParameter('color1'), this.getParameter('color2'));
		particle.initialColor.setColor(particle.color);
	}
}
SourceEngineParticleOperators.registerOperator(ColorRandom);
