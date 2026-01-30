import { GraphicsEvent, GraphicsEvents, GraphicTickEvent } from '../../../graphics/graphicsevents';
import { Source1ModelInstance } from '../export';
import { Choreographies } from './choreographies';
import { Choreography } from './choreography';

export class ChoreographiesManager {
	static #playbackSpeed = 1.0;
	static #playing = true;
	static readonly #choreographies = new Set<Choreography>();
	static #sceneImage?: Choreographies;

	static async init(repositoryName: string, fileName: string): Promise<void> {
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

	static async playChoreography(choreoName: string, actors: Source1ModelInstance[]): Promise<Choreography | null> {
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

	static async getChoreography(choreoName: string): Promise<Choreography | null> {
		if (this.#sceneImage) {
			return await this.#sceneImage.getChoreography(choreoName);
		}
		return null;
	}

	static step(elapsed: number): void {
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

	static reset(): void {
		for (const choreography of this.#choreographies) {
			choreography.reset();
		}
	}

	static stopAll(): void {
		for (const choreography of this.#choreographies) {
			choreography.stop();
			this.#choreographies.delete(choreography);
		}
	}

	static play(): void {
		this.#playing = true;
	}

	static pause(): void {
		this.#playing = false;
	}

	static setPlaybackSpeed(playbackSpeed: number): void {
		this.#playbackSpeed = playbackSpeed;
	}
}
