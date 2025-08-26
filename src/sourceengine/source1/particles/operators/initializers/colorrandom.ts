import { BLACK, WHITE } from '../../color';
import { PARAM_TYPE_COLOR } from '../../constants';
import { SourceEngineParticle } from '../../particle';
import { SourceEngineParticleOperators } from '../../sourceengineparticleoperators';
import { SourceEngineParticleSystem } from '../../sourceengineparticlesystem';
import { SourceEngineParticleOperator } from '../operator';

export class ColorRandom extends SourceEngineParticleOperator {
	static functionName = 'Color Random';

	constructor(system: SourceEngineParticleSystem) {
		super(system);
		this.addParam('color1', PARAM_TYPE_COLOR, BLACK);
		this.addParam('color2', PARAM_TYPE_COLOR, WHITE);
	}

	doInit(particle: SourceEngineParticle, elapsedTime: number): void {
		particle.color.randomize(this.getParameter('color1'), this.getParameter('color2'));
		particle.initialColor.setColor(particle.color);
	}
}
SourceEngineParticleOperators.registerOperator(ColorRandom);
