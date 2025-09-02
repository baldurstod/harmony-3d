import { MapEntity } from '../mapentity';

/**
 * Output Event
 */
export class OutputEvent {
	outputName: string

	constructor(outputName: string) {
		this.outputName = outputName.toLowerCase();
	}

	fireOutput(activator: MapEntity, caller: MapEntity) {
		caller.fireOutput(this.outputName);
	}
}
