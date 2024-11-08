import { vec3, vec4 } from 'gl-matrix';

import { Camera } from '../cameras/camera';
import { Graphics } from '../graphics/graphics';
import { FullScreenQuad } from '../primitives/fullscreenquad';
import { Scene } from '../scenes/scene';
import { LoopSubdivision } from '../meshes/loopsubdivision';
import { Entity } from '../entities/entity';
import { Source2Particle } from '../sourceengine/source2/particles/source2particle';
import { Source2ParticleSystem } from '../sourceengine/export';
import { Mesh } from '../objects/mesh';

export class ObjExporter {
	static #lines;
	static #startIndex;
	static #fullScreenQuadMesh = new FullScreenQuad();
	static scene = new Scene();
	static camera = new Camera({ position: vec3.fromValues(0, 0, 100) });
	static {
		this.scene.addChild(this.#fullScreenQuadMesh);
	}

	static async #renderMeshes(files, meshes) {
		let [previousWidth, previousHeight] = new Graphics().setSize(1024, 1024);//TODOv3: constant
		new Graphics().setIncludeCode('EXPORT_TEXTURES', '#define EXPORT_TEXTURES');
		new Graphics().setIncludeCode('SKIP_PROJECTION', '#define SKIP_PROJECTION');
		new Graphics().setIncludeCode('SKIP_LIGHTING', '#define SKIP_LIGHTING');

		let previousClearColor = new Graphics().getClearColor();
		new Graphics().clearColor(vec4.fromValues(0, 0, 0, 0));

		let meshId = 0;
		let promises = [];
		for (let mesh of meshes) {
			if (!mesh.is('Mesh')) {
				continue;
			}
			if (mesh.parent.isParticleSystem) {
				continue;
			}
			this.#fullScreenQuadMesh.material = mesh.material;
			this.#fullScreenQuadMesh.materialsParams = mesh.materialsParams;
			new Graphics().render(this.scene, this.camera, 0);

			//let file = await new Graphics().savePictureAsFile(`mat_${meshId}.png`);
			/*				let file = await new Graphics().savePictureAsFile(`mat_${meshId}.png`);
						files.add(file);*/
			let promise = new Graphics().savePictureAsFile(`mat_${meshId}.png`);
			promise.then((file) => files.add(file));
			promises.push(promise);

			++meshId;
		}
		new Graphics().setIncludeCode('EXPORT_TEXTURES', '');
		new Graphics().setIncludeCode('SKIP_PROJECTION', '');
		new Graphics().setIncludeCode('SKIP_LIGHTING', '');
		new Graphics().setSize(previousWidth, previousHeight);
		new Graphics().clearColor(previousClearColor);
		await Promise.all(promises);
	}

	static #addLine(line) {
		this.#lines.push(line + '\n');
	}

	static async exportMeshes({ meshes = new Set<Entity>(), exportTexture = false, singleMesh = false, digits = 4, subdivisions = 0, mergeTolerance = 0.0001 } = {}) {
		let files = new Set<File>();
		const loopSubdivision = new LoopSubdivision();

		if (exportTexture && subdivisions == 0) {
			await this.#renderMeshes(files, meshes);
		}

		this.#lines = [];
		let mtlLines = [];
		this.#addLine('mtllib export.mtl');
		let objectId = 0;
		this.#startIndex = 1;
		for (let mesh of meshes) {
			if ((mesh.parent as Source2ParticleSystem).isParticleSystem) {
				continue;
			}
			if ((mesh as Mesh).exportObj) {
				let m = (mesh as Mesh).exportObj();

				let faces;
				let vertices;
				let normals;
				let uvs;
				if (subdivisions > 0) {
					const result = await loopSubdivision.subdivide(m.f, m.v, subdivisions, mergeTolerance);
					faces = result.indices;
					vertices = result.vertices;
				} else {
					faces = m['f'];
					vertices = m['v'];
					normals = m['vn'];
					uvs = m['vt'];
				}

				if (!singleMesh) {
					this.#addLine('o ' + objectId);
				}

				mtlLines.push(`newmtl mat_${objectId}.png\n`);
				mtlLines.push(`map_Kd mat_${objectId}.png\n`);
				this.#addLine(`usemtl mat_${objectId}.png`);

				this.#exportMesh(faces, vertices, normals, uvs, digits);

				++objectId;
			}
		}
		files.add(new File([new Blob([this.#lines.join('')])], 'export.obj'));
		if (exportTexture) {
			files.add(new File([new Blob([mtlLines.join('')])], 'export.mtl'));
		}
		return files;
	}

	static async #exportMesh(indices, vertices, normals, uvs, digits) {
		let attributes = [
			{ name: 'v', stride: 3, arr: vertices },
			{ name: 'vn', stride: 3, arr: normals },
			{ name: 'vt', stride: 2, arr: uvs },
		];
		let line;
		let verticeCount = 0;

		let startIndex = this.#startIndex;
		for (const attribute of attributes) {
			const attributesLength = attribute.stride;
			const arr = attribute.arr;
			if (arr) {
				let vertexIndex = 0;
				for (let i = 0; i < arr.length; i += attributesLength, ++vertexIndex) {
					line = attribute.name;
					for (let j = 0; j < attributesLength; ++j) {
						line += ' ' + arr[i + j].toFixed(digits);
					}
					this.#addLine(line);
					if (attribute.name == 'v') {
						++verticeCount;
					}
				}
			}
		}

		for (let i = 0; i < indices.length; i += 3) {
			let i0 = startIndex + indices[i];
			let i1 = startIndex + indices[i + 1];
			let i2 = startIndex + indices[i + 2];
			let uv0 = '';
			let uv1 = '';
			let uv2 = '';
			let normals0 = '';
			let normals1 = '';
			let normals2 = '';
			if (uvs) {
				uv0 = `/${i0}`;
				uv1 = `/${i1}`;
				uv2 = `/${i2}`;
			}
			if (normals) {
				normals0 = `/${i0}`;
				normals1 = `/${i1}`;
				normals2 = `/${i2}`;
			}

			this.#addLine(`f ${i0}${uv0}${normals0} ${i1}${uv1}${normals1} ${i2}${uv2}${normals2}`);
		}

		this.#startIndex += verticeCount;
	}
}
