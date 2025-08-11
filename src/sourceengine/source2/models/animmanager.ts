import { loadAnimGroup } from '../loaders/source2animloader';
import { Source2AnimGroup } from './source2animgroup';
import { Source2Model } from './source2model';

export const AnimManager = new (function () {// TODO: remove this class ?  is this even used anymore
	const animGroupList: Record<string, Source2AnimGroup> = {};
	class AnimManager {

		async getAnimGroup(source2Model: Source2Model, repository: string, animGroupName: string) {
			let animGroup = animGroupList[animGroupName];
			if (!animGroup) {

				animGroup = await loadAnimGroup(source2Model, repository, animGroupName);
			}
			if (animGroup) {
				animGroupList[animGroupName] = animGroup;
			} else {
				//TODO; create dummy
				console.error('No anim group loaded');
			}
			return animGroup;
		}

		removeAnimGroup(animGroupName:string) {
			delete animGroupList[animGroupName];
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
	return AnimManager;
}());
