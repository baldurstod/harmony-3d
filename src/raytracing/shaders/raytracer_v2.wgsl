requires unrestricted_pointer_parameters, pointer_composite_access;

#ifndef MAX_BOUNCES
	#define MAX_BOUNCES 10
#endif
#define MAX_SUB_RAYS 5

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
	startNormal: vec3f,
	tbn: mat3x3f,
	coord: vec2f,
	hitColor: vec4f,
	selfColor: vec4f,
	totalColor: vec4f,

	lightIndex: u32,
	lightDistance: f32,

	chilRays: array<u32, MAX_SUB_RAYS>,
	chilId: u32,
};

struct TextureDescriptor {
	width: u32,
	height: u32,
	offset: u32,
	elements: u32,
	repeat: u32,
	layers: u32,
}

// The values should be consistent with enum RtMaterial
const EmissiveMaterial = 1;
const ReflectiveMaterial = 2;
const DielectricMaterial = 3;
const LambertianMaterial = 4;
const Source1Material = 1000;

const Source1VertexLitGenericMaterial = 1001;
const Source1LightMappedGenericMaterial = 1002;
const Source1EyeRefractMaterial = 1003;
const Source1RefractMaterial = 1004;

const Source2Material = 2000;

struct Material {
	materialType: u32,
	reflectionRatio: f32,
	reflectionGloss: f32,
	refractionIndex: f32,
	albedo: vec3f,
	textures: array<TextureDescriptor, 8>,// TODO: setup a var for max textures
	v0: vec4f,
	v1: vec4f,
	v2: vec4f,
	v3: vec4f,
};

// The values should be consistent with enum LightType
const AmbientLight = 1;
const PointLight = 2;
const SpotLight = 3;
const DirectionalLight = 4;

struct Light {
	position: vec3f,
	lightType: u32,
	orientation: vec4f,
	color: vec3f,
	intensity: f32,
	innerAngle: f32,
	outerAngle: f32,
	range: f32,
	radius: f32,
};

const rootNodeIdx = 0;

#include math::modulo
#include raytracer::utils
#include raytracer::common
#include raytracer::tri
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
	rayStackPtr2: u32,
	rayStack: array<Ray, (MAX_BOUNCES + 1) * MAX_SUB_RAYS>,
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
@group(1) @binding(4) var<storage, read> lights: array<Light>;

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

	var rays = array<Ray, (MAX_BOUNCES + 1) * MAX_SUB_RAYS>();
	rays[0] = ray;
	var context: Context = Context(0, 0, rays, rngState, globalInvocationId, 0, false);
	var color: vec4f = castRayLoop(&context);

	var pixel = raytraceImageBuffer[idx];

	if (commonUniforms.frameCounter == 0) {
		pixel = vec3f(0);
	}

	pixel += color.rgb;

	raytraceImageBuffer[idx] = pixel;
	textureStore(outTexture, globalInvocationId.xy, vec4(pixel / f32(commonUniforms.frameCounter) , 1.0));

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

	/*
	if (all((*context).globalInvocationId.xy == vec2u(200, 150))) {
		atomicStore(&counters.counter6, bitcast<u32>((*context).rayStackPtr));
	}
	*/

	let ray: ptr<function, Ray> = &(*context).rayStack[0];

	if (all((*context).globalInvocationId.xy == vec2u(200, 150))) {
		atomicStore(&counters.counter6, bitcast<u32>((*context).rayStackPtr));
	}

	for(var i: i32 = i32((*context).rayStackPtr); i >= 0; i--) {
		let ray: ptr<function, Ray> = &(*context).rayStack[i];
		let material = &materials[ray.materialIdx];

		var childsColor = vec4f(0.);

		if (i == 0) {
			if (all((*context).globalInvocationId.xy == vec2u(200, 150))) {
				atomicStore(&counters.counter6, bitcast<u32>(ray.chilId));
			}
		}

		if (ray.chilId > 0) {
			var found: bool = false;
			for(var i: u32 = 0; i < MAX_SUB_RAYS; i++) {
				let child: u32 = ray.chilRays[i];
				if (child == 0) {
					break;
				}

				let childRay = (*context).rayStack[child];

				if (childRay.t != 1.e30) {
					childsColor += childRay.totalColor;
					found = true;
				}
			}
			if (found) {
				ray.totalColor = ray.hitColor * childsColor + ray.selfColor;
			} else {
				ray.totalColor = ray.hitColor + ray.selfColor;
			}
		} else {
			ray.totalColor = ray.hitColor + ray.selfColor;
		}
	}

	if (all((*context).globalInvocationId.xy == vec2u(200, 150))) {
		let id: u32 = 1;
		atomicStore(&counters.counter0, bitcast<u32>((*context).rayStack[id].hitColor.x));
		atomicStore(&counters.counter1, bitcast<u32>((*context).rayStack[id].hitColor.y));
		atomicStore(&counters.counter2, bitcast<u32>((*context).rayStack[id].hitColor.z));
		atomicStore(&counters.counter3, bitcast<u32>((*context).rayStack[id].totalColor.x));
		atomicStore(&counters.counter4, bitcast<u32>((*context).rayStack[id].totalColor.y));
		atomicStore(&counters.counter5, bitcast<u32>((*context).rayStack[id].totalColor.z));

		atomicStore(&counters.counter6, bitcast<u32>((*context).rayStack[0].chilId));
		atomicStore(&counters.counter6, bitcast<u32>((*context).rayStack[0].chilRays[0]));
		atomicStore(&counters.counter7, bitcast<u32>((*context).rayStack[0].chilRays[1]));
	}

	/*
	for(var i: i32 = i32((*context).rayStackPtr); i >= 0; i--) {
		let ray: ptr<function, Ray> = &(*context).rayStack[i];
		let material = &materials[ray.materialIdx];

		if ((*material).materialType == 1) {
			// Emissive
			color = ray.totalColor;
		} else {
			color *= ray.hitColor;
		}
	}
	*/
	color = ray.totalColor;

	return color;
}

fn castRay(context: ptr<function, Context>) {
	(*context).done = true;


	var color: vec4f;

	let currentRay = (*context).rayStackPtr2;
	(*context).rayStackPtr2++;
	let ray: ptr<function, Ray> = &(*context).rayStack[currentRay];

	let p = intersectBvh(ray);

	/*
	if (false && all((*context).globalInvocationId.xy == vec2u(200, 150))) {
		atomicStore(&counters.counter0, bitcast<u32>((ray).hitNormal.x));
		atomicStore(&counters.counter1, bitcast<u32>((ray).hitNormal.y));
		atomicStore(&counters.counter2, bitcast<u32>((ray).hitNormal.z));
	}
	*/

	if (ray.lightIndex != 0xFFFFFFFF) {

		/*
		if (all((*context).globalInvocationId.xy == vec2u(200, 150))) {
			atomicStore(&counters.counter0, bitcast<u32>(ray.lightDistance));
		}
		*/

		if (ray.t > 0 && ray.t < ray.lightDistance) {
			ray.hitColor = vec4f(0.0);
			return;
		} else {
			ray.t = ray.lightDistance;
			ray.materialIdx = 1;// light material
		}
	}

	if (ray.t != 1.e30) {
		(*context).rayStack[currentRay].t = ray.t;
		//let tri = &tris[ray.triIndex];
		let material = &materials[ray.materialIdx];


		switch ((*material).materialType) {
			case EmissiveMaterial: {
				//ray.hitColor = vec4f(1.0);
				ray.hitColor = vec4f((*material).albedo, 1.0);
			}
			case Source1Material, Source1VertexLitGenericMaterial, Source1LightMappedGenericMaterial, Source2Material: {
				let cubeMap = (*material).textures[3];
				//let random = select(0., 1., cubeMap.offset == 0xffffffff);

				var scatterDirection: vec3f = normalize(ray.hitNormal * randomUnitVec3(&(*context).rngState));
				scatterRay(scatterDirection, currentRay, context);
				shadowRay(currentRay, context);

				var color: vec3f;
				let texelColor = textureLookup((*material).textures[0], ray.coord);

				color = texelColor.rgb;

				if (cubeMap.offset != 0xffffffff) {
					let cubeValue = textureCubeLookup(cubeMap, reflect(ray.direction, ray.hitNormal));
					//ray.selfColor = vec4f(cubeValue.rgb * texelColor.a * (*material).v0.rgb, 1.0);
					color = color + cubeValue.rgb * texelColor.a * (*material).v0.rgb;
				}

				ray.hitColor = vec4f(color, 1.0);
				(*context).bounces++;
			}
			case Source1EyeRefractMaterial: {
				var scatterDirection: vec3f = normalize(ray.hitNormal + randomUnitVec3(&(*context).rngState));
				scatterRay(scatterDirection, currentRay, context);
				shadowRay(currentRay, context);
				ray.hitColor = vec4f(textureLookup((*material).textures[0], ray.coord).rgb, 1.0);
				(*context).bounces++;
			}
			case Source1RefractMaterial: {
				let refractRatio = select((*material).refractionIndex, 1.0 / (*material).refractionIndex, /*(*hitRec).frontFace*/ false);
				let unitDirection = normalize((*ray).direction);
				let cosTheta = dot(-unitDirection, ray.hitNormal);
				let sinTheta = sqrt(1.0 - cosTheta * cosTheta);
				let cannotRefract = refractRatio * sinTheta > 1.0;
				var direction = select(
					refract(unitDirection, ray.hitNormal, refractRatio),
					reflect(unitDirection, ray.hitNormal),
					false
				);

				var dir = textureLookup((*material).textures[0], ray.coord).rgb;
				dir = vec3f(0.5, 0.5, 1);

				direction = normalize((*ray).direction) + dir * 0.15;
				direction = refract(ray.direction, ray.hitNormal, 0.15);


				let surfaceNormal: vec3f = normalize((*ray).tbn * (dir.rgb * 2 - 1));

				//scatterRay(direction, currentRay, context);
				ray.hitColor = vec4f(ray.coord, 0.0, 1.0);
				ray.hitColor = vec4f(abs((*ray).tbn[1]), 1.0);
				ray.hitColor = vec4f(abs(direction), 1.0);
				let refractedRay = refract(normalize((*ray).direction), surfaceNormal, 0.15);
				ray.hitColor = vec4f(abs(refractedRay), 1.0);


				scatterRay2(ray.hitPos + ray.direction * 10, refractedRay, currentRay, context);ray.hitColor = vec4f(1.0);
				//ray.hitColor = vec4f(abs(surfaceNormal), 1.0);
				//ray.hitColor = vec4f(dir, 1.0);
				//ray.hitColor = vec4f(1.0);
				//ray.hitColor = vec4f(direction - (*ray).direction, 1.0);
				//ray.hitColor = vec4f(vec3f(sinTheta), 1.0);
				(*context).bounces++;
			}
			case 0xFFFFFFFF: {
				let light = &lights[ray.lightIndex];
				//ray.hitColor = vec4f(ray.t / light.range);
				ray.hitColor = vec4f(light.intensity * light.range * 100 / (ray.lightDistance * ray.lightDistance)) * max(0, dot(ray.direction, ray.startNormal));
			}
			default: {
				// ...
			}
		}
	}
}

fn scatterRay(scatterDirection: vec3f, currentRay: u32, context: ptr<function, Context>) {
	let ray: ptr<function, Ray> = &(*context).rayStack[currentRay];
	//var scatterDirection: vec3f = normalize(ray.hitNormal + randomUnitVec3(&(*context).rngState));
	if (nearZero(scatterDirection)) {
		return;
	}

	var rD: vec3f = 1 / scatterDirection;
	var newRay = Ray(ray.hitPos, scatterDirection, rD, 1.e30, 0xFFFFFFFF, vec3f(0), vec3f(0), ray.hitNormal, mat3x3f(), vec2f(0), vec4f(0), vec4f(0), vec4f(0), 0xFFFFFFFF, 0, array<u32, MAX_SUB_RAYS>(), 0);
	pushRay(&newRay, currentRay, context);
}

fn scatterRay2(origin: vec3f, scatterDirection: vec3f, currentRay: u32, context: ptr<function, Context>) {
	let ray: ptr<function, Ray> = &(*context).rayStack[currentRay];
	//var scatterDirection: vec3f = normalize(ray.hitNormal + randomUnitVec3(&(*context).rngState));
	if (nearZero(scatterDirection)) {
		return;
	}

	var rD: vec3f = 1 / scatterDirection;
	var newRay = Ray(origin, scatterDirection, rD, 1.e30, 0xFFFFFFFF, vec3f(0), vec3f(0), ray.hitNormal, mat3x3f(), vec2f(0), vec4f(0), vec4f(0), vec4f(0), 0xFFFFFFFF, 0, array<u32, MAX_SUB_RAYS>(), 0);
	pushRay(&newRay, currentRay, context);
}


fn shadowRay(currentRay: u32, context: ptr<function, Context>) {
	let ray: ptr<function, Ray> = &(*context).rayStack[currentRay];
	let light = &lights[0];
	var lightDir: vec3f = light.position + light.radius * randomUnitVec3(&(*context).rngState) - ray.hitPos;
	let dist = length(lightDir);
	lightDir = normalize(lightDir);

	var rD: vec3f = 1 / lightDir;
	var newRay = Ray(ray.hitPos + ray.hitNormal * 0.5/*TODO: add bias parameter */, lightDir, rD, 1.e30, 0xFFFFFFFF, vec3f(0), vec3f(0), ray.hitNormal, mat3x3f(), vec2f(0), vec4f(0), vec4f(0), vec4f(0), 0, dist, array<u32, MAX_SUB_RAYS>(), 0);
	pushRay(&newRay, currentRay, context);
}

fn pushRay(ray: ptr<function, Ray>, parentId: u32, context: ptr<function, Context>) {
	if ((*context).bounces >= MAX_BOUNCES) {
		return;
	}

	let parent: ptr<function, Ray> = &(*context).rayStack[parentId];

	(*context).rayStackPtr++;
	parent.chilRays[parent.chilId] = (*context).rayStackPtr;
	parent.chilId++;


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

	loop {
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

	let tangent1 = (*tri).tangent1.xyz - (*tri).tangent0.xyz;
	let tangent2 = (*tri).tangent2.xyz - (*tri).tangent0.xyz;

	let bitangent1 = (*tri).bitangent1 - (*tri).bitangent0;
	let bitangent2 = (*tri).bitangent2 - (*tri).bitangent0;

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
			var tangent: vec3f;
			var bitangent: vec3f;

			(*ray).materialIdx = (*tri).materialIdx;

			(*ray).hitPos = (*tri).vertex0 + u * edge1 + v * edge2;
			if ((*tri).flatShading == 0) {
				(*ray).hitNormal = (*tri).normal0 + u * normal1 + v * normal2;
				tangent = (*tri).tangent0.xyz + u * tangent1 + v * tangent2;
				bitangent = (*tri).bitangent0 + u * bitangent1 + v * bitangent2;
			} else {
				(*ray).hitNormal = (*tri).faceNormal;
				tangent = vec3f(1, 0, 0);// TODO: compute actual tangent
				bitangent = vec3f(0, 1, 0);// TODO: compute actual bitangent
			}
			(*ray).coord = (*tri).uv0 + u * uv1 + v * uv2;
			(*ray).tbn = mat3x3f(tangent, bitangent, (*ray).hitNormal);
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
	return Ray(rayOrigin, rayDirection, rD, 1.e30, 0xFFFFFFFF, vec3f(0), vec3f(0), vec3f(0), mat3x3f(), vec2f(0), vec4f(0), vec4f(0), vec4f(0), 0xFFFFFFFF, 0, array<u32, MAX_SUB_RAYS>(), 0);
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
fn textureLookup(desc: TextureDescriptor, uv: vec2f) -> vec4<f32> {
	if (desc.offset == 0xffffffff) {
		return vec4f(0.0);
	}

	let uv2 : vec2f = select(clamp(uv, vec2f(0), vec2f(1)), modulo_vec2f(uv, vec2f(1)), vec2<bool>((desc.repeat & 1) == 1, (desc.repeat & 2) == 2));

	return textureLookup2(desc,
		u32(uv2.x * f32(desc.width - 1)),
		u32(uv2.y * f32(desc.height - 1)),
	);
}

@must_use
fn textureLookupBilinear(desc: TextureDescriptor, uv: vec2f) -> vec4<f32> {
	if (desc.offset == 0xffffffff) {
		return vec4f(0.0);
	}

	let uv2 : vec2f = select(clamp(uv, vec2f(0), vec2f(1)), modulo_vec2f(uv, vec2f(1)), vec2<bool>((desc.repeat & 1) == 1, (desc.repeat & 2) == 2));


	let x = uv2.x * f32(desc.width - 1);
	let y = uv2.y * f32(desc.height - 1);

	let x1 = floor(x);
	let x2 = ceil(x);
	let y1 = floor(y);
	let y2 = ceil(y);

	let q11 = textureLookup2(desc, u32(x1), u32(y1));
	let q12 = textureLookup2(desc, u32(x1), u32(y2));
	let q21 = textureLookup2(desc, u32(x2), u32(y1));
	let q22 = textureLookup2(desc, u32(x2), u32(y2));

	//return vec4f(f32(x) / 1000, f32(y) / 1000, 0, 1);
	//return vec4f(vec3f((x2 - x) / (x2 - x1)), 1);

	let f1 = (x2 - x);
	let f2 = (x - x1);

	let r1 = f1 * q11 + f2 * q21;
	let r2 = f1 * q12 + f2 * q22;

	//return vec4f(f32(x) / 1000, f32(y) / 1000, 0, 1);
	//return vec4f(vec3f((x2 - x) / (x2 - x1)  ), 1);

	return f1 * r1 + f2 * r2;
}

@must_use
fn textureLookup2(desc: TextureDescriptor, u: u32, v: u32) -> vec4<f32> {
	let idx = (v * desc.width + u) * desc.elements;

	let elem = textures[desc.offset + idx];
	return vec4f(
		textures[desc.offset + idx + 0],
		textures[desc.offset + idx + 1],
		textures[desc.offset + idx + 2],
		select(0., textures[desc.offset + idx + 3], desc.elements >= 4)
	) / 255.;
}

@must_use
fn textureCubeLookup(desc: TextureDescriptor, dir: vec3f) -> vec4<f32> {
	if (desc.offset == 0xffffffff || desc.layers < 6) {
	return vec4f(0.0);
	}

	let coords = sampleCube(dir);
	let u = coords.x;
	let v = coords.y;
	let faceIndex = coords.z;

	let u2: f32 = select(clamp(u, 0f, 1f), modulo_f32(u, 1), (desc.repeat & 1) == 1);
	let v2: f32 = select(clamp(v, 0f, 1f), modulo_f32(v, 1), (desc.repeat & 2) == 2);

	let j = u32(u2 * f32(desc.width - 1));
	let i = u32(v2 * f32(desc.height - 1));
	let idx = (i * desc.width + j) * desc.elements + u32(faceIndex) * desc.height * desc.width * desc.elements;

	let elem = textures[desc.offset + idx];
	return vec4f(
	textures[desc.offset + idx + 0],
	textures[desc.offset + idx + 1],
	textures[desc.offset + idx + 2],
	select(0., textures[desc.offset + idx + 3], desc.elements >= 4)
	) / 255.;
}

// See https://gamedev.net/forums/topic/687535
fn sampleCube(v: vec3f) -> vec3f {
	let vAbs = abs(v);
	var ma: f32;
	var faceIndex: f32;
	var uv: vec2f;

	if(vAbs.z >= vAbs.x && vAbs.z >= vAbs.y) {
		faceIndex = select(4., 5., v.z < 0.0);
		ma = 0.5 / vAbs.z;
		uv = vec2f(select(v.x, -v.x, v.z < 0.0), -v.y);
	} else if(vAbs.y >= vAbs.x) {
		faceIndex = select(2., 3., v.y < 0.0);
		ma = 0.5 / vAbs.y;
		uv = vec2f(v.x, select(v.z, -v.z, v.y < 0.0));
	} else {
		faceIndex = select(0., 1., v.z < 0.0);
		ma = 0.5 / vAbs.x;
		uv = vec2f(select(-v.z, v.z, v.x < 0.0), -v.y);
	}
	return vec3f(uv * ma + 0.5, faceIndex);
}
