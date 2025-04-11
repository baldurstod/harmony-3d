import { getLoader } from '../../../loaders/loaderfactory';
import { loadAnim, loadAnimGroup, loadSequenceGroup } from '../loaders/source2animloader';
import { Source2AnimGroup } from './source2animgroup';

export const AnimManager = new (function () {
	let animGroupList: { [key: string]: Source2AnimGroup } = {};
	let seqGroupList = {};
	let animList = Object.create(null);
	class AnimManager {

		async getAnimGroup(source2Model, repository, animGroupName) {
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

		removeAnimGroup(animGroupName) {
			animGroupList[animGroupName] = null;
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

		getAnim(repository, animName, animGroup) {
			let anim = animList[animName];
			if (anim === undefined) {
				loadAnim(repository, animName, animGroup).then(
					anim => animList[animName] = anim
				)
				return null;
			} else {
				return anim;
			}
		}

		removeAnim(animName) {
			animList[animName] = null;
		}

		getSequenceGroup(repository: string, seqGroupName: string, animGroup: Source2AnimGroup) {
			var seqGroup = seqGroupList[seqGroupName];
			if (!seqGroup) {
				seqGroup = loadSequenceGroup(repository, seqGroupName, animGroup);
			}
			if (seqGroup) {
				seqGroupList[seqGroupName] = seqGroup;
			} else {
				//TODO; create dummy
				console.error('No anim group loaded');
			}
			return seqGroup;
		}
	}
	return AnimManager;
}());
