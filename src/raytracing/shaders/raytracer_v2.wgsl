requires unrestricted_pointer_parameters;

#ifndef MAX_BOUNCES
	#define MAX_BOUNCES 10
#endif

const BV_MAX_STACK_DEPTH = 16;
const EPSILON = 0.001;

struct BvhNode {
	aabbMinLeftFirst: vec4f,
	aabbMaxTriCount: vec4f,
};

struct Ray {
	origin: vec3f,
	direction: vec3f,
	rD: vec3f,
	t: f32,// TODO: pack ?
	//triIndex: u32,// TODO: pack ?
	materialIdx: u32,
	hitPos: vec3f,
	hitNormal: vec3f,
	coord: vec2f,
	hitColor: vec4f,
};

struct Tri {
	vertex0: vec3f,
	materialIdx: u32,
	vertex1: vec3f,
	flatShading: u32,
	vertex2: vec3f,

	normal0: vec3f,
	normal1: vec3f,
	normal2: vec3f,

	uv0: vec2f,
	uv1: vec2f,
	uv2: vec2f,

	faceNormal: vec3f,
};

struct TextureDescriptor {
	width: u32,
	height: u32,
	offset: u32,
	elements: u32,
	repeat: u32,
	layers: u32,
}

struct Material {
	materialType: u32,
	reflectionRatio: f32,
	reflectionGloss: f32,
	refractionIndex: f32,
	albedo: vec3f,
	textures: array<TextureDescriptor, 8>,// TODO: setup a var for max textures
};

const rootNodeIdx = 0;

#include math::modulo
#include raytracer::utils
#include raytracer::common
/*
#include raytracer::ray
*/
#include raytracer::vec
/*
#include raytracer::interval
*/
#include raytracer::camera
/*
#include raytracer::color
#include raytracer::material
*/

struct Counters {
	invocations: atomic<u32>,
	rayCount: atomic<u32>,
	counter0: atomic<u32>,
	counter1: atomic<u32>,
	counter2: atomic<u32>,
	counter3: atomic<u32>,
	counter4: atomic<u32>,
	counter5: atomic<u32>,
	counter6: atomic<u32>,
	counter7: atomic<u32>,
}

struct Context {
	rayStackPtr: u32,
	rayStack: array<Ray, MAX_BOUNCES + 1>,
	//currentRay: Ray,
	rngState: u32,
	globalInvocationId: vec3<u32>,
	bounces: u32,
	done: bool,
}

@group(0) @binding(0) var<storage, read_write> raytraceImageBuffer: array<vec3f>;
@group(0) @binding(1) var<storage, read_write> rngStateBuffer: array<u32>;
@group(0) @binding(2) var<uniform> commonUniforms: CommonUniforms;
@group(0) @binding(3) var<uniform> cameraUniforms: Camera;
@group(0) @binding(4) var outTexture: texture_storage_2d<OUTPUT_FORMAT, write>;

//@group(1) @binding(0) var<storage, read> faces: array<Face>;
//@group(1) @binding(1) var<storage, read> AABBs: array<AABB>;
@group(1) @binding(2) var<storage, read> materials: array<Material>;
@group(1) @binding(3) var<storage, read> textures: array<f32>;

@group(2) @binding(x) var<storage, read> indices: array<u32>;
@group(2) @binding(x) var<storage, read> tris: array<Tri>;
@group(2) @binding(x) var<storage, read> bvhNodes: array<BvhNode>;
@group(2) @binding(x) var<storage, read_write> counters: Counters;

override WORKGROUP_SIZE_X: u32;
override WORKGROUP_SIZE_Y: u32;
override OBJECTS_COUNT_IN_SCENE: u32;
override MAX_BVs_COUNT_PER_MESH: u32;
override MAX_FACES_COUNT_PER_MESH: u32;

override maxBounces: u32 = 10;

//const rayStack = array<Ray, MAX_BOUNCES>();


@compute @workgroup_size(WORKGROUP_SIZE_X, WORKGROUP_SIZE_Y)
fn compute_main(@builtin(global_invocation_id) globalInvocationId : vec3<u32>,) {
	if (any(globalInvocationId.xy >= cameraUniforms.viewportSize)) {
		return;
	}

	let rayStackPtr: u32 = 0;

	atomicAdd(&counters.invocations, 1);

	let pos = globalInvocationId.xy;
	let x = f32(pos.x);
	let y = f32(pos.y);
	let idx = pos.x + pos.y * cameraUniforms.viewportSize.x;

	var rngState = rngStateBuffer[idx];

	if (commonUniforms.frameCounter == 0) {
		rngState = idx;
	}

	var camera = cameraUniforms;
	initCamera(&camera);
	var ray = getCameraRay(&camera, x, y, &rngState);

	var rays = array<Ray, MAX_BOUNCES + 1>();
	rays[0] = ray;
	var context: Context = Context(0, rays, rngState, globalInvocationId, 0, false);
	var color: vec4f = castRayLoop(&context);

	/*
	if (r.t < 1e30f) {
		p = r.t / 1000.;
	}
	*/


	/*
	var color: vec4f;
	if (ray.t != 1.e30) {
		let tri = &tris[ray.triIndex];
		p = f32(ray.triIndex) / f32(arrayLength(&indices));
		p = f32(tri.materialIdx) / 10;
		color = vec4f(p);

		let material = &materials[(*tri).materialIdx];
		if ((*material).materialType == 7) {
			color = vec4f(1, 0, 0, 1);
			//color = vec4f(textureLookup((*material).textures[0], 0.5, 0.5/*hitRec.coord.x, hitRec.coord.y*/).rgb, 1.0);
			color = vec4f(textureLookup((*material).textures[0], ray.coord.x, ray.coord.y/*hitRec.coord.x, hitRec.coord.y*/).rgb, 1.0);
		}
	} else {
		color = vec4f(1.0, 0.0, 0.0, 1.0);
	}
	*/

	var pixel = raytraceImageBuffer[idx];

	if (commonUniforms.frameCounter == 0) {
		pixel = vec3f(0);
	}

	pixel += color.rgb;
	raytraceImageBuffer[idx] = pixel;




	raytraceImageBuffer[idx] = pixel;
	textureStore(outTexture, globalInvocationId.xy, vec4(pixel / f32(commonUniforms.frameCounter) , 1.0));
	//textureStore(outTexture, globalInvocationId.xy, vec4f(color.rgb, 1.0));

	rngStateBuffer[idx] = rngState;
}

@must_use
fn castRayLoop(context: ptr<function, Context>) -> vec4f {
	var color: vec4f = vec4f(1.0);
	loop {
		castRay(context);

		if ((*context).done) {
			break;
		}
	}

	if (all((*context).globalInvocationId.xy == vec2u(200, 150))) {
		atomicStore(&counters.counter6, bitcast<u32>((*context).rayStackPtr));
	}

	for(var i: i32 = i32((*context).rayStackPtr); i >= 0; i--) {
		let ray: Ray = (*context).rayStack[i];
		let material = &materials[ray.materialIdx];

		if ((*material).materialType == 1) {
			// Emissive

			if (all((*context).globalInvocationId.xy == vec2u(200, 150))) {
				atomicStore(&counters.counter0, (*context).rayStackPtr);
				//atomicStore(&counters.counter1, bitcast<u32>((ray).hitNormal.y));
				//atomicStore(&counters.counter2, bitcast<u32>((ray).hitNormal.z));
			}


			//color = vec4f(f32(i / 10), 0.0, 0.0, 1.0);

			color = ray.hitColor;
			//color = vec4f(1, 0.0, 0.0, 1.0);
		} else {
			color *= ray.hitColor;
		}

		//color = vec4f( f32((*context).rayStackPtr) / 3.);
		//color = vec4f(abs(ray.hitNormal), 1.0);
	}

	let ray: Ray = (*context).rayStack[0];
	//color = vec4f(normalize(abs(ray.direction)), 1.0);
	//color = vec4f(abs(ray.hitNormal), 0.0);
	//color = ray.hitColor;
	//color = vec4f( f32((*context).rayStackPtr) / 3.);

	let material = &materials[ray.materialIdx];
	if ((*material).materialType == 1) {
		//color = vec4f(1.0) ;
	} else {
		//color = vec4f(.0) ;
	}

	return color;
}

fn castRay(context: ptr<function, Context>) {
	/*
	if ((*context).rayStackPtr == MAX_BOUNCES) {
		return vec4f(0);
	}
	*/
	(*context).done = true;


	var color: vec4f;

	let currentRay = (*context).rayStackPtr;
	let ray = &(*context).rayStack[currentRay];
	//(*context).rayStackPtr--;

	let p = intersectBvh(ray);

	if (false && all((*context).globalInvocationId.xy == vec2u(200, 150))) {
		atomicStore(&counters.counter0, bitcast<u32>((ray).hitNormal.x));
		atomicStore(&counters.counter1, bitcast<u32>((ray).hitNormal.y));
		atomicStore(&counters.counter2, bitcast<u32>((ray).hitNormal.z));
	}

	if (ray.t != 1.e30) {
		(*context).rayStack[currentRay].t = ray.t;
		//let tri = &tris[ray.triIndex];
		let material = &materials[ray.materialIdx];


		switch ((*material).materialType) {
			case 1: {
				//ray.hitColor = vec4f(1.0);
				ray.hitColor = vec4f((*material).albedo, 1.0);
			}
			case 7777: {
				(*context).rayStack[currentRay].hitColor = vec4f(textureLookup((*material).textures[0], ray.coord.x, ray.coord.y/*hitRec.coord.x, hitRec.coord.y*/).rgb, 1.0);
			}
			case 6,7, 8: {

				var scatterDirection: vec3f = normalize(ray.hitNormal + randomUnitVec3(&(*context).rngState));
				if (nearZero(scatterDirection)) {
					scatterDirection = ray.hitNormal;
				}

				let rD = vec3f( 1 / scatterDirection.x, 1 / scatterDirection.y, 1 / scatterDirection.z );
				var newRay = Ray(ray.hitPos, scatterDirection, rD, 1.e30, 0xffffff, vec3f(0), vec3f(0), vec2f(0), vec4f(0));


				pushRay(&newRay, context);

				(*context).rayStack[currentRay].hitColor = vec4f(textureLookup((*material).textures[0], ray.coord.x, ray.coord.y/*hitRec.coord.x, hitRec.coord.y*/).rgb, 1.0);
			}
			default: {
				// ...
			}
		}
	}
}

fn pushRay(ray: ptr<function, Ray>, context: ptr<function, Context>) {
	if ((*context).bounces >= MAX_BOUNCES) {
		return;
	}

	(*context).bounces++;

	(*context).rayStackPtr++;
	(*context).rayStack[(*context).rayStackPtr] = *ray;
	(*context).done = false;

}

@must_use
fn intersectBvh(ray: ptr<function, Ray>, /*globalInvocationId : vec3<u32> TODO: remove, used for debug */) -> f32{
	var node: BvhNode = bvhNodes[rootNodeIdx];
	var stack: array<u32, 64>;
	var stackPtr: u32 = 0;

	atomicAdd(&counters.rayCount, 1);

	var boxIteration: u32 = 0;
	var r: f32 = 0;
	var currentNode: u32 = 0;

	//atomicAdd(&counters.counter0, bitcast<u32>(node.aabbMaxTriCount.a));

	loop {
		//atomicAdd(&counters.counter1, 1);
		//r = abs(ray.direction[0] * ray.direction[2]);
		let nodeTriCount: u32 = bitcast<u32>(node.aabbMaxTriCount.a);
		if (nodeTriCount > 0) {
			// Node is a leaf
			let nodeLeftFirst: u32 = bitcast<u32>(node.aabbMinLeftFirst.a);
			for(var i: u32 = 0; i <= nodeTriCount; i++) {
				let tri = &tris[indices[nodeLeftFirst + i]];
				intersectTri( ray, tri );

				/*
				if (all(globalInvocationId.xy == vec2u(100, 75))) {
					atomicStore(&counters.counter2, bitcast<u32>((*ray).t));
				}
				*/

				if ((*ray).t != 1.e30) {
					r = 100 / (*ray).t;
					r = f32(indices[nodeLeftFirst + i]) / f32(arrayLength(&indices));
				}
			}

			if (stackPtr == 0) {
				break;
			} else {
				//atomicAdd(&counters.counter1, nodeTriCount);
				stackPtr = stackPtr - 1;
				node = bvhNodes[stack[stackPtr]];
			}
		} else {
			let nodeLeftFirst: u32 = bitcast<u32>(node.aabbMinLeftFirst.a);
			var child1: BvhNode = bvhNodes[nodeLeftFirst];
			var child2: BvhNode = bvhNodes[nodeLeftFirst + 1];
			var child1Ptr: u32 = nodeLeftFirst;
			var child2Ptr: u32 = nodeLeftFirst + 1;
			/*
		#ifdef USE_SSE
			float dist1 = IntersectAABB_SSE( ray, child1->aabbMin4, child1->aabbMax4 );
			float dist2 = IntersectAABB_SSE( ray, child2->aabbMin4, child2->aabbMax4 );
		#else
		*/
			var dist1: f32 = intersectAABB( ray, child1.aabbMinLeftFirst.xyz, child1.aabbMaxTriCount.xyz );
			var dist2: f32 = intersectAABB( ray, child2.aabbMinLeftFirst.xyz, child2.aabbMaxTriCount.xyz );

			/*
			if (false && boxIteration == 5 && all(globalInvocationId.xy == vec2u(100, 75))) {
				atomicStore(&counters.counter1, currentNode);
				atomicStore(&counters.counter2, bitcast<u32>(dist1));
				atomicStore(&counters.counter3, bitcast<u32>(dist2));
				atomicStore(&counters.counter4, child1Ptr);
				atomicStore(&counters.counter5, child2Ptr);
				atomicStore(&counters.counter7, currentNode);
				//atomicStore(&counters.counter1, nodeLeftFirst);
			}
			*/

		//#endif
			if (dist1 > dist2) {
				let tmpDist: f32 = dist1;
				dist1 = dist2;
				dist2 = tmpDist;
				let tmpChild: BvhNode = child1;
				child1 = child2;
				child2 = tmpChild;
				child1Ptr = child1Ptr + 1;
				child2Ptr = child2Ptr - 1;
			}
			if (dist1 == 1e30f) {
				if (stackPtr == 0) {
					break;
				} else {
					stackPtr = stackPtr - 1;
					node = bvhNodes[stack[stackPtr]];
					currentNode = stack[stackPtr];
				}
			} else {
				node = child1;
				currentNode = child1Ptr;
				if (dist2 != 1e30f) {
					stack[(stackPtr)] = child2Ptr;
					stackPtr++;
				}
			}
		}

		boxIteration++;
		if (boxIteration > 1000) {
			break;
		}
	}
	return r;
}

fn intersectTri(ray: ptr<function, Ray>, tri: ptr<storage, Tri, read>) {
	//let tri = &tris[triIndex];

	let edge1: vec3f = (*tri).vertex1 - (*tri).vertex0;
	let edge2: vec3f = (*tri).vertex2 - (*tri).vertex0;

	let normal1 = (*tri).normal1 - (*tri).normal0;
	let normal2 = (*tri).normal2 - (*tri).normal0;

	let uv1 = (*tri).uv1 - (*tri).uv0;
	let uv2 = (*tri).uv2 - (*tri).uv0;

	let h: vec3f = cross( (*ray).direction, edge2 );
	let a: f32 = dot( edge1, h );
	if (a > -0.0001f && a < 0.0001f) {
		return; // ray parallel to triangle
	}
	let f: f32 = 1 / a;
	let s: vec3f = (*ray).origin - (*tri).vertex0;
	let u: f32 = f * dot( s, h );
	if (u < 0 || u > 1) {
		return;
	}
	let q: vec3f = cross( s, edge1 );
	let v: f32 = f * dot( (*ray).direction, q );
	if (v < 0 || u + v > 1) {
		return;
	}
	let t: f32 = f * dot( edge2, q );
	if (t > 0.0001f) {
		if (t < (*ray).t) {
			(*ray).materialIdx = (*tri).materialIdx;

			(*ray).hitPos = (*tri).vertex0 + u * edge1 + v * edge2;
			if ((*tri).flatShading == 0) {
				(*ray).hitNormal = (*tri).normal0 + u * normal1 + v * normal2;
			} else {
				(*ray).hitNormal = (*tri).faceNormal;
			}
			(*ray).coord = (*tri).uv0 + u * uv1 + v * uv2;
		}
		(*ray).t = min( (*ray).t, t );
	}
}

@must_use
fn getCameraRay(camera: ptr<function, Camera>, i: f32, j: f32, rngState: ptr<function, u32>) -> Ray {
	let pixelCenter = (*camera).pixel00Loc + (i * (*camera).pixelDeltaU) + (j * (*camera).pixelDeltaV);
	let pixelSample = pixelCenter + pixelSampleSquare(camera, rngState);
	let rayOrigin = select(defocusDiskSample(camera, rngState), (*camera).center, (*camera).defocusAngle <= 0);
	let rayDirection = pixelSample - rayOrigin;
	let rD = vec3f( 1 / rayDirection.x, 1 / rayDirection.y, 1 / rayDirection.z );
	return Ray(rayOrigin, rayDirection, rD, 1.e30, 0xffffff, vec3f(0), vec3f(0), vec2f(0), vec4f(0));
}

@must_use
fn defocusDiskSample(camera: ptr<function, Camera>, rngState: ptr<function, u32>) -> vec3f {
	let p = randomVec3InUnitDisc(rngState);
	return (*camera).center + (p.x * (*camera).defocusDiscU) + (p.y * (*camera).defocusDiscV);
}

@must_use
fn pixelSampleSquare(camera: ptr<function, Camera>, rngState: ptr<function, u32>) -> vec3<f32> {
	let px = -0.5 + rngNextFloat(rngState);
	let py = -0.5 + rngNextFloat(rngState);
	return (px * (*camera).pixelDeltaU) + (py * (*camera).pixelDeltaV);
}

@must_use
fn intersectAABB(ray: ptr<function, Ray>, bmin: vec3f, bmax: vec3f ) -> f32 {
	let tx1: f32 = (bmin.x - (*ray).origin.x) * (*ray).rD.x;
	let tx2: f32 = (bmax.x - (*ray).origin.x) * (*ray).rD.x;
	var tmin: f32 = min( tx1, tx2 );
	var tmax: f32 = max( tx1, tx2 );
	let ty1: f32 = (bmin.y - (*ray).origin.y) * (*ray).rD.y;
	let ty2: f32 = (bmax.y - (*ray).origin.y) * (*ray).rD.y;
	tmin = max( tmin, min( ty1, ty2 ) );
	tmax = min( tmax, max( ty1, ty2 ) );
	let tz1: f32 = (bmin.z - (*ray).origin.z) * (*ray).rD.z;
	let tz2: f32 = (bmax.z - (*ray).origin.z) * (*ray).rD.z;
	tmin = max( tmin, min( tz1, tz2 ) );
	tmax = min( tmax, max( tz1, tz2 ) );
	if (tmax >= tmin && tmin < (*ray).t && tmax > 0) {
		return tmin;
	} else {
		return 1e30f;
	}
}

@must_use
fn textureLookup(desc: TextureDescriptor, u: f32, v: f32) -> vec4<f32> {
	if (desc.offset == 0xffffffff) {
		return vec4f(0.0);
	}
	let u2: f32 = select(clamp(u, 0f, 1f), modulo_f32(u, 1), (desc.repeat & 1) == 1);
	let v2: f32 = select(clamp(v, 0f, 1f), modulo_f32(v, 1), (desc.repeat & 2) == 2);

	let j = u32(u2 * f32(desc.width - 1));
	let i = u32(v2 * f32(desc.height - 1));
	let idx = (i * desc.width + j) * desc.elements;

	let elem = textures[desc.offset + idx];
	return vec4f(
		textures[desc.offset + idx + 0],
		textures[desc.offset + idx + 1],
		textures[desc.offset + idx + 2],
		select(0., textures[desc.offset + idx + 3], desc.elements >= 4)
	) / 255.;
}
