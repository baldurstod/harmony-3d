import { GraphicsEvents, GraphicsEvent, GraphicTickEvent } from '../../../graphics/graphicsevents';
import { getLoader } from '../../../loaders/loaderfactory';
import { Repositories } from '../../../repositories/repositories';
import { FileSelectorFile } from '../../../utils/fileselector/file';
import { SourcePCF } from '../loaders/sourcepcf';
import { SourceEngineParticleSystem } from './sourceengineparticlesystem';

export class Source1ParticleControler {
	static #loadManifestPromises: { [key: string]: Promise<boolean> } = {};
	static speed = 1.0;
	static visible?: boolean = true;
	static #systemList: { [key: string]: SourceEngineParticleSystem } = {};//TODOv3: make map
	static #activeSystemList = new Map();
	static #pcfList: { [key: string]: SourcePCF } = {};
	static #systemNameToPcf: { [key: string]: { [key: string]: string } | null } = {};
	static #sourceEngineParticleSystem: typeof SourceEngineParticleSystem;
	static fixedTime?: number;

	static {
		GraphicsEvents.addEventListener(GraphicsEvent.Tick, (event: Event) => {
			this.stepSystems(this.fixedTime ? (this.fixedTime * (event as CustomEvent<GraphicTickEvent>).detail.delta) : (event as CustomEvent<GraphicTickEvent>).detail.delta);//TODOv3: imporve this
		});
	}

	static setParticleConstructor(ps: typeof SourceEngineParticleSystem) {
		this.#sourceEngineParticleSystem = ps;
	}

	/**
	 * Reset all active systems
	 */
	static resetAll() {
		for (let system of this.#activeSystemList.values()) {
			system.reset();
		}
	}
	/**
	 * Step systems
	 * @param {Number} elapsedTime Step time
	 */
	static stepSystems(elapsedTime: number) {
		if (elapsedTime) {
			elapsedTime *= this.speed;
			elapsedTime = Math.min(elapsedTime, 0.1);
			for (let system of this.#activeSystemList.values()) {
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
	static addSystem2(system: SourceEngineParticleSystem) {
		this.#systemList[system.id] = system;
	}

	/**
	 * Create system
	 * @param {Number} elapsedTime Step time
	 */
	static async createSystem(repository: string, systemName: string) {//TODOv2
		if (!repository) {
			//try to get repository from filename
			for (let repo in this.#systemNameToPcf) {
				if (systemName.startsWith(repo)) {
					repository = repo;
					systemName = systemName.replace(repo, '');
					break;
				}
			}
			let index = systemName.lastIndexOf('.pcf/');
			if (index != -1) {
				systemName = systemName.substring(index + 5);
			}

		}
		let ps = new this.#sourceEngineParticleSystem({ repository: repository, name: systemName });//TODOV2
		this.#systemList[ps.id] = ps;

		await this.#createSystem(repository, ps);
		return ps;
	}

	/**
	 * Create system
	 * @param {Number} elapsedTime Step time
	 */
	static async #createSystem(repositoryName: string, system: SourceEngineParticleSystem) {
		let pcfName = await this.#getPcfBySystemName(repositoryName, system.name);
		if (pcfName) {
			let pcf = await this.#getPcf(repositoryName, 'particles/' + pcfName);
			if (pcf) {
				pcf.initSystem(system);
			}
		}
	}

	static async #getPcfBySystemName(repository: string, systemName: string) {
		await this.#loadManifest(repository);
		let systemNameToPcfRepo = this.#systemNameToPcf[repository];

		if (systemNameToPcfRepo) {
			return systemNameToPcfRepo[systemName];
		}
		return null;


		/*

					let promise = new Promise((resolve, reject) => {
						let systemNameToPcfRepo = systemNameToPcf[repository];
						if (systemNameToPcfRepo) {
							resolve(systemNameToPcfRepo[systemName]);
						} else {
							let kallback = () => {
								resolve(systemNameToPcf[repository][systemName]);
							}
							this.#loadManifest(repository).then(kallback, reject);//TODOv2: root
						}
					});
					return promise;*/
	}

	static async loadManifest(repository: string) {
		if (this.#systemNameToPcf[repository] === undefined) {
			this.#systemNameToPcf[repository] = null;
		}
	}

	/**
	 * TODO
	 */
	static async #loadManifest(repositoryName: string) {
		this.#loadManifestPromises[repositoryName] = this.#loadManifestPromises[repositoryName] ?? new Promise(async (resolve, reject) => {
			let systemNameToPcfRepo: { [key: string]: string } = {};
			this.#systemNameToPcf[repositoryName] = systemNameToPcfRepo;


			const response = await new Repositories().getFileAsJson(repositoryName, 'particles/manifest.json');//TODO const
			if (response.error) {
				reject(false);
			}

			const json: any/*TODO: change type*/ = response.json;

			if (json && json.files) {
				for (let file of json.files) {
					let pcfName = file.name;
					for (let definition of file.particlesystemdefinitions) {
						systemNameToPcfRepo[definition] = pcfName;
					}
				}
				resolve(true);
			} else {
				reject(false);
			}
		});
		return this.#loadManifestPromises[repositoryName];
	}

	/**
	 * Start all systems
	 */
	static startAll() {
		for (let system of this.#activeSystemList.values()) {
			system.start();
		}
	}

	/**
	 * Stop all systems
	 */
	static stopAll() {
		for (let system of this.#activeSystemList.values()) {
			system.stop();
		}
	}

	/**
	 * Set a system active
	 */
	static setActive(system: SourceEngineParticleSystem) {
		if (!system) {
			return;
		}
		this.#activeSystemList.set(system.id, system);
	}

	/**
	 * Set a system inactive
	 */
	static setInactive(system: SourceEngineParticleSystem) {
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
	static async #getPcf(repositoryName: string, pcfName: string): Promise<SourcePCF> {
		let promise = new Promise<SourcePCF>((resolve, reject) => {
			let pcf = this.#pcfList[pcfName];
			if (!pcf) {
				let callback1 = (pcf: SourcePCF) => {
					if (pcf) {
						this.#pcfList[pcfName] = pcf;
						pcf.repositoryName = repositoryName;
					}
					resolve(pcf);
				}
				this.#loadPcf(repositoryName, pcfName).then(callback1);
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
		let promise = new Promise<SourcePCF>((resolve, reject) => {//TODO: process reject
			let pcfLoader = getLoader('SourceEnginePCFLoader');
			new pcfLoader().load(repositoryName, pcfName).then(
				(pcf: SourcePCF) => resolve(pcf)
			);//TODOv3: handle reject
		});
		return promise;
	}

	static setSpeed(s: number) {
		this.speed = s;
	}

	static async getSystemList(): Promise<FileSelectorFile> {
		let repoList: Array<FileSelectorFile> = [];
		let pcfs: { [key: string]: Array<{ name: string }> } = {};
		for (let repoName in this.#systemNameToPcf) {
			await this.#loadManifest(repoName);
			let repo = this.#systemNameToPcf[repoName];

			for (let systemName in repo) {
				let pcfName = repo[systemName];
				if (!pcfs[pcfName]) {
					pcfs[pcfName] = [];
				}
				pcfs[pcfName].push({ name: systemName });
			}
			let pcfList = [];
			for (let pcfName in pcfs) {
				pcfList.push({ name: pcfName, files: pcfs[pcfName] })
			}
			repoList.push({ name: repoName, files: pcfList });
		}
		return { name: '', path: '', files: repoList };
	}

	static set renderSystems(renderSystems: boolean) {
		this.visible = renderSystems ? undefined : false;
	}
}
