import { GraphicsEvent, GraphicsEvents, GraphicTickEvent } from '../../../graphics/graphicsevents';
import { Source1ModelInstance } from '../export';
import { Choreographies } from './choreographies';
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

	async init(repositoryName: string, fileName: string) {
		if (!this.#sceneImage) {
			this.#sceneImage = new Choreographies();
			await this.#sceneImage.loadFile(repositoryName, fileName);
			GraphicsEvents.addEventListener(GraphicsEvent.Tick, (event: Event) => {
				if ((event as CustomEvent<GraphicTickEvent>).detail.delta) {
					this.step((event as CustomEvent<GraphicTickEvent>).detail.delta);
				}
			});
		}
	}

	async playChoreography(choreoName: string, actors: Source1ModelInstance[]): Promise<Choreography | null> {
		if (this.#sceneImage) {
			const choreography = await this.#sceneImage.getChoreography(choreoName);
			if (choreography) {
				//choreography.play();
				this.#choreographies.add(choreography);
				choreography.setActors(actors);
				//choreography.onStop = onStop;
				return choreography;
			}

			/* else {
				setTimeout(function() {playChoreo(choreoName, actors, onStop)}, 100);
			}*/
		}
		return null;
	}

	async getChoreography(choreoName: string): Promise<Choreography | null> {
		if (this.#sceneImage) {
			return await this.#sceneImage.getChoreography(choreoName);
		}
		return null;
	}

	step(elapsed: number) {
		if (!this.#playing) {
			return;
		}
		elapsed = elapsed * this.#playbackSpeed;
		for (const choreography of this.#choreographies) {
			if (!choreography.step(elapsed)) {
				this.#choreographies.delete(choreography);
			}
		}
	}

	reset() {
		for (const choreography of this.#choreographies) {
			choreography.reset();
		}
	}

	stopAll() {
		for (const choreography of this.#choreographies) {
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

	setPlaybackSpeed(playbackSpeed: number): void {
		this.#playbackSpeed = playbackSpeed;
	}

	/**
	 * @deprecated Please use `setPlaybackSpeed` instead.
	 */
	set playbackSpeed(playbackSpeed: number) {
		this.setPlaybackSpeed(playbackSpeed);
	}
}
