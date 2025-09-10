import { vec3 } from 'gl-matrix';
import { SourceBSP } from './sourcebsp';
import { LUMP_LEAFFACES, LUMP_LEAFS, LUMP_MODELS, LUMP_NODES, LUMP_PLANES, LUMP_VISIBILITY, SourceBSPLumpLeaf, SourceBSPLumpModel, SourceBSPLumpNode, SourceBSPLumpPlane } from './sourcebsplump';

/**
 * BSP Tree
 */
export class Source1BspTree {
	#map: SourceBSP;
	visibilityClusters = undefined;
	clustersCount = 0;
	countRemoveMe = 0;
	#leavesRemoveme: number[][] = [];

	constructor(map: SourceBSP) {
		this.#map = map;
	}

	/*
	set clusters(clusters) {
		if (clusters) {
			this.visibilityClusters = clusters.clusterVis;
			this.clustersCount = clusters.clusterCount;

			this.countRemoveMe++;
			if (this.countRemoveMe > 5000) {
				this.countRemoveMe = 0;
				console.error('Fix me');
			}
		}
	}
	*/

	getLeafId(pos: vec3) {
		//TODO: optimize
		const map = this.#map;

		const lumpModels = map.getLumpData(LUMP_MODELS) as (SourceBSPLumpModel[] | null);
		const lumpPlanes = map.getLumpData(LUMP_PLANES) as SourceBSPLumpPlane[];
		const lumpNodes = map.getLumpData(LUMP_NODES) as SourceBSPLumpNode[];
		const lumpLeafs = map.getLumpData(LUMP_LEAFS)  as (SourceBSPLumpLeaf[] | null);
		const lumpLeafFaces = map.getLumpData(LUMP_LEAFFACES) as (number[] | null);
		const lumpVisibility = map.getLumpData(LUMP_VISIBILITY);

		if (lumpModels && lumpPlanes && lumpNodes && lumpLeafs && lumpLeafFaces && lumpVisibility && lumpModels.length > 0) {
			const model = lumpModels[0]!;
			let index = model.headnode;
			let node = null;
			let plane = null;
			const normal = vec3.create();
			let dist = 0;

			while (index >= 0) {
				node = lumpNodes[index];
				if (!node) {
					break;
				}
				plane = lumpPlanes[node.planenum];
				if (!plane) {
					break;
				}
				//normal[0] = plane.normal.x; normal[1] = plane.normal.y; normal[2] = plane.normal.z; // TODO: Not this.

				//dist = vec3.dot(normal, pos) - plane.dist;
				dist = vec3.dot(plane.normal, pos) - plane.dist;

				if (dist >= 0) {
					index = node.children[0];
				} else {
					index = node.children[1];
				}
			}
			return -(index + 1);
		} else {
			return undefined;
		}
	}

	isLeafVisible(fromLeafId: number, toLeafId: number): boolean {
		if (fromLeafId == toLeafId) {
			return true;
		} // Leaves are always visible from themselves

		const lumpLeafs = this.#map.getLumpData(LUMP_LEAFS) as (SourceBSPLumpLeaf[] | null);
		if (lumpLeafs && this.visibilityClusters) {
			const fromLeaf = lumpLeafs[fromLeafId];
			const toLeaf = lumpLeafs[toLeafId];

			if (!fromLeaf || !toLeaf) {
				return false;
			}

			if (fromLeaf.cluster == -1 || toLeaf.cluster != -1) {
				return false;
			}

			return this.visibilityClusters[(fromLeaf.cluster * this.clustersCount) + toLeaf.cluster];
		}
		return false;
	}

	isVisLeaf(leafId: number) {
		const lumpLeafs = this.#map.getLumpData(LUMP_LEAFS) as (SourceBSPLumpLeaf[] | null);
		if (lumpLeafs) {
			const lumpLeaf = lumpLeafs[leafId];
			if (lumpLeaf) {
				return lumpLeaf.cluster != -1;
			}
		}
		return true;
	}

	addPropToLeaf(leafId: number, propId: number) {
		const leaf = this.#leavesRemoveme[leafId] || [];
		this.#leavesRemoveme[leafId] = leaf;
		leaf.push(propId);
	}
}
