import { quat, vec3, vec4 } from 'gl-matrix';
import { Entity } from '../../entities/entity';
import { GraphicsEvent, GraphicsEvents } from '../../graphics/graphicsevents';
import { LineMaterial } from '../../materials/linematerial';
import { Line } from '../../primitives/line';
import { Raycaster } from '../../raycasting/raycaster';
import { Graphics } from '../../graphics/graphics';
import { SceneExplorerEvents } from '../../scenes/sceneexplorerevents';
import { Sphere } from '../../primitives/sphere';
import { MeshBasicMaterial } from '../../materials/meshbasicmaterial';
import { Scene } from '../../scenes/scene';
import { Skeleton } from '../skeleton';
import { Bone } from '../bone';

const tempVec3 = vec3.create();

export class SkeletonHelper extends Entity {
	#skeleton?: Skeleton;
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

	constructor(parameters) {
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
		this.#skeleton = parameters?.skeleton;
		this.#raycaster = new Raycaster();
		this.#boneStart = new Sphere({ radius: 1, material: this.#boneTipMaterial });
		this.#boneEnd = new Sphere({ radius: 1, material: this.#boneTipMaterial });
		this.addChilds(this.#boneStart, this.#boneEnd);

		this.#initListeners();
	}

	parentChanged(parent) {
		if (!parent) {
			return;
		}

		this.#clearSkeleton();
		if (parent.isSkeleton) {
			this.#skeleton = parent;
		} else if (parent.skeleton) {
			this.#skeleton = parent.skeleton;
		} else {
			this.#skeleton = null;
		}
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
				boneLine.start = boneParent.getWorldPosition(/*TODO: optimize*/);
				boneLine.properties.setObject('boneParent', boneParent);
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
			this.#mouseMoved(event);
		});
		GraphicsEvents.addEventListener(GraphicsEvent.MouseUp, (event) => {
			this.#mouseUp(event);
		});
	}

	#mouseMoved(event) {
		this.#highlit(this.#pickBone(event));
	}

	#mouseUp(event) {
		const closest: Line = this.#pickBone(event);
		this.#highlit(closest);
		if (closest) {
			let bone: Bone = closest.properties.getObject('bone') as Bone;
			if (closest.isLine) {
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

	#pickBone(event) {
		if (!this.isVisible()) {
			return;
		}

		const normalizedX = (event.detail.x / Graphics.getWidth()) * 2 - 1;
		const normalizedY = 1 - (event.detail.y / Graphics.getHeight()) * 2;

		const scene = this.root;
		if (!scene.is('Scene')) {
			return;
		}


		const intersections = this.#raycaster.castCameraRay((scene as Scene).activeCamera, normalizedX, normalizedY, [this], true);
		if (intersections.length) {

			let closest = null;
			let closestDist = Infinity;
			for (const intersection of intersections) {
				const entity = intersection.entity;
				if (entity.isLine) {
					if (intersection.distanceFromRay < closestDist) {
						closest = entity;
						closestDist = intersection.distanceFromRay;
					}
				} else if (entity.isSphere) {
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
	}

	#highlit(line: Line) {
		if (!line?.isLine) {
			return;
		}
		if (this.#highlitLine) {
			this.#highlitLine.material = this.#lineMaterial;
		}

		if (line) {
			line.material = this.#highlitLineMaterial;
			this.#boneStart.position = line.getStart(tempVec3);
			this.#boneEnd.position = line.getEnd(tempVec3);
			this.#boneStart.setVisible(this.#displayJoints);
			this.#boneEnd.setVisible(this.#displayJoints);

			this.#boneStart.properties.set('bone', line.properties.get('boneParent'));
			this.#boneEnd.properties.set('bone', line.properties.get('bone'));
		}
		this.#highlitLine = line;
	}

	dispose() {
		this.#clearSkeleton();
		this.#lineMaterial.removeUser(this);
		this.#highlitLineMaterial.removeUser(this);
	}
}
