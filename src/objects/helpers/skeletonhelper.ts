import { quat, vec3 } from 'gl-matrix';
import { Entity, EntityParameters } from '../../entities/entity';
import { Graphics } from '../../graphics/graphics2';
import { GraphicMouseEventData, GraphicsEvent, GraphicsEvents } from '../../graphics/graphicsevents';
import { HasSkeleton } from '../../interfaces/hasskeleton';
import { LineMaterial } from '../../materials/linematerial';
import { MeshBasicMaterial } from '../../materials/meshbasicmaterial';
import { Cylinder } from '../../primitives/cylinder';
import { Line } from '../../primitives/line';
import { Sphere } from '../../primitives/sphere';
import { Raycaster } from '../../raycasting/raycaster';
import { Scene } from '../../scenes/scene';
import { SceneExplorerEvents } from '../../scenes/sceneexplorerevents';
import { Bone } from '../bone';
import { Group } from '../group';
import { Skeleton } from '../skeleton';

const tempVec3 = vec3.create();
const tempVec3_1 = vec3.create();
const tempQuat = quat.create();

export type SkeletonHelperParameters = EntityParameters & {
	skeleton?: Skeleton,
	hideInExplorer?: boolean,
};

const BONE_RADIUS = 0.5;

export class SkeletonHelper extends Entity {
	static readonly #helpers = new Set<SkeletonHelper>();
	#skeleton: Skeleton | null = null;
	readonly #lines = new Map<Bone, Line>();
	readonly #bones = new Map<Bone, Cylinder>();
	readonly #joints = new Map<Bone, Sphere>();
	readonly #lineMaterial = new LineMaterial({ user: this, lineWidth: 3, defines: { ALWAYS_ON_TOP: '' }, });
	readonly #highlitLineMaterial = new LineMaterial({ user: this, lineWidth: 3, defines: { ALWAYS_ON_TOP: '' }, meshColor: [1, 0, 1, 1], });
	readonly #boneTipMaterial = new MeshBasicMaterial({ user: this, defines: { ALWAYS_ON_TOP: '' }, meshColor: [1, 0, 1, 1], });
	readonly #boneMaterial = new MeshBasicMaterial({ user: this, defines: { ALWAYS_ON_TOP: '' }, meshColor: [27 / 255, 106 / 255, 0, 1], });
	readonly #jointMaterial = new MeshBasicMaterial({ user: this, defines: { ALWAYS_ON_TOP: '' }, meshColor: [1, 235 / 255, 0, 1], });
	readonly #lineGroup = new Group({ name: 'lines', parent: this, visible: false });
	readonly #bonesGroup = new Group({ name: 'bones', parent: this, });
	#raycaster;
	#highlitLine?: Line;
	#boneStart: Sphere;
	#boneEnd: Sphere;
	enumerable = false;
	#displayJoints = true;

	constructor(parameters: SkeletonHelperParameters = {}) {
		super(parameters);
		SkeletonHelper.#helpers.add(this);
		this.hideInExplorer = parameters.hideInExplorer ?? false;
		this.#skeleton = parameters?.skeleton ?? null;
		this.#raycaster = new Raycaster();
		this.#boneStart = new Sphere({ radius: 1, material: this.#boneTipMaterial, parent: this });
		this.#boneEnd = new Sphere({ radius: 1, material: this.#boneTipMaterial, parent: this });

		this.#initListeners();
	}

	parentChanged(parent: Entity) {
		if (!parent) {
			return;
		}

		this.#clearSkeleton();

		let current: Entity | null = parent;
		while (current) {
			if ((current as Skeleton).isSkeleton) {
				this.#skeleton = current as Skeleton;
				return;
			} else if ((current as unknown as HasSkeleton).skeleton) {
				this.#skeleton = (current as unknown as HasSkeleton).skeleton;
				return;
			}
			current = current.parent;
		}
		this.#skeleton = null;
	}

	#clearSkeleton() {
		this.#lines.forEach(value => value.dispose());
		this.#bones.forEach(value => value.dispose());
		this.#joints.forEach(value => value.dispose());
		this.#lines.clear();
		this.#bones.clear();
		this.#joints.clear();
		this.#boneStart.setVisible(false);
		this.#boneEnd.setVisible(false);
	}
	/*
		set skeleton(skeleton) {
			this.#skeleton = skeleton;
		}

		get skeleton() {
			return this.#skeleton;
		}*/

	getWorldPosition(vec = vec3.create()) {
		return vec3.copy(vec, this._position);
	}

	getWorldQuaternion(q = quat.create()) {
		return quat.identity(q);
	}

	getWorldScale(scale = vec3.create()): vec3 {
		return vec3.copy(scale, this._scale);
	}

	#update() {
		if (!this.#skeleton) {
			return;
		}

		for (const bone of this.#skeleton.bones) {
			let boneLine = this.#lines.get(bone);
			let boneCylinder = this.#bones.get(bone);
			let boneSphere = this.#joints.get(bone);

			if (!boneLine) {
				boneLine = new Line({ material: this.#lineMaterial, parent: this.#lineGroup });
				boneLine.properties.setObject('bone', bone);
				this.#lines.set(bone, boneLine);

				boneCylinder = new Cylinder({ material: this.#boneMaterial, parent: this.#bonesGroup, radius: BONE_RADIUS, });
				this.#bones.set(bone, boneCylinder);

				boneSphere = new Sphere({ material: this.#jointMaterial, parent: this.#bonesGroup, radius: BONE_RADIUS * 2, rings: 16, segments: 16 });
				this.#joints.set(bone, boneSphere);
			}

			//boneLine.position = bone.worldPos;
			let start = bone.worldPos;
			let end = bone.worldPos;
			const boneParent = bone.parent;
			if ((boneParent as Bone)?.isBone) {
				start = (boneParent as Bone).getWorldPosition(/*TODO: optimize*/);
				boneLine.properties.setObject('boneParent', (boneParent as Bone));
			}

			boneLine.start = start;
			boneLine.end = end;
			boneSphere!.setPosition(end);

			if (start !== end) {
				vec3.sub(tempVec3, end, start);
				//const mid = vec3.add(tempVec3_1, start, end);
				vec3.scaleAndAdd(tempVec3_1, start, tempVec3, 0.5);

				boneCylinder!.setHeight(vec3.len(tempVec3));
				vec3.normalize(tempVec3, tempVec3)
				quat.rotationTo(tempQuat, vec3.fromValues(0, 0, 1), tempVec3);

				boneCylinder!.setOrientation(tempQuat);
				boneCylinder!.setPosition(tempVec3_1);
				boneCylinder!.setVisible();

			} else {
				boneCylinder!.setVisible(false);
			}
		}
	}

	get wireframe() {
		return 0;
	}

	#initListeners() {

		GraphicsEvents.addEventListener(GraphicsEvent.Tick, () => {
			if (!this.isVisible()) {
				return;
			}

			this.#update();
		});

		GraphicsEvents.addEventListener(GraphicsEvent.MouseMove, (event) => {
			this.#mouseMoved(event as CustomEvent<GraphicMouseEventData>);
		});
		GraphicsEvents.addEventListener(GraphicsEvent.MouseUp, (event) => {
			this.#mouseUp(event as CustomEvent<GraphicMouseEventData>);
		});
	}

	#mouseMoved(event: CustomEvent<GraphicMouseEventData>) {
		if (Graphics.dragging) {
			return;
		}
		const picked = this.#pickBone(event);
		if (picked) {
			this.#highlit(picked as Line);
		}
	}

	#mouseUp(event: CustomEvent<GraphicMouseEventData>) {
		if (Graphics.dragging) {
			return;
		}
		const closest: Entity | null = this.#pickBone(event);
		if (closest) {
			let bone: Bone = closest.properties.getObject('bone') as Bone;
			if ((closest as Line).isLine) {
				this.#highlit(closest as Line);
				bone = (bone?.parent as Bone/*TODO case where parent is not Bone*/) ?? bone;
			}
			SceneExplorerEvents.dispatchEvent(new CustomEvent('bonepicked', { detail: { bone: bone } }));
		}
	}

	displayBoneJoints(display: boolean) {
		this.#boneStart.setVisible(this.#highlitLine && display && undefined);
		this.#boneEnd.setVisible(this.#highlitLine && display && undefined);
		this.#displayJoints = display;
	}

	static displayBonesAsLines(showLines: boolean): void {
		for (const helper of SkeletonHelper.#helpers) {
			helper.#lineGroup.setVisible(showLines && undefined);
			helper.#bonesGroup.setVisible((!showLines) && undefined);
		}
	}

	setJointsRadius(radius: number) {
		this.#boneStart.setRadius(radius);
		this.#boneEnd.setRadius(radius);
	}

	#pickBone(event: CustomEvent<GraphicMouseEventData>): Entity | null {
		if (!this.isVisible()) {
			return null;
		}

		const normalizedX = (event.detail.x / event.detail.width) * 2 - 1;
		const normalizedY = 1 - (event.detail.y / event.detail.height) * 2;

		const scene = this.root as Scene;// TODO: imbricated scenes
		if (!scene.is('Scene') || !scene.activeCamera) {
			return null;
		}

		const intersections = this.#raycaster.castCameraRay(scene.activeCamera, normalizedX, normalizedY, [this], true);
		if (intersections.length) {

			let closest = null;
			let closestDist = Infinity;
			for (const intersection of intersections) {
				const entity = intersection.entity;
				if ((entity as Line).isLine) {
					if (intersection.distanceFromRay < closestDist) {
						closest = entity;
						closestDist = intersection.distanceFromRay;
					}
				} else if ((entity as Sphere).isSphere) {
					if (intersection.distanceFromRay < closestDist) {

						if (entity == this.#boneStart || entity == this.#boneEnd) {
							closest = entity;
							closestDist = intersection.distanceFromRay;
						}
					}
				}
			}
			return closest;
		}
		return null;
	}

	#highlit(line: Line) {
		if (!line?.isLine) {
			return;
		}
		if (this.#highlitLine) {
			this.#highlitLine.material = this.#lineMaterial;
		}

		if (line) {
			line.setMaterial(this.#highlitLineMaterial);
			this.#boneStart.setPosition(line.getStart(tempVec3));
			this.#boneEnd.setPosition(line.getEnd(tempVec3));
			this.#boneStart.setVisible(this.#displayJoints && undefined);
			this.#boneEnd.setVisible(this.#displayJoints && undefined);

			this.#boneStart.properties.set('bone', line.properties.get('boneParent')!);
			this.#boneEnd.properties.set('bone', line.properties.get('bone')!);
		}
		this.#highlitLine = line;
	}

	override dispose() {
		this.#clearSkeleton();
		this.#lineMaterial.removeUser(this);
		this.#highlitLineMaterial.removeUser(this);
	}

	static override getEntityName(): string {
		return 'SkeletonHelper';
	}
}
