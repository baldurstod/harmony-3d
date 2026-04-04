import { GraphicsEvent, GraphicsEvents, GraphicTickEvent } from '../../../graphics/graphicsevents';
import { getLoader } from '../../../loaders/loaderfactory';
import { Repositories } from '../../../repositories/repositories';
import { FileSelectorFile } from '../../../utils/fileselector/file';
import { Source1PcfLoader } from '../export';
import { SourcePCF } from '../loaders/sourcepcf';
import { Source1ParticleSystem } from './source1particlesystem';

export class Source1ParticleControler {
	static #loadManifestPromises: Record<string, Promise<boolean>> = {};
	static speed = 1.0;
	static #systemList: Record<string, Source1ParticleSystem> = {};//TODOv3: make map
	static #activeSystemList = new Map<string, Source1ParticleSystem>();
	static #pcfList: Record<string, SourcePCF> = {};
	static #systemNameToPcf: Record<string, Record<string, string> | null> = {};
	static #sourceEngineParticleSystem: typeof Source1ParticleSystem;
	static fixedTime?: number;

	static {
		GraphicsEvents.addEventListener(GraphicsEvent.Tick, (event: Event) => {
			this.stepSystems(this.fixedTime ? (this.fixedTime * (event as CustomEvent<GraphicTickEvent>).detail.speed) : (event as CustomEvent<GraphicTickEvent>).detail.delta);//TODOv3: imporve this
		});
	}

	static setParticleConstructor(ps: typeof Source1ParticleSystem): void {
		this.#sourceEngineParticleSystem = ps;
	}

	/**
	 * Reset all active systems
	 */
	static resetAll(): void {
		for (const system of this.#activeSystemList.values()) {
			system.reset();
		}
	}
	/**
	 * Step systems
	 * @param {Number} elapsedTime Step time
	 */
	static stepSystems(elapsedTime: number): void {
		if (elapsedTime) {
			elapsedTime *= this.speed;
			elapsedTime = Math.min(elapsedTime, 0.1);
			for (const system of this.#activeSystemList.values()) {
				if (system.parentSystem === undefined) {
					system.step(elapsedTime);
				}
			}
		}
	}

	/**
	 * Add system TODO
	 * @param {Number} elapsedTime Step time
	 */
	static addSystem2(system: Source1ParticleSystem): void {
		this.#systemList[system.id] = system;
	}

	/**
	 * Create system
	 */
	static async createSystem(repository: string, systemName: string): Promise<Source1ParticleSystem> {
		if (!repository) {
			//try to get repository from filename
			for (const repo in this.#systemNameToPcf) {
				if (systemName.startsWith(repo)) {
					repository = repo;
					systemName = systemName.replace(repo, '');
					break;
				}
			}
			const index = systemName.lastIndexOf('.pcf/');
			if (index != -1) {
				systemName = systemName.substring(index + 5);
			}

		}
		const ps = new this.#sourceEngineParticleSystem({ repository: repository, name: systemName });//TODOV2
		this.#systemList[ps.id] = ps;

		await this.#createSystem(repository, ps);
		return ps;
	}

	/**
	 * Create system
	 * @param {Number} elapsedTime Step time
	 */
	static async #createSystem(repositoryName: string, system: Source1ParticleSystem): Promise<void> {
		const pcfName = await this.#getPcfBySystemName(repositoryName, system.name);
		if (pcfName) {
			const pcf = await this.#getPcf(repositoryName, 'particles/' + pcfName);
			if (pcf) {
				pcf.initSystem(system);
			}
		}
	}

	static async #getPcfBySystemName(repository: string, systemName: string): Promise<string | null | undefined> {
		await this.#loadManifest(repository);
		const systemNameToPcfRepo = this.#systemNameToPcf[repository];

		if (systemNameToPcfRepo) {
			return systemNameToPcfRepo[systemName];
		}
		return null;
	}

	static loadManifest(repository: string): void {
		if (this.#systemNameToPcf[repository] === undefined) {
			this.#systemNameToPcf[repository] = null;
		}
	}

	/**
	 * TODO
	 */
	static async #loadManifest(repositoryName: string): Promise<boolean> {
		this.#loadManifestPromises[repositoryName] = this.#loadManifestPromises[repositoryName] ?? new Promise((resolve) => {
			(async (): Promise<void> => {
				const systemNameToPcfRepo: Record<string, string> = {};
				this.#systemNameToPcf[repositoryName] = systemNameToPcfRepo;


				const response = await Repositories.getFileAsJson(repositoryName, 'particles/manifest.json');//TODO const
				if (response.error) {
					resolve(false);
				}

				const json: any/*TODO: change type*/ = response.json;

				if (json && json.files) {
					for (const file of json.files) {
						const pcfName = file.name;
						for (const definition of file.particlesystemdefinitions) {
							systemNameToPcfRepo[definition] = pcfName;
						}
					}
					resolve(true);
				} else {
					resolve(false);
				}
			})();
		});
		return this.#loadManifestPromises[repositoryName];
	}

	/**
	 * Start all systems
	 */
	static startAll(): void {
		for (const system of this.#activeSystemList.values()) {
			system.start();
		}
	}

	/**
	 * Stop all systems
	 */
	static stopAll(): void {
		for (const system of this.#activeSystemList.values()) {
			system.stop();
		}
	}

	/**
	 * Set a system active
	 */
	static setActive(system: Source1ParticleSystem): void {
		if (!system) {
			return;
		}
		this.#activeSystemList.set(system.id, system);
	}

	/**
	 * Set a system inactive
	 */
	static setInactive(system: Source1ParticleSystem): void {
		if (!system) {
			return;
		}
		this.#activeSystemList.delete(system.id);
	}

	/**
	 * Get a pcf from cache or load it
	 * @param {String} name Name of the pcf
	 * @return {Object SourcePCF} Pcf
	 */
	static async #getPcf(repository: string, pcfName: string): Promise<SourcePCF> {
		const promise = new Promise<SourcePCF>(resolve => {
			const pcf = this.#pcfList[pcfName];
			if (!pcf) {
				const callback1 = (pcf: SourcePCF): void => {
					if (pcf) {
						this.#pcfList[pcfName] = pcf;
						pcf.repository = repository;
					}
					resolve(pcf);
				}
				this.#loadPcf(repository, pcfName).then(callback1);
			} else {
				resolve(pcf);
			}
		});
		return promise;
	}

	/**
	 * Load a pcf
	 * @param {String} name Name of the pcf
	 * @return {Object SourcePCF} Pcf or null
	 */
	static async #loadPcf(repositoryName: string, pcfName: string): Promise<SourcePCF> {
		//TODO: return an empty system if not found?
		const promise = new Promise<SourcePCF>(resolve => {
			const pcfLoader = getLoader('Source1PcfLoader') as typeof Source1PcfLoader;
			new pcfLoader().load(repositoryName, pcfName).then(
				pcf => resolve(pcf as SourcePCF)
			);
		});
		return promise;
	}

	static setSpeed(s: number): void {
		this.speed = s;
	}

	static async getSystemList(): Promise<FileSelectorFile> {
		const repoList: FileSelectorFile[] = [];
		for (const repoName in this.#systemNameToPcf) {
			const pcfs: Record<string, { name: string }[]> = {};
			await this.#loadManifest(repoName);
			const repo = this.#systemNameToPcf[repoName];

			for (const systemName in repo) {
				const pcfName = repo[systemName]!;
				if (!pcfs[pcfName]) {
					pcfs[pcfName] = [];
				}
				pcfs[pcfName].push({ name: systemName });
			}
			const pcfList = [];
			for (const pcfName in pcfs) {
				pcfList.push({ name: pcfName, files: pcfs[pcfName] })
			}
			repoList.push({ name: repoName, files: pcfList });
		}
		return { name: '', path: '', files: repoList };
	}
}
