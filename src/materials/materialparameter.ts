import { mat2, mat3, mat4, vec2, vec3, vec4 } from 'gl-matrix';
import { isVec4 } from '../math/vector';
import { Texture } from '../textures/texture';

export enum MateriaParameterType {
	None = 0,
	Boolean,
	Integer,
	Float,
	NormalizedFloat,
	ClampedFloat,
	Vec2,
	Vec3,
	Vec4,
	Mat2,
	Mat3,
	Mat4,
	Color2,
	Color3,
	Color4,
	Texture,
	Texture1D,
	Texture2D,
	Texture3D,
}

export type MateriaParameterValue = null | boolean | number | vec2 | vec3 | vec4 | mat2 | mat3 | mat4 | Texture;

export type ParameterChanged = (newValue: any, oldValue?: any) => void;

export class MateriaParameter {
	#name: string;
	#type: MateriaParameterType = MateriaParameterType.None;
	#value: any
	#changed?: ParameterChanged
	constructor(name: string, type: MateriaParameterType, value: MateriaParameterValue, changed?: ParameterChanged) {
		this.#name = name;
		this.#type = type;
		this.#changed = changed;
		this.setValue(value);
	}

	setValue(value: any) {
		if (!this.#checkValue(value)) {
			console.warn('Material parameter value has an incorrect type');
		}
		// Todo: check value type
		// Todo: check if value actually changed
		if (this.#changed) {
			this.#changed(value, this.#value);
		}
		this.#value = value;
	}

	#checkValue(value: any): boolean {
		if (value === undefined || value === null) {
			return true;
		}

		switch (this.#type) {
			case MateriaParameterType.NormalizedFloat:
				return (typeof value == 'number') && (value >= 0) && (value <= 1);
			case MateriaParameterType.Color4:
				return isVec4(value);
			case MateriaParameterType.Texture:
				return value.isTexture;
			default:
				throw 'unknown type: ' + this.#type;
				break;
		}
	}
}
