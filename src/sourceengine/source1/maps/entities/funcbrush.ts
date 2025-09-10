import { vec3 } from 'gl-matrix';
import { KvElement } from '../../loaders/kvreader';
import { MapEntities } from '../mapentities';
import { MapEntity, ParseVector } from '../mapentity';

export class FuncBrush extends MapEntity {

	setKeyValues(kvElement: KvElement) {
		super.setKeyValues(kvElement);
		const result = /^\*(\d*)$/.exec((kvElement as any/*TODO: fix that*/).model);

		if (result && result.length >= 2) {
			if ((kvElement as any/*TODO: fix that*/).rendermode && (kvElement as any/*TODO: fix that*/).rendermode != 10) {
				this.map.funcBrushesRemoveMe.push({ model: Number(result[1]), origin: ParseVector(vec3.create(), (kvElement as any/*TODO: fix that*/).origin) ?? vec3.create() });
				console.error((kvElement as any/*TODO: fix that*/).origin, kvElement);
			}
		}
	}
}
MapEntities.registerEntity('func_brush', FuncBrush);
