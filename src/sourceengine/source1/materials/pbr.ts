import { DynamicParams } from '../../../entities/entity';
import { DEFAULT_COLOR } from '../../../materials/material';
import { MateriaParameterType } from '../../../materials/materialparameter';
import { Source1VmtLoader } from '../loaders/source1vmtloader';
import { getDefaultTexture, Source1Material, TextureRole } from './source1material';

export class Source1PbrMaterial extends Source1Material {
	#initialized = false;

	init(): void {
		if (this.#initialized) {
			return;
		}
		this.#initialized = true;
		super.init();
		const variables = this.variables;

		this.addParameter('color', MateriaParameterType.Color4, null, newValue => this.setColor4Uniform('uColor', newValue ?? DEFAULT_COLOR));
		this.addParameter('metalness', MateriaParameterType.NormalizedFloat, 0, newValue => { this.setUniformValue('uMetalness', newValue) });
		this.addParameter('roughness', MateriaParameterType.NormalizedFloat, 0, newValue => { this.setUniformValue('uRoughness', newValue) });
		this.addParameter('aofactor', MateriaParameterType.NormalizedFloat, 0, newValue => { this.setUniformValue('uAoFactor', newValue) });
		this.addParameter('ssaofactor', MateriaParameterType.NormalizedFloat, 0, newValue => { this.setUniformValue('uSsaoFactor', newValue) });
		this.addParameter('color_texture', MateriaParameterType.Texture, null, newValue => this.setTexture('uColorTexture', newValue, 'USE_COLOR_TEXTURE'));
		this.addParameter('normal_texture', MateriaParameterType.Texture, null, newValue => this.setTexture('uNormalTexture', newValue, 'USE_NORMAL_TEXTURE'));
		this.addParameter('mrao_texture', MateriaParameterType.Texture, null, newValue => this.setTexture('uMraoTexture', newValue, 'USE_MRAO_TEXTURE'));


		this.setParameterValue('metalness', variables.get('metalnessfactor') ?? 0);
		this.setParameterValue('roughness', variables.get('roughnessfactor') ?? 0);
		this.setParameterValue('aofactor', variables.get('aofactor') ?? 0);
		this.setParameterValue('ssaofactor', variables.get('ssaofactor') ?? 0);

		/*
		"PBR"
		{
			$model 1
			$basetexture "models/sybilregal/palworld/pals/solenne/Solenne_Body_Diff"
			$bumpmap "models/sybilregal/palworld/pals/solenne/Solenne_Body_Bump"
			$mraotexture "models/sybilregal/palworld/pals/solenne/Solenne_Body_MRAO"
			$metalnessFactor 1
			$roughnessFactor 1
			$aofactor 1
			$ssaofactor 1
		}
		*/


		/*
		this.polygonOffset = true;
		this.polygonOffsetFactor = -5;
		this.polygonOffsetUnits = -5;
		this.setPatternTexCoordTransform(vec2.fromValues(1, 1), vec2.create(), 0);
		*/
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	override afterProcessProxies(proxyParams: DynamicParams): void {
		const variables = this.variables;

		const baseTexture = variables.get('$basetexture');
		if (baseTexture) {
			this.setParameterValue('color_texture', this.getTexture(TextureRole.Color, this.repository, baseTexture, variables.get('$frame') ?? 0, false, this.useSrgb ?? true) ?? getDefaultTexture());
		}

		const bumpTexture = variables.get('$bumpmap');
		if (bumpTexture) {
			this.setParameterValue('normal_texture', this.getTexture(TextureRole.Color, this.repository, bumpTexture, variables.get('$frame') ?? 0, false, this.useSrgb ?? true) ?? getDefaultTexture());
		}

		const mraoTexture = variables.get('$mraotexture');
		if (mraoTexture) {
			this.setParameterValue('mrao_texture', this.getTexture(TextureRole.Color, this.repository, mraoTexture, variables.get('$mraoframe') ?? 0, false, this.useSrgb ?? true) ?? getDefaultTexture());
		}
	}

	override clone(): Source1PbrMaterial {
		return new Source1PbrMaterial(this.repository, this.path, this.vmt, this.parameters);
	}

	override getShaderSource(): string {
		return 'meshbasicpbr';
	}
}
Source1VmtLoader.registerMaterial('pbr', Source1PbrMaterial);
