import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { RenderBase } from './renderbase';

//const renderDeferredLightTempVec4 = vec4.create();

//const DEFAULT_ALPHA_SCALE = 1;
//const DEFAULT_COLOR_SCALE = vec3.fromValues(1, 1, 1);// TODO: check default value

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
			case 'm_flAlphaScale':// TODO: mutualize ?
			case 'm_vecColorScale':
				// used in updateParticles
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	/*
	updateParticles(particleSystem: Source2ParticleSystem, particleList: Source2Particle[], elapsedTime: number): void {
		const radiusScale = this.getParamScalarValue('m_flRadiusScale') ?? 1;
		const alphaScale = this.getParamScalarValue('m_flAlphaScale') ?? DEFAULT_ALPHA_SCALE;
		const colorScale = this.getParamVectorValue(renderDeferredLightTempVec4, 'm_vecColorScale') ?? DEFAULT_COLOR_SCALE;

		for (const particle of particleList) {
		}
	}
	*/
}
RegisterSource2ParticleOperator('C_OP_RenderDeferredLight', RenderDeferredLight);
