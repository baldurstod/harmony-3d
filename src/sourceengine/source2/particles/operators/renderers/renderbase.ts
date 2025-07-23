import { vec3 } from 'gl-matrix';
import { TESTING } from '../../../../../buildoptions';
import { Source2SpriteCard } from '../../../materials/source2spritecard';
import { Source2SpriteSheet } from '../../../textures/source2spritesheet';
import { Source2TextureManager } from '../../../textures/source2texturemanager';
import { DEFAULT_PARTICLE_TEXTURE } from '../../particleconstants';
import { Source2ParticleSystem } from '../../source2particlesystem';
import { COLOR_SCALE, Operator } from '../operator';
import { OperatorParam } from '../operatorparam';

// Base renderer for common attributes like textures
export class RenderBase extends Operator {
	protected material = new Source2SpriteCard('');
	protected setDefaultTexture = true;//TODO: remove this property
	protected spriteSheet: Source2SpriteSheet | null = null;

	constructor(system: Source2ParticleSystem) {
		super(system);
		this.material.repository = system.repository;
	}

	setMaterial(material: Source2SpriteCard) {
		this.material = material;
	}

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_vecTexturesInput':
				if (TESTING) {
					console.debug('m_vecTexturesInput', param);
				}

				const textureInput0 = param.getValueAsArray()?.[0];//TODO: check multiple textures ?
				if (textureInput0 && (textureInput0 as OperatorParam).isOperatorParam) {
					this.setTexture((textureInput0 as OperatorParam).getSubValue('m_hTexture')?.getValueAsString() ?? DEFAULT_PARTICLE_TEXTURE);

					const textureChannels = (textureInput0 as OperatorParam).getSubValue('m_nTextureChannels');
					if (textureChannels) {
						throw 'fix me';//this.material.setDefine(value[0].m_nTextureChannels);//TODO: check values
					}
				}
				break;
			case 'm_ColorScale':
				const colorScale = vec3.create();
				colorScale[0] = Number(param[0]) * COLOR_SCALE;
				colorScale[1] = Number(param[1]) * COLOR_SCALE;
				colorScale[2] = Number(param[2]) * COLOR_SCALE;
				this.material?.setUniform('uColorScale', colorScale);
				break;
			// Renderer parameters
			case 'm_nOutputBlendMode':
				const blendMode = param.getValueAsString();
				if (blendMode) {
					this.#setOutputBlendMode(blendMode);
				}
				break;
			case 'm_bAdditive':
				this.#setOutputBlendMode('PARTICLE_OUTPUT_BLEND_MODE_ADD');
				break;
			case 'm_bMod2X':
				this.#setOutputBlendMode('PARTICLE_OUTPUT_BLEND_MODE_MOD2X');
				break;
				/*
			case 'm_flRadiusScale':
				this.radiusScale = param.getValueAsNumber() ?? 1;
				break;
				*/
			default:
				super._paramChanged(paramName, param);
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

	async setTexture(texturePath: string) {
		this.setDefaultTexture = false;
		this.material.setTexturePath(texturePath);
		this.spriteSheet = await Source2TextureManager.getTextureSheet(this.system.repository, texturePath);
	}
}
