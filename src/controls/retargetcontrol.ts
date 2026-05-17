import { quat, vec3 } from 'gl-matrix';
import { HarmonyMenuItemsDict } from 'harmony-ui';
import { Entity, EntityParameters } from '../entities/entity';
import { GraphicsEvent, GraphicsEvents } from '../graphics/graphicsevents';
import { Attachment } from '../objects/attachment';
import { Bone } from '../objects/bone';
import { Skeleton } from '../objects/skeleton';

const Z_VECTOR = vec3.fromValues(0, 0, 1);
const tempQuat = quat.create();

export type RetargetControlParameters = EntityParameters & {
	source?: Skeleton;
	enabled?: boolean;
};

export class RetargetControl extends Entity {
	#source?: Skeleton;
	#target?: Skeleton;
	enabled: boolean;

	constructor(params: RetargetControlParameters = {}) {
		super(params);
		GraphicsEvents.addEventListener(GraphicsEvent.Tick, (event: Event) => this.#update());

		this.#source = params.source;
		this.enabled = params.enabled ?? true;
	}

	override parentChanged(parent: Entity | null): void {
		this.#target = undefined;

		if (parent && (parent as Skeleton).isSkeleton) {
			this.#target = parent as Skeleton;
		}
	}

	#update(): void {
		if (this.enabled && this.#source && this.#target) {
			retarget(this.#source, this.#target);
		}
	}

	override buildContextMenu(): HarmonyMenuItemsDict {
		return Object.assign(super.buildContextMenu(), {
			rotation_control1: null,
			rotation_control_enabled: { i18n: '#enabled', selected: this.enabled, f: (): boolean => this.enabled = !this.enabled },
		});
	}

	static override getEntityName(): string {
		return 'RetargetControl';
	}
}

let once = true;

function retarget(source: Skeleton, target: Skeleton): void {
	for (const targetBone of target.bones) {
		targetBone.setPosition(targetBone._initialPosition);
		targetBone.setOrientation(targetBone._initialQuaternion);
	}

	for (const sourceBone of source.bones) {
		if (once) {
			console.info(sourceBone.name);
		}
		retargetBone(sourceBone, target);
	}

	/*
	for (const sourceBone of source.getAttachments()) {
		if (once) {
			console.info(sourceBone.name);
		}
		retargetBone(sourceBone, target);
	}
	*/
	once = false;
}

function retargetBone(sourceBone: Bone | Attachment, target: Skeleton): void {
	const targetBone = target.getBoneByName(sourceBone.name);
	const sourceBoneParent = sourceBone.parent;
	const targetBoneParent = targetBone?.parent;
	if (!sourceBoneParent || !targetBone || !targetBoneParent) {
		return;
	}

	if (!(targetBoneParent as Bone).isBone) {
		// It's a root bone, give the source orientation / position
		targetBone.setWorldOrientation(sourceBone.getWorldOrientation());
		targetBone.setPosition(sourceBone.getPosition());
		return;
	}

	const sourceBonePos = sourceBone.getWorldPosition();
	const sourceBoneParentPos = sourceBoneParent.getWorldPosition();

	const targetBonePos = targetBone.getWorldPosition();
	const targetBoneParentPos = targetBoneParent.getWorldPosition();

	const sourceDeltaPos = vec3.sub(vec3.create(), sourceBonePos, sourceBoneParentPos);
	const sourceDeltaPosNorm = vec3.normalize(vec3.create(), sourceDeltaPos);


	let count = 0;
	for (const child of targetBone.children) {
		if (
			(child as Bone).isBone
			// TODO: find a way to automatically disqualify some bones
			&& (!child.name.startsWith('hlp'))
			&& (!child.name.startsWith('bip_dogtag'))
			&& (!child.name.startsWith('weapon_bone'))
			&& (!vec3.equals(child.getPosition(), [0, 0, 0]))
		) {
			++count;
		}
	}

	const targetDeltaPos = vec3.sub(vec3.create(), targetBonePos, targetBoneParentPos);

	if (sourceBone.name.startsWith('weapon_bone') || sourceBone.name.startsWith('prop_bone')) {
		// TODO: find a way to select the bones properly
		targetBone.setPosition(sourceBone.getPosition());
	}

	if (count === 0) {
		// End bone, rotate this very bone
		targetBone.setWorldOrientation(sourceBone.getWorldOrientation());
	} else {

		let parentChildCount = 0;
		for (const child of targetBoneParent.children) {
			if (
				(child as Bone).isBone
				// TODO: find a way to automatically disqualify some bones
				&& (!child.name.startsWith('hlp'))
				&& (!child.name.startsWith('bip_dogtag'))
				&& (!vec3.equals(child.getPosition(), [0, 0, 0]))
			) {
				++parentChildCount;
			}
		}
		if (parentChildCount < 2) {
			// Align bone to the source ref pose, by rotating parent bone

			const targetDeltaPosNorm = vec3.normalize(vec3.create(), targetDeltaPos);
			const deltaQuat = quat.rotationTo(quat.create(), targetDeltaPosNorm, sourceDeltaPosNorm);
			const q = quat.mul(quat.create(), deltaQuat, targetBoneParent.getWorldOrientation());

			targetBoneParent.setWorldOrientation(q);
			targetBoneParent.forEach(ent => (ent as Bone).dirty = true);
		} else {
			/*
			if (move) {
				// The parent bone can't be rotated, move the child
				const newPos = vec3.scaleAndAdd(vec3.create(), scoutParentBonePosition, deltaPosSomaNorm, vec3.length(scoutDeltaPos));
				scoutBone.setWorldPosition(newPos);
			}
			*/
		}
	}
}
