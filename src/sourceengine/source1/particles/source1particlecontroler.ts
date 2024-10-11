import { GraphicsEvents, GraphicsEvent } from '../../../graphics/graphicsevents';
import { getLoader } from '../../../loaders/loaderfactory';
import { Repositories } from '../../../misc/repositories';
import { customFetch } from '../../../utils/customfetch';
import { SourcePCF } from '../loaders/sourcepcf';

export class Source1ParticleControler {
	static #loadManifestPromises = {};
	static speed = 1.0;
	static visible: boolean = true;
	static #systemList = {};//TODOv3: make map
	static #activeSystemList = new Map();
	static #pcfList = {};
	static #systemNameToPcf = {};
	static #sourceEngineParticleSystem;
	static fixedTime?: number;

	static {
		GraphicsEvents.addEventListener(GraphicsEvent.Tick, (event: CustomEvent) => {
			this.stepSystems(this.fixedTime ?? event.detail.delta);//TODOv3: imporve this
		});
	}

	static setParticleConstructor(ps) {
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
	static stepSystems(elapsedTime) {
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
	static addSystem(repository, name) {
		let ps = new this.#sourceEngineParticleSystem({ repository: repository, name: name });
		if (ps) {
			this.#systemList[ps.id] = ps;
			this.#updateOrCreatePS(ps);
		}
		return ps;
	}

	/**
	 * Add system TODO
	 * @param {Number} elapsedTime Step time
	 */
	static addSystem2(system) {
		this.#systemList[system.id] = system;
	}

	/**
	 * Create system
	 * @param {Number} elapsedTime Step time
	 */
	static async createSystem(repository, systemName) {//TODOv2
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
	static async #createSystem(repositoryName, system) {
		let pcfName = await this.#getPcfBySystemName(repositoryName, system.name);
		if (pcfName) {
			let pcf = await this.#getPcf(repositoryName, 'particles/' + pcfName);
			if (pcf) {
				pcf.initSystem(system);
			}
		}
	}

	static async #getPcfBySystemName(repository, systemName) {
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

	static async loadManifest(repository) {
		if (this.#systemNameToPcf[repository] === undefined) {
			this.#systemNameToPcf[repository] = null;
		}
	}

	/**
	 * TODO
	 */
	static async #loadManifest(repositoryName) {//TODO: async
		const repository = Repositories.getRepository(repositoryName);
		if (!repository) {
			console.error(`Unknown repository ${repositoryName} in Source1ParticleControler.#loadManifest`);
			return null;
		}

		this.#loadManifestPromises[repositoryName] = this.#loadManifestPromises[repositoryName] ?? new Promise((resolve, reject) => {
			let manifestUrl = new URL('particles/manifest.json', repository.base);//todo variable

			let systemNameToPcfRepo = {};
			this.#systemNameToPcf[repositoryName] = systemNameToPcfRepo;

			customFetch(new Request(manifestUrl)).then((response) => {
				response.ok && response.json().then((json) => {
					if (json && json.files) {
						for (let file of json.files) {
							let pcfName = file.name;
							for (let definition of file.particlesystemdefinitions) {
								systemNameToPcfRepo[definition] = pcfName;
							}
						}

						/*let lines = text.split('\n');
						let line;
						let pcfName = null;
						while (line = lines.shift()) {
							if (line.indexOf('#') == 0) { // pcf
								pcfName = line.substring(1);
							} else {
								systemNameToPcfRepo[line] = pcfName;
							}
						}*/
						resolve(true);
					} else {
						reject(false);
					}
				})
			});
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
	static setActive(system) {
		if (!system) {
			return;
		}
		this.#activeSystemList.set(system.id, system);
	}

	/**
	 * Set a system inactive
	 */
	static setInactive(system) {
		if (!system) {
			return;
		}
		this.#activeSystemList.delete(system.id);
	}

	/**
	 * Update or create system
	 */
	static #updateOrCreatePS(system) {
		let p = this.#systemList[system.id];
		if (p == null) {
			p = this.addSystem(system, '');//TODOv3
			throw 'fix me';
		}
	}

	/**
	 * Get a pcf from cache or load it
	 * @param {String} name Name of the pcf
	 * @return {Object SourcePCF} Pcf
	 */
	static async #getPcf(repositoryName, pcfName): Promise<SourcePCF> {
		let promise = new Promise<SourcePCF>((resolve, reject) => {
			let pcf = this.#pcfList[pcfName];
			if (!pcf) {
				let callback1 = (pcf) => {
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
	static async #loadPcf(repositoryName, pcfName) {
		//TODO: return an empty system if not found?
		let promise = new Promise((resolve, reject) => {//TODO: process reject
			let pcfLoader = getLoader('SourceEnginePCFLoader');
			new pcfLoader().load(repositoryName, pcfName).then(
				pcf => resolve(pcf)
			);//TODOv3: handle reject
		});
		return promise;
	}

	static setSpeed(s) {
		this.speed = s;
	}

	static async getSystemList() {
		let repoList = [];
		let pcfs = {};
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
		return { files: repoList };
	}

	static set renderSystems(renderSystems) {
		this.visible = renderSystems ? undefined : false;
	}
}
