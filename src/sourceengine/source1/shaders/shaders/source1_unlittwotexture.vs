export default `
//#version 300 es

#ifdef HARDWARE_PARTICLES
attribute float aParticleId;
#endif
#include declare_attributes
#include declare_matrix_uniforms
#include declare_vertex_uv
#include declare_vertex_skinning

uniform float uFaceCamera;
uniform vec3 uCameraPosition;

//uniform mat4 uTextureTransform;
uniform mat4 uTexture2Transform;

#include source_declare_particle

#include source1_varying_unlittwotexture

/*unlittwotexture.vs*/
void main(void) {
#ifdef HARDWARE_PARTICLES
	particle p = getParticle(int(aParticleId));
	vColor = p.color;
#else
	vColor = vec4(1.0);
#endif
	//vTextureCoord = aTextureCoord;

#ifdef USE_TEXTURE_TRANSFORM
	vTextureCoord.xy = (uTextureTransform * vec4(aTextureCoord, 1.0, 1.0)).st;
	vTexture2Coord.xy = (uTexture2Transform * vec4(aTextureCoord, 1.0, 1.0)).st;
#endif

#ifdef PARTICLE_ORIENTATION_WORLD_Z_ALIGNED
	//vec3 aVertexPosition3 = aVertexPosition.xyz;
#else
	//vec3 aVertexPosition3 = aVertexPosition.xyz;
#endif
	vec3 aVertexPosition3 = aVertexPosition;
#ifdef HARDWARE_PARTICLES
	vec4 vertexPositionCameraSpace;
	vec4 test = vec4(aVertexPosition3, 1.0) * p.radius * rotationMatrix(vec3(0.0, .0, 1.0), -p.roll * 1.0);
	vec4 vertexPositionModelSpace = vec4(p.center.xyz + test.xyz, 1.0);
	if(uFaceCamera == 10.0) {//face camera
		mat4 lookAt = rotationMatrix(vec3(0.0, 1.0, 0.0), p.yaw);
		mat4 lookAt2 = rotationMatrix(vec3(0.0, 0.0, 1.0), -p.roll);
		lookAt = lookAt * lookAt2;
		vertexPositionCameraSpace = (uModelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0) + lookAt * vec4(aVertexPosition.x*p.radius, aVertexPosition.y*p.radius, 0.0, 0.0));
		vertexPositionCameraSpace = uModelViewMatrix * vertexPositionModelSpace;
	}

	if(uFaceCamera == 11.0) {
		mat4 lookAt = rotationMatrix(vec3(0.0, 0.0, 1.0), -p.roll);
		vec3 eyeDir = aVertexPosition - uCameraPosition;
		eyeDir.x = 0.0;
		eyeDir = normalize(eyeDir);
		vertexPositionCameraSpace = (uModelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0) + vec4(aVertexPosition.x*p.radius, aVertexPosition.y*p.radius*eyeDir.y, 0.0, 0.0));
	}

	if(uFaceCamera == 10.0) {
		mat4 lookAt = rotationMatrix(vec3(0.0, 0.0, 1.0), -p.roll);
		vec3 eyeDir = aVertexPosition - uCameraPosition;
		eyeDir.x = 0.0;
		eyeDir = normalize(eyeDir);
		vertexPositionCameraSpace = (uModelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0) + vec4(aVertexPosition.x*p.radius, aVertexPosition.y*p.radius*eyeDir.y, 0.0, 0.0));
		vertexPositionCameraSpace = uModelViewMatrix * vec4(vertexPositionModelSpace.x, vertexPositionModelSpace.y, vertexPositionModelSpace.z , 1.0);
		vertexPositionCameraSpace = (uModelViewMatrix * vec4(vertexPositionModelSpace.x, vertexPositionModelSpace.y*eyeDir.y, vertexPositionModelSpace.z, 1.0));
	}

	if(uFaceCamera == 1000.0) {
		mat4 lookAt = rotationMatrix(vec3(0.0, 1.0, 0.0), p.yaw);
		mat4 lookAt2 = rotationMatrix(vec3(0.0, 0.0, 1.0), -p.roll);
		vec3 eyeDir = aVertexPosition - uCameraPosition;
		eyeDir.x = 0.0;
		eyeDir = normalize(eyeDir);
		lookAt = lookAt * lookAt2;
		vertexPositionCameraSpace = (uModelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0) + lookAt * vec4(aVertexPosition.x*p.radius, aVertexPosition.y*p.radius, 0.0, 0.0));
		vertexPositionCameraSpace = lookAt * (uModelViewMatrix * vec4(vertexPositionModelSpace.x, vertexPositionModelSpace.y*eyeDir.y, vertexPositionModelSpace.z, 1.0));
	}

#else
	/*#ifdef HARDWARE_SKINNING
		mat4 skinMat = accumulateSkinMat();
		vec4 vertexPositionModelSpace = skinMat * vec4(aVertexPosition, 1.0);
	#else
		vec4 vertexPositionModelSpace = vec4(aVertexPosition, 1.0);
	#endif*/
	#include compute_vertex_uv
	#include compute_vertex_uv2
	#include compute_vertex
	#include compute_vertex_skinning
	//#include compute_vertex_projection
#endif
	//vertexPositionModelSpace *= rotationMatrix(vec3(0.0, 1.0, 0.0), -p.roll * 100.0);

	// = uModelViewMatrix * vertexPositionModelSpace;




#ifdef RENDER_SPRITE_TRAIL
	vec3 vecDelta = p.vecDelta.xyz;
	//vecDelta = vec3(1.0, 1.0, 0.0);
	vec3 aVertexPosition2;

	vec4 q;
	vec3 a = cross(vec3(1.0, 0.0, 0.0), vecDelta);
	q.xyz = a;
	q.w = /*length(vecDelta)*/1.0 + dot(vec3(1.0, 0.0, 0.0), vecDelta);

	aVertexPosition2 = vec3_transformQuat(aVertexPosition3 * vec3(p.vecDelta.w, 0.0, p.radius), normalize(q));
/*
	vec3 test2 = vec3(1.0, 0.0, 0.0);
	vec3 eyeDir = aVertexPosition2 - uCameraPosition;
	q.xyz = cross(test2, eyeDir);
	q.w = length(eyeDir) + dot(test2, vecDelta);
	aVertexPosition2.xyz = vec3_transformQuat(aVertexPosition2.xyz, normalize(q));*/
	vertexPositionModelSpace = vec4(p.center + aVertexPosition2 + vecDelta * p.vecDelta.w, 1.0);

#endif


#ifdef PARTICLE_ORIENTATION_SCREEN_ALIGNED
#ifdef RENDER_SPRITE_TRAIL
#else
	mat4 lookAt = rotationMatrix(vec3(0.0, 1.0, 0.0), p.yaw);
	mat4 lookAt2 = rotationMatrix(vec3(0.0, 0.0, 1.0), -p.roll);
	lookAt = lookAt * lookAt2;
	gl_Position = uProjectionMatrix * (uModelViewMatrix * vec4(p.center, 1.0) + lookAt * vec4(aVertexPosition.x*p.radius, aVertexPosition.y*p.radius, 0.0, 0.0));

#endif
#else
	//vertexPositionCameraSpace = uModelViewMatrix * vertexPositionModelSpace;
	//gl_Position = uProjectionMatrix * vertexPositionCameraSpace;
#endif

#ifdef HARDWARE_PARTICLES
	vertexPositionModelSpace = vec4(aVertexPosition, 1.0);
	vertexPositionCameraSpace = uModelViewMatrix * vertexPositionModelSpace;
	gl_Position = uProjectionMatrix * vertexPositionCameraSpace;
#else
#include compute_vertex_projection
#endif


}
`;
