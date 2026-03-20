import { Material } from '../materials/material';
import { Mesh } from '../objects/mesh';

export function getDefines(meshOrMaterial: Material | Mesh, defines: Map<string, string>): void {
	for (const [name, value] of Object.entries(meshOrMaterial.defines)) {
		defines.set(name, value as string);
	}
}

export function getIncludeCode(defines: Map<string, string>): string {
	let includeCode = '';
	for (const define of defines) {
		includeCode += `#define ${define[0]} ${define[1]}\n`;
	}

	return includeCode;
}
