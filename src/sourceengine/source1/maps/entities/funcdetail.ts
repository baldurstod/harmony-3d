import { vec3 } from 'gl-matrix';
import { KvElement } from '../../loaders/kvreader';
import { MapEntities } from '../mapentities';
import { MapEntity, ParseVector } from '../mapentity';
/**
 * func_detail
 */
export class FuncDetail extends MapEntity {

	setKeyValues(kvElement: KvElement) {
		super.setKeyValues(kvElement);
		const result = /^\*(\d*)$/.exec((kvElement as any/*TODO: fix that*/).model);

		if (result && result.length >= 2) {
			const origin = vec3.create();
			ParseVector(origin, (kvElement as any/*TODO: fix that*/).origin)
			this.map.funcBrushesRemoveMe.push({ model: result[1]!, origin: origin });
		}
	}
}
MapEntities.registerEntity('func_detail', FuncDetail);
MapEntities.registerEntity('func_detail_blocker', FuncDetail);
MapEntities.registerEntity('func_lod', FuncDetail);
