import { vec3 } from 'gl-matrix';
import { Source2ParticleSystem, Source2SpriteCard } from '../../../export';
import { COLOR_SCALE, Operator, Source2OperatorParamValue } from '../operator';

// Base renderer for common attributes like textures
export class RenderBase extends Operator {
	protected material = new Source2SpriteCard('');

	constructor(system: Source2ParticleSystem) {
		super(system);
		this.material.repository = system.repository;
	}

	setMaterial(material: Source2SpriteCard) {
		this.material = material;
	}

	_paramChanged(paramName: string, value: Source2OperatorParamValue) {
		switch (paramName) {
			case 'm_ColorScale':
				const colorScale = vec3.create();
				colorScale[0] = Number(value[0]) * COLOR_SCALE;
				colorScale[1] = Number(value[1]) * COLOR_SCALE;
				colorScale[2] = Number(value[2]) * COLOR_SCALE;
				this.material?.setUniform('uColorScale', colorScale);
				break;
			// Renderer parameters
			case 'm_nOutputBlendMode':
				this.#setOutputBlendMode(value);
				break;
			case 'm_bAdditive':
				this.#setOutputBlendMode('PARTICLE_OUTPUT_BLEND_MODE_ADD');
				break;
			case 'm_bMod2X':
				this.#setOutputBlendMode('PARTICLE_OUTPUT_BLEND_MODE_MOD2X');
				break;
			default:
				super._paramChanged(paramName, value);
		}
	}

	#setOutputBlendMode(outputBlendMode: string) {
		let blendMode = 0;
		switch (outputBlendMode) {
			case 'PARTICLE_OUTPUT_BLEND_MODE_ADD':
				blendMode = 1;
				break;
			case 'PARTICLE_OUTPUT_BLEND_MODE_BLEND_ADD':
				blendMode = 2;
				break;
			case 'PARTICLE_OUTPUT_BLEND_MODE_HALF_BLEND_ADD':
				blendMode = 3;
				break;
			case 'PARTICLE_OUTPUT_BLEND_MODE_NEG_HALF_BLEND_ADD':
				blendMode = 4;
				break;
			case 'PARTICLE_OUTPUT_BLEND_MODE_MOD2X':
				blendMode = 5;
				break;
			case 'PARTICLE_OUTPUT_BLEND_MODE_LIGHTEN':
				blendMode = 6;
				break;
			default:
				console.error('Unknown outputBlendMode ', outputBlendMode);
		}
		this.material?.setOutputBlendMode(blendMode);
	}
}
