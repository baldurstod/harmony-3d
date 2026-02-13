import { Map2 } from 'harmony-utils';
import { GraphicsEvent, GraphicsEvents, GraphicTickEvent } from '../../../graphics/graphicsevents';
import { Source1ModelInstance } from '../export';
import { Choreographies } from './choreographies';
import { Choreography } from './choreography';

export class ChoreographiesManager {
	static #playbackSpeed = 1.0;
	static #playing = true;
	static readonly #choreographies = new Set<Choreography>();
	static #sceneImage?: Promise<Choreographies>;
	static #vcds = new Map2<string, string, Choreography/*TODO: create a choreography definition*/>();

	static async init(repositoryName: string, fileName: string): Promise<void> {
		if (!this.#sceneImage) {
			this.#sceneImage = new Promise<Choreographies>(resolve => {
				const choreographies = new Choreographies();
				choreographies.loadFile(repositoryName, fileName).then(() => resolve(choreographies));
				GraphicsEvents.addEventListener(GraphicsEvent.Tick, (event: Event) => {
					if ((event as CustomEvent<GraphicTickEvent>).detail.delta) {
						this.step((event as CustomEvent<GraphicTickEvent>).detail.delta);
					}
				});

			});
		}
		await this.#sceneImage;
	}

	static async playChoreography(repository: string, choreoName: string, actors: Source1ModelInstance[]): Promise<Choreography | null> {
		let choreography: Choreography | undefined | null = this.#vcds.get(repository, choreoName);

		if (!choreography && this.#sceneImage) {
			choreography = await (await this.#sceneImage).getChoreography(choreoName);
		}

		if (!choreography) {
			return null;
		}

		this.#choreographies.add(choreography);
		choreography.setActors(actors);
		return choreography;
	}

	static addChoreography(repository: string, choreoName: string, choreo: Choreography): void {
		this.#vcds.set(repository, choreoName, choreo);
	}

	static async getChoreography(repository: string, choreoName: string): Promise<Choreography | null> {
		let choreography: Choreography | undefined | null = this.#vcds.get(repository, choreoName);
		if (choreography) {
			return choreography;
		}

		if (this.#sceneImage) {
			return await (await this.#sceneImage).getChoreography(choreoName);
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
