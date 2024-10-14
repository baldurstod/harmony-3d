import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Operator } from '../operator';
import { Source2SpriteCard } from '../../../materials/source2spritecard';

export class RenderDeferredLight extends Operator {
	constructor(system) {
		super(system);
		this.material = new Source2SpriteCard(system.repository);
	}

	_paramChanged(paramName, value) {
		switch (paramName) {
			default:
				super._paramChanged(paramName, value);
		}
	}

	initRenderer(particleSystem) {
	}

	updateParticles(particleSystem, particleList, elapsedTime) {
	}
}
RegisterSource2ParticleOperator('C_OP_RenderDeferredLight', RenderDeferredLight);
