import { Choreographies } from './choreographies';
import { GraphicsEvents, GraphicsEvent } from '../../../graphics/graphicsevents';
import { Choreography } from './choreography';


export class ChoreographiesManager {
	static #playbackSpeed = 1.0;
	static #playing = true;
	static #choreographies = new Set<Choreography>();
	static #sceneImage;

	static async init(repositoryName, fileName) {
		if (!this.#sceneImage) {
			this.#sceneImage = new Choreographies();
			await this.#sceneImage.loadFile(repositoryName, fileName);
			GraphicsEvents.addEventListener(GraphicsEvent.Tick, (event: CustomEvent) => {
				this.step(event.detail.delta);
			});
		}
	}

	static async playChoreography(choreoName, actors, onStop) {
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

	static step(elapsed) {
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

	static reset() {
		for (let choreography of this.#choreographies) {
			choreography.reset();
		}
	}

	static stopAll() {
		for (let choreography of this.#choreographies) {
			choreography.stop();
			this.#choreographies.delete(choreography);
		}
	}

	static play() {
		this.#playing = true;
	}

	static pause() {
		this.#playing = false;
	}

	static set playbackSpeed(playbackSpeed) {
		this.#playbackSpeed = playbackSpeed;
	}
}
