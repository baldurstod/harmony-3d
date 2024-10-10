import { MapEntity, ParseVector } from '../mapentity';
import { MapEntities } from '../mapentities';

export class FuncBrush extends MapEntity {
	constructor(classname) {
		super(classname);
	}

	setKeyValues(kvElement) {
		super.setKeyValues(kvElement);
		const result = /^\*(\d*)$/.exec(kvElement.model);

		if (result) {
			if (kvElement.rendermode && kvElement.rendermode != 10) {
				this.map.funcBrushesRemoveMe.push({model:result[1], origin: ParseVector(kvElement.origin)});
				console.error(kvElement.origin, kvElement);
			}
		}
	}
}
MapEntities.registerEntity('func_brush', FuncBrush);
