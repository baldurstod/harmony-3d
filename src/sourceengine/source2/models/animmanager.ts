import { loadAnimGroup } from '../loaders/source2animloader';
import { Source2AnimGroup } from './source2animgroup';
import { Source2Model } from './source2model';

export class AnimManager {// TODO: remove this class ?  is this even used anymore
	static #animGroupList: Record<string, Source2AnimGroup> = {};

	static async getAnimGroup(source2Model: Source2Model, repository: string, animGroupName: string): Promise<Source2AnimGroup> {
		let animGroup = this.#animGroupList[animGroupName];
		if (!animGroup) {

			animGroup = await loadAnimGroup(source2Model, repository, animGroupName);
		}
		if (animGroup) {
			this.#animGroupList[animGroupName] = animGroup;
		} else {
			//TODO; create dummy
			console.error('No anim group loaded');
		}
		return animGroup;
	}

	static removeAnimGroup(animGroupName: string): void {
		delete this.#animGroupList[animGroupName];
	}

	/*async getAnim(repository, animName, animGroup) {
		var anim = animList[animName];
		if (!anim/* || anim.isInitialized()* /) {
			anim = await getLoader('Source2AnimLoader').loadAnim(repository, animName, animGroup);
		}
		if (anim) {
			animList[animName] = anim;
			return anim;//.isLoaded() ? anim : null;
		} else {
			//TODO; create dummy
			console.error("No anim loaded");
			return null;
		}
	}*/
	/*

	removeAnim(animName) {
		animList[animName] = null;
	}
		*/
}
