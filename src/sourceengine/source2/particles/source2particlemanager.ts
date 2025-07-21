import { Map2 } from 'harmony-utils';
import { GraphicsEvent, GraphicsEvents, GraphicTickEvent } from '../../../graphics/graphicsevents';
import { getLoader } from '../../../loaders/loaderfactory';
import { Repositories } from '../../../repositories/repositories';
import { FileSelectorFile } from '../../../utils/fileselector/file';
import { Source2ParticleLoader } from '../export';
import { Source2File } from '../loaders/source2file';
import { Source2ParticleSystem } from './source2particlesystem';

class Source2ParticleManagerClass {// TODO: turn into a proper singleton
	#vpcfs = new Map2<string, string, Source2File | null>();
	#fileList: Record<string, undefined | FileSelectorFile[]> = {};//TODO: turn to map and improve type
	speed = 1.0;
	activeSystemList = new Set<Source2ParticleSystem>();
	visible?: boolean;

	constructor() {
		GraphicsEvents.addEventListener(GraphicsEvent.Tick, (event: Event) => {
			this.stepSystems((event as CustomEvent<GraphicTickEvent>).detail.delta);//TODOv3: improve this
		});
	}

	async #getVpcf(repository: string, path: string): Promise<Source2File | null> {
		let vpcf: Source2File | undefined | null = this.#vpcfs.get(repository, path);
		if (vpcf === undefined) {
			vpcf = await (getLoader('Source2ParticleLoader') as typeof Source2ParticleLoader).load(repository, path);
			this.#vpcfs.set(repository, path, vpcf);
		}
		return vpcf;
	}

	async getSystem(repository: string, vpcfPath: string, snapshotModifiers?: Map<string, string>) {
		vpcfPath = vpcfPath.replace(/.vpcf_c/, '').replace(/.vpcf/, '');
		vpcfPath = vpcfPath + '.vpcf_c';
		const vpcf = await this.#getVpcf(repository, vpcfPath);
		if (vpcf) {
			return getLoader('Source2ParticleLoader').getSystem(repository, vpcf, snapshotModifiers);
		}
	}

	stepSystems(elapsedTime: number) {
		if (elapsedTime) {
			elapsedTime *= this.speed;
			elapsedTime = Math.min(elapsedTime, 0.1);
			for (const system of this.activeSystemList.values()) {
				if (!system.parentSystem) {
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
		const repoList: FileSelectorFile[] = [];
		for (const repoName in this.#fileList) {
			if (this.#fileList[repoName]) {
				continue;
			}
			await this.#loadManifest(repoName);
			const repo = this.#fileList[repoName];
			repoList.push({ name: repoName, files: repo });
		}

		return { name: '', path: '', files: repoList };
	}

	async loadManifests(...repositories: string[]) {
		for (const repository of repositories) {
			this.#fileList[repository] = undefined;
		}
	}

	async #loadManifest(repositoryName: string) {

		//const manifestUrl = new URL('particles_manifest.json', repository.base);//todo variable
		const response = await Repositories.getFileAsJson(repositoryName, 'particles_manifest.json');//TODO const

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
