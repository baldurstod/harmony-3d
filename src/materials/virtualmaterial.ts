import { Entity } from '../entities/entity';
import { HasMaterial } from '../interfaces/hasmaterial';
import { Material, MaterialParams } from './material';

export type VirtualMaterialParams = MaterialParams & {
	entity?: Entity;
};

/**
 * A virtual material is a material meant to be used with entitites that doesn't have material
 * but can have childs with materials.
 */
export class VirtualMaterial extends Material {
	entity: Entity | null = null;

	constructor(params: VirtualMaterialParams = {}) {
		super(params);
		this.setEntity(params.entity ?? null);
	}

	setEntity(entity: Entity | null): void {
		this.entity = entity;
	}

	setDefine(define: string, value = ''): void {
		this.entity?.forEach((ent: Entity) => {
			if ((ent as unknown as HasMaterial).hasMaterial) {
				(ent as unknown as HasMaterial).getMaterial().setDefine(define, value);
			}
		});
	}

	removeDefine(define: string) {
		this.entity?.forEach((ent: Entity) => {
			if ((ent as unknown as HasMaterial).hasMaterial) {
				(ent as unknown as HasMaterial).getMaterial().removeDefine(define);
			}
		});
	}

	override getShaderSource(): string {
		return 'virtual';
	}
}
