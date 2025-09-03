import { vec3 } from 'gl-matrix';
import { MapEntities } from '../mapentities';
import { MapEntity, ParseVector } from '../mapentity';
/**
 * func_detail
 */
export class FuncDetail extends MapEntity {
	constructor(classname) {
		super(classname);
	}

	setKeyValues(kvElement) {
		super.setKeyValues(kvElement);
		const result = /^\*(\d*)$/.exec(kvElement.model);

		if (result) {
			this.map.funcBrushesRemoveMe.push({ model: result[1], origin: ParseVector(vec3.create(), kvElement.origin) });
		}
	}
}
MapEntities.registerEntity('func_detail', FuncDetail);
MapEntities.registerEntity('func_detail_blocker', FuncDetail);
MapEntities.registerEntity('func_lod', FuncDetail);
