import { Source2Particle } from '../../source2particle';
import { Source2ParticleSystem } from '../../source2particlesystem';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { RenderBase } from './renderbase';

const DEFAULT_ALPHA_SCALE = 1;

export class RenderDeferredLight extends RenderBase {
	#startFalloff = 0;// TODO: check default value
	#texture = '';// TODO: check default value

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_flStartFalloff':
				this.#startFalloff = param.getValueAsNumber() ?? 0;// TODO: check default value
				break;
			case 'm_hTexture':
				this.#texture = param.getValueAsString() ?? '';// TODO: check default value
				break;
			case 'm_flRadiusScale':
				// used in updateParticles
				break;
			case 'm_flAlphaScale':// TODO: mutualize ?
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	initRenderer(particleSystem: Source2ParticleSystem) {
	}

	updateParticles(particleSystem: Source2ParticleSystem, particleList: Source2Particle[], elapsedTime: number): void {
		const radiusScale = this.getParamScalarValue('m_flRadiusScale') ?? 1;
		const alphaScale = this.getParamScalarValue('m_flAlphaScale') ?? DEFAULT_ALPHA_SCALE;
	}
}
RegisterSource2ParticleOperator('C_OP_RenderDeferredLight', RenderDeferredLight);
