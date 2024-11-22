import { Choreographies } from './choreographies';
import { GraphicsEvents, GraphicsEvent } from '../../../graphics/graphicsevents';
import { Choreography } from './choreography';


export class ChoreographiesManager {
	static #instance: ChoreographiesManager;
	#playbackSpeed = 1.0;
	#playing = true;
	#choreographies = new Set<Choreography>();
	#sceneImage?: Choreographies;

	constructor() {
		if (ChoreographiesManager.#instance) {
			return ChoreographiesManager.#instance;
		}
		ChoreographiesManager.#instance = this;
	}

	async init(repositoryName, fileName) {
		if (!this.#sceneImage) {
			this.#sceneImage = new Choreographies();
			await this.#sceneImage.loadFile(repositoryName, fileName);
			GraphicsEvents.addEventListener(GraphicsEvent.Tick, (event: CustomEvent) => {
				this.step(event.detail.delta);
			});
		}
	}

	async playChoreography(choreoName, actors, onStop) {
		if (this.#sceneImage) {
			const choreography = await this.#sceneImage.getChoreography(choreoName);
			if (choreography) {
				//choreography.play();
				this.#choreographies.add(choreography);
				choreography.setActors(actors);
				choreography.onStop = onStop;
			}/* else {
				setTimeout(function() {playChoreo(choreoName, actors, onStop)}, 100);
			}*/
		}
	}

	async getChoreography(choreoName: string): Promise<Choreography | null> {
		if (this.#sceneImage) {
			return await this.#sceneImage.getChoreography(choreoName);
		}
		return null;
	}

	step(elapsed) {
		if (!this.#playing) {
			return;
		}
		elapsed = elapsed * this.#playbackSpeed;
		for (let choreography of this.#choreographies) {
			if (!choreography.step(elapsed)) {
				this.#choreographies.delete(choreography);
			}
		}
	}

	reset() {
		for (let choreography of this.#choreographies) {
			choreography.reset();
		}
	}

	stopAll() {
		for (let choreography of this.#choreographies) {
			choreography.stop();
			this.#choreographies.delete(choreography);
		}
	}

	play() {
		this.#playing = true;
	}

	pause() {
		this.#playing = false;
	}

	set playbackSpeed(playbackSpeed) {
		this.#playbackSpeed = playbackSpeed;
	}
}
