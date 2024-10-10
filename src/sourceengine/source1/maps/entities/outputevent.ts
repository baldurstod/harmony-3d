/**
 * Output Event
 */
export class OutputEvent {
	outputName: string
	constructor(outputName: string) {
		this.outputName = outputName.toLowerCase();
	}

	fireOutput(activator, caller) {
		caller.fireOutput(this.outputName);
	}
}
