import { vec3 } from 'gl-matrix';

import { Entity } from '../../entities/entity';
import { MATERIAL_BLENDING_NORMAL } from '../../materials/material';
import { MeshBasicMaterial } from '../../materials/meshbasicmaterial';
import { Box } from '../../primitives/box';
import { registerEntity } from '../../entities/entities';

const tempVec3 = vec3.create();

let boxMaterial;

export class HitboxHelper extends Entity {
	#hitboxes = [];
	constructor() {
		super();

		if (!boxMaterial) {
			boxMaterial = new MeshBasicMaterial();
			boxMaterial.setMeshColor([0.5, 0.5, 0.5, 0.1]);
			boxMaterial.setBlending(MATERIAL_BLENDING_NORMAL);
		}
	}

	parentChanged(parent) {
		this.removeBoxes();
		if (parent && parent.getHitboxes) {
			let hitboxes = parent.getHitboxes();
			for (let hitbox of hitboxes) {
				vec3.sub(tempVec3, hitbox.boundingBoxMax, hitbox.boundingBoxMin);
				let box = new Box({width: tempVec3[0], height: tempVec3[1], depth: tempVec3[2], material: boxMaterial});
				box.serializable = false;
				vec3.lerp(tempVec3, hitbox.boundingBoxMin, hitbox.boundingBoxMax, 0.5);
				box.position = tempVec3;

				if (hitbox.parent) {
					hitbox.parent.addChild(box);
				} else {
					this.addChild(box);
				}


				this.#hitboxes.push(box);
			}
		}
	}

	removeBoxes() {
		this.#hitboxes.forEach(hitbox => hitbox.dispose());
		this.#hitboxes = [];
	}

	static async constructFromJSON() {
		return new HitboxHelper();
	}

	static getEntityName() {
		return 'HitboxHelper';
	}
}
registerEntity(HitboxHelper);
