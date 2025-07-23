import { Source2SpriteCard } from '../../../materials/source2spritecard';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { RenderBase } from './renderbase';

export class RenderDeferredLight extends RenderBase {

	initRenderer(particleSystem) {
	}

	updateParticles(particleSystem, particleList, elapsedTime) {
	}
}
RegisterSource2ParticleOperator('C_OP_RenderDeferredLight', RenderDeferredLight);
