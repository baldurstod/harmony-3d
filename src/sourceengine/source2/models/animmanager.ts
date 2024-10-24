import { getLoader } from '../../../loaders/loaderfactory';

export const AnimManager = new (function () {
	let animGroupList = Object.create(null);
	let seqGroupList = {};
	let animList = Object.create(null);
	class AnimManager {

		getAnimGroup(source2Model, repository, animGroupName) {
			var animGroup = animGroupList[animGroupName];
			if (!animGroup) {

				animGroup = getLoader('Source2AnimLoader').loadAnimGroup(source2Model, repository, animGroupName);
			}
			if (animGroup) {
				animGroupList[animGroupName] = animGroup;
			} else {
				//TODO; create dummy
				console.error("No anim group loaded");
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
			var anim = animList[animName];
			if (anim === undefined) {
				getLoader('Source2AnimLoader').loadAnim(repository, animName, animGroup).then(
					(anim) => animList[animName] = anim
				)
				return null;
			} else {
				return anim;
			}
		}

		removeAnim(animName) {
			animList[animName] = null;
		}

		getSequenceGroup(repository, seqGroupName, animGroup) {
			var seqGroup = seqGroupList[seqGroupName];
			if (!seqGroup) {
				seqGroup = getLoader('Source2AnimLoader').loadSequenceGroup(repository, seqGroupName, animGroup);
			}
			if (seqGroup) {
				seqGroupList[seqGroupName] = seqGroup;
			} else {
				//TODO; create dummy
				console.error("No anim group loaded");
			}
			return seqGroup;
		}
	}
	return AnimManager;
}());
