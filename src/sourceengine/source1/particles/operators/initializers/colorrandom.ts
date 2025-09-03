import { BLACK, WHITE } from '../../color';
import { PARAM_TYPE_COLOR } from '../../constants';
import { Source1Particle } from '../../particle';
import { Source1ParticleOperators } from '../../source1particleoperators';
import { Source1ParticleSystem } from '../../source1particlesystem';
import { Source1ParticleOperator } from '../operator';

export class ColorRandom extends Source1ParticleOperator {
	static functionName = 'Color Random';

	constructor(system: Source1ParticleSystem) {
		super(system);
		this.addParam('color1', PARAM_TYPE_COLOR, BLACK);
		this.addParam('color2', PARAM_TYPE_COLOR, WHITE);
	}

	doInit(particle: Source1Particle, elapsedTime: number): void {
		particle.color.randomize(this.getParameter('color1'), this.getParameter('color2'));
		particle.initialColor.setColor(particle.color);
	}
}
Source1ParticleOperators.registerOperator(ColorRandom);
