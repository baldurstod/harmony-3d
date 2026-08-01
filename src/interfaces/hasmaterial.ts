import { Material } from '../materials/material';

export interface HasMaterial {
	hasMaterial: true;
	setMaterial(material: Material): void;
	getMaterial(): Material;
}
