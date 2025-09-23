import { vec4 } from 'gl-matrix';
import { JSONObject } from 'harmony-types';
import { registerEntity } from '../../entities/entities';
import { Texture } from '../../textures/texture';
import { DEFAULT_COLOR, Material } from '../material';
import { MateriaParameterType } from '../materialparameter';

export class MeshBasicPbrMaterial extends Material {
	constructor(params: any/*TODO: create parameters type*/ = {}) {
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

	setParameters(params: any /*TODO: create parameters type*/ = {}) {
		this.setColor(params.color);
		this.setMetalness(params.metalness);
		this.setRoughness(params.roughness);
		this.setColorTexture(params.colorTexture);
		this.setNormalTexture(params.normalTexture);
		this.setMetalnessTexture(params.metalnessTexture);
		this.setRoughnessTexture(params.roughnessTexture);
	}

	setColor(color: vec4/*TODO: change to Color*/) {
		this.setParameterValue('color', color);
	}

	setMetalness(metalness: number) {
		this.setParameterValue('metalness', metalness);
	}

	setRoughness(roughness: number) {
		this.setParameterValue('roughness', roughness);
	}

	setColorTexture(colorTexture: Texture) {
		this.setParameterValue('color_texture', colorTexture);
	}

	setNormalTexture(normalTexture: Texture) {
		this.setParameterValue('normal_texture', normalTexture);
	}

	setMetalnessTexture(metalnessTexture: Texture) {
		this.setParameterValue('metalness_texture', metalnessTexture);
	}

	setRoughnessTexture(roughnessTexture: Texture) {
		this.setParameterValue('roughness_texture', roughnessTexture);
	}

	get shaderSource() {
		return 'meshbasicpbr';
	}

	toJSON() {
		const json = super.toJSON();
		return json;
	}

	static async constructFromJSON(json: JSONObject) {
		return new MeshBasicPbrMaterial();
	}

	fromJSON(json: JSONObject) {
		super.fromJSON(json);
	}

	static getEntityName() {
		return 'MeshBasicPbrMaterial';
	}
}
Material.materialList['MeshBasicPbr'] = MeshBasicPbrMaterial;
registerEntity(MeshBasicPbrMaterial);
