import { quat, vec3 } from 'gl-matrix';
import { Entity, EntityParameters } from '../../entities/entity';
import { GraphicMouseEventData, GraphicsEvent, GraphicsEvents } from '../../graphics/graphicsevents';
import { HasSkeleton } from '../../interfaces/hasskeleton';
import { LineMaterial } from '../../materials/linematerial';
import { MeshBasicMaterial } from '../../materials/meshbasicmaterial';
import { Line } from '../../primitives/line';
import { Sphere } from '../../primitives/sphere';
import { Raycaster } from '../../raycasting/raycaster';
import { Scene } from '../../scenes/scene';
import { SceneExplorerEvents } from '../../scenes/sceneexplorerevents';
import { Bone } from '../bone';
import { Skeleton } from '../skeleton';
import { Graphics } from '../../graphics/graphics2';

const tempVec3 = vec3.create();

export type SkeletonHelperParameters = EntityParameters & {
	skeleton?: Skeleton,
};


export class SkeletonHelper extends Entity {
	#skeleton: Skeleton | null = null;
	#lines = new Map<Bone, Line>();
	#lineMaterial;
	#highlitLineMaterial;
	#boneTipMaterial;
	#raycaster;
	#highlitLine?: Line;
	#boneStart: Sphere;
	#boneEnd: Sphere;
	enumerable = false;
	#displayJoints = true;

	constructor(parameters: SkeletonHelperParameters) {
		super(parameters);

		this.#lineMaterial = new LineMaterial();
		this.#lineMaterial.addUser(this);
		this.#lineMaterial.setDefine('ALWAYS_ON_TOP');
		this.#lineMaterial.lineWidth = 3;

		this.#highlitLineMaterial = new LineMaterial();
		this.#highlitLineMaterial.addUser(this);
		this.#highlitLineMaterial.setDefine('ALWAYS_ON_TOP');
		this.#highlitLineMaterial.lineWidth = 3;
		this.#highlitLineMaterial.setMeshColor([1, 0, 0, 1]);

		this.#boneTipMaterial = new MeshBasicMaterial();
		this.#boneTipMaterial.addUser(this);
		this.#boneTipMaterial.setDefine('ALWAYS_ON_TOP');
		this.#boneTipMaterial.setMeshColor([1, 0, 1, 1]);

		this.hideInExplorer = true;
		this.#skeleton = parameters?.skeleton ?? null;
		this.#raycaster = new Raycaster();
		this.#boneStart = new Sphere({ radius: 1, material: this.#boneTipMaterial });
		this.#boneEnd = new Sphere({ radius: 1, material: this.#boneTipMaterial });
		this.addChilds(this.#boneStart, this.#boneEnd);

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
		this.#lines.clear();
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

	#update() {
		if (!this.#skeleton) {
			return;
		}

		for (const bone of this.#skeleton.bones) {
			let boneLine = this.#lines.get(bone);

			if (!boneLine) {
				boneLine = new Line({ material: this.#lineMaterial, parent: this });
				boneLine.properties.setObject('bone', bone);
				this.#lines.set(bone, boneLine);
				this.addChild(boneLine);
			}

			//boneLine.position = bone.worldPos;
			boneLine.start = bone.worldPos;
			boneLine.end = bone.worldPos;
			const boneParent = bone.parent;
			if ((boneParent as Bone)?.isBone) {
				boneLine.start = (boneParent as Bone).getWorldPosition(/*TODO: optimize*/);
				boneLine.properties.setObject('boneParent', (boneParent as Bone));
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
		this.#boneStart.setVisible(this.#highlitLine && display);
		this.#boneEnd.setVisible(this.#highlitLine && display);
		this.#displayJoints = display;
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
			this.#boneStart.setVisible(this.#displayJoints);
			this.#boneEnd.setVisible(this.#displayJoints);

			this.#boneStart.properties.set('bone', line.properties.get('boneParent')!);
			this.#boneEnd.properties.set('bone', line.properties.get('bone')!);
		}
		this.#highlitLine = line;
	}

	dispose() {
		this.#clearSkeleton();
		this.#lineMaterial.removeUser(this);
		this.#highlitLineMaterial.removeUser(this);
	}
}
