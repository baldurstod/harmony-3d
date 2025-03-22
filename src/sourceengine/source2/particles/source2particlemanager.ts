import { GraphicsEvents, GraphicsEvent, GraphicTickEvent } from '../../../graphics/graphicsevents';
import { getLoader } from '../../../loaders/loaderfactory';
import { Repositories } from '../../../repositories/repositories';
import { JSONObject } from '../../../types';
import { customFetch } from '../../../utils/customfetch';
import { FileSelectorFile } from '../../../utils/fileselector/file';
import { Source2File } from '../loaders/source2file';
import { Source2ParticleSystem } from './source2particlesystem';

class Source2ParticleManagerClass {// TODO: turn into a proper singleton
	#vpcfs: { [key: string]: Source2File } = {};//TODO: turn to map
	#fileList: { [key: string]: undefined | Array<FileSelectorFile> } = {};//TODO: turn to map and improve type
	speed = 1.0;
	activeSystemList = new Set<Source2ParticleSystem>();
	visible?: boolean;

	constructor() {
		GraphicsEvents.addEventListener(GraphicsEvent.Tick, (event: Event) => {
			this.stepSystems((event as CustomEvent<GraphicTickEvent>).detail.delta);//TODOv3: improve this
		});
	}

	async #getVpcf(repository: string, vpcfPath: string) {
		let fullPath = repository + vpcfPath;

		let vpcf = this.#vpcfs[fullPath];
		if (vpcf === undefined) {
			vpcf = await getLoader('Source2ParticleLoader').load(repository, vpcfPath);
			this.#vpcfs[fullPath] = vpcf;
		}
		return vpcf;
	}

	async getSystem(repository: string, vpcfPath: string, snapshotModifiers?: Map<string, string>) {
		vpcfPath = vpcfPath.replace(/.vpcf_c/, '').replace(/.vpcf/, '');
		vpcfPath = vpcfPath + '.vpcf_c';
		let vpcf = await this.#getVpcf(repository, vpcfPath);
		if (vpcf) {
			return getLoader('Source2ParticleLoader').getSystem(repository, vpcf, snapshotModifiers);
		}
	}

	stepSystems(elapsedTime: number) {
		if (elapsedTime) {
			elapsedTime *= this.speed;
			elapsedTime = Math.min(elapsedTime, 0.1);
			for (let system of this.activeSystemList.values()) {
				if (system.parentSystem === undefined) {
					system.step(elapsedTime);
				}
			}
		}
	}

	setActive(system: Source2ParticleSystem) {
		this.activeSystemList.add(system);
	}

	setInactive(system: Source2ParticleSystem) {
		this.activeSystemList.delete(system);
	}

	renderSystems(render: boolean) {
		this.visible = render ? undefined : false;
	}

	async getSystemList(): Promise<FileSelectorFile> {
		const repoList: Array<FileSelectorFile> = [];
		for (let repoName in this.#fileList) {
			if (this.#fileList[repoName]) {
				continue;
			}
			await this.#loadManifest(repoName);
			const repo = this.#fileList[repoName];
			repoList.push({ name: repoName, files: repo });
		}

		return { name: '', path: '', files: repoList };
	}

	async loadManifests(...repositories: Array<string>) {
		for (const repository of repositories) {
			this.#fileList[repository] = undefined;
		}
	}

	async #loadManifest(repositoryName: string) {
		/*
		const repository = new Repositories().getRepository(repositoryName);
		if (!repository) {
			console.error(`Unknown repository ${repositoryName} in Source1ParticleControler.#loadManifest`);
			return;
		}
			*/

		//const manifestUrl = new URL('particles_manifest.json', repository.base);//todo variable
		const response = await new Repositories().getFileAsJson(repositoryName, 'particles_manifest.json');//TODO const

		//const response = await customFetch(new Request(manifestUrl));

		if (response.error) {
			return;
		}

		const json: any = response.json;
		if (json && json.files) {
			this.#fileList[repositoryName] = json.files;
		}
	}

}

export const Source2ParticleManager = new Source2ParticleManagerClass();
