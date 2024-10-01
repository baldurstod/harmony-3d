import { DEFAULT_COLOR, Material } from '../material'
import { JSONLoader } from '../../loaders/jsonloader'
import { MateriaParameterType } from '../materialparameter';

export class MeshBasicPbrMaterial extends Material {
	constructor(params: any = {}) {
		super(params);
		this.addParameter('color', MateriaParameterType.Color4, null, newValue => this.setColor4Uniform('uColor', newValue ?? DEFAULT_COLOR));
		this.addParameter('metalness', MateriaParameterType.NormalizedFloat, 0, newValue => { this.uniforms['uMetalness'] = newValue });
		this.addParameter('roughness', MateriaParameterType.NormalizedFloat, 0, newValue => { this.uniforms['uRoughness'] = newValue });
		this.addParameter('color_texture', MateriaParameterType.Texture, null, newValue => this.setTexture('uColorTexture', newValue, 'USE_COLOR_TEXTURE'));
		this.addParameter('normal_texture', MateriaParameterType.Texture, null, newValue => this.setTexture('uNormalTexture', newValue, 'USE_NORMAL_TEXTURE'));
		this.addParameter('metalness_texture', MateriaParameterType.Texture, null, newValue => this.setTexture('uMetalnessTexture', newValue, 'USE_METALNESS_TEXTURE'));
		this.addParameter('roughness_texture', MateriaParameterType.Texture, null, newValue => this.setTexture('uRoughnessTexture', newValue, 'USE_ROUGHNESS_TEXTURE'));
		this.setParameters(params);
	}

	setParameters(params: any = {}) {
		this.setColor(params.color);
		this.setMetalness(params.metalness);
		this.setRoughness(params.roughness);
		this.setColorTexture(params.colorTexture);
		this.setNormalTexture(params.normalTexture);
		this.setMetalnessTexture(params.metalnessTexture);
		this.setRoughnessTexture(params.roughnessTexture);
	}

	setColor(color) {
		if (color !== undefined) {
			this.setParameterValue('color', color);
		}
	}

	setMetalness(metalness) {
		if (metalness !== undefined) {
			this.setParameterValue('metalness', metalness);
		}
	}

	setRoughness(roughness) {
		if (roughness !== undefined) {
			this.setParameterValue('roughness', roughness);
		}
	}

	setColorTexture(colorTexture) {
		if (colorTexture !== undefined) {
			this.setParameterValue('color_texture', colorTexture);
		}
	}

	setNormalTexture(normalTexture) {
		if (normalTexture !== undefined) {
			this.setParameterValue('normal_texture', normalTexture);
		}
	}

	setMetalnessTexture(metalnessTexture) {
		if (metalnessTexture !== undefined) {
			this.setParameterValue('metalness_texture', metalnessTexture);
		}
	}

	setRoughnessTexture(roughnessTexture) {
		if (roughnessTexture !== undefined) {
			this.setParameterValue('roughness_texture', roughnessTexture);
		}
	}

	get shaderSource() {
		return 'meshbasicpbr';
	}

	toJSON() {
		let json = super.toJSON();
		return json;
	}

	static async constructFromJSON(json) {
		return new MeshBasicPbrMaterial();
	}

	fromJSON(json) {
		super.fromJSON(json);
	}

	get entityName() {
		return 'MeshBasicPbrMaterial';
	}

	static get entityName() {
		return 'MeshBasicPbrMaterial';
	}
}
Material.materialList['MeshBasicPbr'] = MeshBasicPbrMaterial;
JSONLoader.registerEntity(MeshBasicPbrMaterial);