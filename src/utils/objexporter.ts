import { vec3, vec4 } from 'gl-matrix';
import { Camera } from '../cameras/camera';
import { Entity } from '../entities/entity';
import { Graphics } from '../graphics/graphics';
import { LoopSubdivision } from '../meshes/loopsubdivision';
import { Mesh } from '../objects/mesh';
import { FullScreenQuad } from '../primitives/fullscreenquad';
import { Scene } from '../scenes/scene';
import { Source1ParticleSystem, Source2ParticleSystem } from '../sourceengine/export';

export class ObjExporter {
	static #instance: ObjExporter;
	#lines: string[] = [];
	#startIndex = 1;
	#fullScreenQuadMesh = new FullScreenQuad();
	scene = new Scene();
	camera = new Camera({ position: vec3.fromValues(0, 0, 100) });
	constructor() {
		if (ObjExporter.#instance) {
			return ObjExporter.#instance;
		}
		ObjExporter.#instance = this;
		this.scene.addChild(this.#fullScreenQuadMesh);
	}

	async #renderMeshes(files: Set<File>, meshes: Set<Entity>) {
		const [previousWidth, previousHeight] = new Graphics().setSize(1024, 1024);//TODOv3: constant
		new Graphics().setIncludeCode('EXPORT_TEXTURES', '#define EXPORT_TEXTURES');
		new Graphics().setIncludeCode('SKIP_PROJECTION', '#define SKIP_PROJECTION');
		new Graphics().setIncludeCode('SKIP_LIGHTING', '#define SKIP_LIGHTING');

		const previousClearColor = new Graphics().getClearColor();
		new Graphics().clearColor(vec4.fromValues(0, 0, 0, 0));

		let meshId = 0;
		const promises: Promise<File>[] = [];
		for (const mesh of meshes) {
			if (!mesh.is('Mesh')) {
				continue;
			}
			if ((mesh.parent as null | Source1ParticleSystem | Source2ParticleSystem)?.isParticleSystem) {
				continue;
			}
			this.#fullScreenQuadMesh.material = (mesh as Mesh).material;
			this.#fullScreenQuadMesh.materialsParams = mesh.materialsParams;
			new Graphics().render(this.scene, this.camera, 0, { DisableToolRendering: true });

			//let file = await new Graphics().savePictureAsFile(`mat_${meshId}.png`);
			/*				let file = await new Graphics().savePictureAsFile(`mat_${meshId}.png`);
						files.add(file);*/
			const promise = new Graphics().savePictureAsFile(`mat_${meshId}.png`);
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

	#addLine(line: string) {
		this.#lines.push(line + '\n');
	}

	async exportMeshes({ meshes = new Set<Entity>(), exportTexture = false, singleMesh = false, digits = 4, subdivisions = 0, mergeTolerance = 0.0001 } = {}) {
		const files = new Set<File>();
		const loopSubdivision = new LoopSubdivision();

		if (exportTexture && subdivisions == 0) {
			await this.#renderMeshes(files, meshes);
		}

		this.#lines = [];
		const mtlLines: string[] = [];
		this.#addLine('mtllib export.mtl');
		let objectId = 0;
		this.#startIndex = 1;
		for (const mesh of meshes) {
			if ((mesh.parent as Source2ParticleSystem).isParticleSystem) {
				continue;
			}
			if ((mesh as Mesh).exportObj) {
				const m = (mesh as Mesh).exportObj();

				let faces: Uint8Array | Uint32Array | undefined;
				let vertices: Float32Array | undefined;
				let normals: Float32Array | undefined;
				let uvs: Float32Array | undefined;
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

				if (faces && vertices) {
					this.#exportMesh(digits, faces, vertices, normals, uvs);
				}

				++objectId;
			}
		}
		files.add(new File([new Blob([this.#lines.join('')])], 'export.obj'));
		if (exportTexture) {
			files.add(new File([new Blob([mtlLines.join('')])], 'export.mtl'));
		}
		return files;
	}

	async #exportMesh(digits: number, indices: Uint8Array | Uint32Array, vertices: Float32Array, normals?: Float32Array, uvs?: Float32Array) {
		const attributes = [
			{ name: 'v', stride: 3, arr: vertices },
			{ name: 'vn', stride: 3, arr: normals },
			{ name: 'vt', stride: 2, arr: uvs },
		];
		let line;
		let verticeCount = 0;

		const startIndex = this.#startIndex;
		for (const attribute of attributes) {
			const attributesLength = attribute.stride;
			const arr = attribute.arr;
			if (arr) {
				let vertexIndex = 0;
				for (let i = 0; i < arr.length; i += attributesLength, ++vertexIndex) {
					line = attribute.name;
					for (let j = 0; j < attributesLength; ++j) {
						const value = arr[i + j];
						if (value) {
							line += ' ' + value.toFixed(digits);
						}
					}
					this.#addLine(line);
					if (attribute.name == 'v') {
						++verticeCount;
					}
				}
			}
		}

		for (let i = 0; i < indices.length; i += 3) {
			const i0 = startIndex + indices[i]!;
			const i1 = startIndex + indices[i + 1]!;
			const i2 = startIndex + indices[i + 2]!;
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
