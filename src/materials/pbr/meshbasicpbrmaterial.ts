import { vec4 } from 'gl-matrix';
import { JSONObject } from 'harmony-types';
import { registerEntity } from '../../entities/entities';
import { Texture } from '../../textures/texture';
import { DEFAULT_COLOR, Material, MaterialParams } from '../material';
import { MateriaParameterType } from '../materialparameter';

export type MeshBasicPbrMaterialParams = MaterialParams & {
	color?: vec4;
	metalness?: number;
	roughness?: number;
	colorTexture?: Texture;
	normalTexture?: Texture;
	metalnessTexture?: Texture;
	roughnessTexture?: Texture;
}

export class MeshBasicPbrMaterial extends Material {
	constructor(params: MeshBasicPbrMaterialParams = {}) {
		super(params);
		this.addParameter('color', MateriaParameterType.Color4, null, newValue => this.setColor4Uniform('uColor', newValue ?? DEFAULT_COLOR));
		this.addParameter('metalness', MateriaParameterType.NormalizedFloat, 0, newValue => { this.setUniformValue('uMetalness', newValue) });
		this.addParameter('roughness', MateriaParameterType.NormalizedFloat, 0, newValue => { this.setUniformValue('uRoughness', newValue) });
		this.addParameter('color_texture', MateriaParameterType.Texture, null, newValue => this.setTexture('uColorTexture', newValue, 'USE_COLOR_TEXTURE'));
		this.addParameter('normal_texture', MateriaParameterType.Texture, null, newValue => this.setTexture('uNormalTexture', newValue, 'USE_NORMAL_TEXTURE'));
		this.addParameter('metalness_texture', MateriaParameterType.Texture, null, newValue => this.setTexture('uMetalnessTexture', newValue, 'USE_METALNESS_TEXTURE'));
		this.addParameter('roughness_texture', MateriaParameterType.Texture, null, newValue => this.setTexture('uRoughnessTexture', newValue, 'USE_ROUGHNESS_TEXTURE'));
		this.setParameters(params);
	}

	setParameters(params: MeshBasicPbrMaterialParams = {}) {
		this.setColor(params.color);
		this.setMetalness(params.metalness);
		this.setRoughness(params.roughness);
		this.setColorTexture(params.colorTexture);
		this.setNormalTexture(params.normalTexture);
		this.setMetalnessTexture(params.metalnessTexture);
		this.setRoughnessTexture(params.roughnessTexture);
	}

	setColor(color: vec4/*TODO: change to Color*/ | undefined) {
		this.setParameterValue('color', color);
	}

	setMetalness(metalness: number | undefined) {
		this.setParameterValue('metalness', metalness);
	}

	setRoughness(roughness: number | undefined) {
		this.setParameterValue('roughness', roughness);
	}

	setColorTexture(colorTexture: Texture | undefined) {
		this.setParameterValue('color_texture', colorTexture);
	}

	setNormalTexture(normalTexture: Texture | undefined) {
		this.setParameterValue('normal_texture', normalTexture);
	}

	setMetalnessTexture(metalnessTexture: Texture | undefined) {
		this.setParameterValue('metalness_texture', metalnessTexture);
	}

	setRoughnessTexture(roughnessTexture: Texture | undefined) {
		this.setParameterValue('roughness_texture', roughnessTexture);
	}

	override getShaderSource(): string {
		return 'meshbasicpbr';
	}

	toJSON() {
		const json = super.toJSON();
		return json;
	}

	static override async constructFromJSON(json: JSONObject) {
		return new MeshBasicPbrMaterial();
	}

	fromJSON(json: JSONObject) {
		super.fromJSON(json);
	}

	static override getEntityName(): string {
		return 'MeshBasicPbrMaterial';
	}
}
Material.materialList['MeshBasicPbr'] = MeshBasicPbrMaterial;
registerEntity(MeshBasicPbrMaterial);
