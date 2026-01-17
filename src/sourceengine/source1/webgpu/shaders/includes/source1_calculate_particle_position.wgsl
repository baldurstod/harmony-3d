var q: vec4f;
var a: vec3f;
#ifndef PARTICLE_ORIENTATION
	#define PARTICLE_ORIENTATION 3
#endif
#ifndef USE_PARTICLE_YAW
	#define USE_PARTICLE_YAW 1
#endif

#define PARTICLE_ORIENTATION_SCREEN_ALIGNED 0
#define PARTICLE_ORIENTATION_SCREEN_Z_ALIGNED 1
#define PARTICLE_ORIENTATION_WORLD_Z_ALIGNED 2
#define PARTICLE_ORIENTATION_ALIGN_TO_PARTICLE_NORMAL 3
#define PARTICLE_ORIENTATION_SCREENALIGN_TO_PARTICLE_NORMAL 4
#define PARTICLE_ORIENTATION_FULL_3AXIS_ROTATION 5

	let p: Particle = getParticle(u32(particleId));
	output.vTextureCoord = vec4f(texCoord, output.vTextureCoord.zw);
	output.vColor = p.color;

	//vec4 test = vec4(position + vecDelta, 1.0);// * p.radius * rotationMatrix(vec3(0.0, 1.0, 0.0), -p.roll * 1.0);
	let test: vec4f = vec4(position, 1.0) * p.radius * rotationMatrix(vec3(0.0, .0, 1.0), -p.roll * 1.0);
	let vertexPositionModelSpace: vec4f = vec4(p.center.xyz + test.xyz, 1.0);
	//vertexPositionModelSpace *= rotationMatrix(vec3(0.0, 1.0, 0.0), -p.roll * 100.0);

	var vertexPositionCameraSpace: vec4f;// = matrixUniforms.modelViewMatrix * vertexPositionModelSpace;


#ifdef RENDER_SPRITE_TRAIL
	vec3 vecDelta = p.vecDelta.xyz;
	//vecDelta = vec3(1.0, 1.0, 0.0);
	vec3 aVertexPosition2;

	a = cross(vec3(1.0, 0.0, 0.0), vecDelta);
	q.xyz = a;
	q.w = 1.0 + dot(vec3(1.0, 0.0, 0.0), vecDelta);

	aVertexPosition2 = vec3_transformQuat(position * vec3(p.vecDelta.w, 0.0, p.radius), normalize(q));

	vertexPositionModelSpace = vec4(p.center + aVertexPosition2 + vecDelta * p.vecDelta.w * 0.0, 1.0);


	vec3 test2 = vec3_transformQuat(vec3(0.0, 0.0, 1.0), normalize(q));
	test2 = normalize(test2);


	aVertexPosition2 = vec3_transformQuat(position * vec3(p.vecDelta.w * 0.5, p.radius * 0.5, 0.0), normalize(q));
	vec3 eyeDir = p.center - uCameraPosition;
	q.xyz = vecDelta;
	q.w = 1.0 + dot(eyeDir, a);

#endif


#if PARTICLE_ORIENTATION == PARTICLE_ORIENTATION_SCREEN_ALIGNED
#ifdef RENDER_SPRITE_TRAIL
	//A + dot(AP,AB) / dot(AB,AB) * AB
	vec3 A =  p.center;
	vec3 B =  A + vecDelta;
	vec3 P =  uCameraPosition;
	vec3 AP = P-A;
	vec3 AB = B-A;

	vec3 projPoint = A + dot(AP,AB) / dot(AB,AB) * AB;


	vec3 vDirToBeam = normalize(projPoint - uCameraPosition);
	vec3 vTangentY = normalize(cross(vDirToBeam, vecDelta));
	vTangentY = test2;
	vertexPositionModelSpace = vec4(aVertexPosition2 + vecDelta * p.vecDelta.w * 0.5, 1.0);


	A = -vDirToBeam;
	B = normalize(vecDelta);
	mat3 M  = mat3(
1.0-B.x*B.x,-B.y*B.x,-B.z*B.x,
-B.x*B.y,1.0-B.y*B.y,-B.z*B.y,
-B.x*B.z,-B.y*B.z,1.0-B.z*B.z
	    );
	vec3 C = M * A;//B * (A * B / length(B)) / length(B);

	q.xyz = cross(vTangentY, C);
	q.w = 1.0 + dot(vTangentY, C);
	vertexPositionModelSpace = vec4_transformQuat(vertexPositionModelSpace, normalize(q));
	vertexPositionModelSpace.xyz += p.center;


	//vertexPositionModelSpace.xyz = vertexPositionModelSpace.xyz + vTangentY * p.radius * 0.5;


	vertexPositionCameraSpace = matrixUniforms.modelViewMatrix * vertexPositionModelSpace;
	output.position = matrixUniforms.projectionMatrix * vertexPositionCameraSpace;
#else
	var lookAt: mat4x4f = rotationMatrix(vec3(0.0, 1.0, 0.0), p.yaw);
	let lookAt2: mat4x4f = rotationMatrix(vec3(0.0, 0.0, 1.0), -p.roll);
	lookAt = lookAt * lookAt2;
	output.position = matrixUniforms.projectionMatrix * (matrixUniforms.modelViewMatrix * vec4(p.center, 1.0) + lookAt * vec4(position.xy * p.radius, 0.0, 0.0));

#endif
#else
	vertexPositionCameraSpace = matrixUniforms.modelViewMatrix * vertexPositionModelSpace;
	output.position = matrixUniforms.projectionMatrix * vertexPositionCameraSpace;
#endif

#if PARTICLE_ORIENTATION == PARTICLE_ORIENTATION_SCREENALIGN_TO_PARTICLE_NORMAL
	mat4 lookAt = rotationMatrix(vec3(0.0, 1.0, 0.0), p.yaw);
	mat4 lookAt2 = rotationMatrix(vec3(0.0, 0.0, 1.0), -p.roll);
	lookAt = lookAt * lookAt2;
	output.position = matrixUniforms.projectionMatrix * (matrixUniforms.modelViewMatrix * vec4(p.center, 1.0) + lookAt * vec4(position.xy * p.radius, 0.0, 0.0));
#endif

#if PARTICLE_ORIENTATION == PARTICLE_ORIENTATION_SCREENALIGN_TO_PARTICLE_NORMAL
	vertexPositionCameraSpace = matrixUniforms.modelViewMatrix * vertexPositionModelSpace;
	output.position = matrixUniforms.projectionMatrix * vertexPositionCameraSpace;
#endif

#if PARTICLE_ORIENTATION == PARTICLE_ORIENTATION_SCREEN_Z_ALIGNED
	mat4 lookAt = rotationMatrix(vec3(0.0, 1.0, 0.0), -p.yaw);
	mat4 lookAt2 = rotationMatrix(vec3(0.0, 0.0, 1.0), -p.roll);
	lookAt = lookAt * lookAt2;
	output.position = matrixUniforms.projectionMatrix * (matrixUniforms.modelViewMatrix * vec4(p.center, 1.0) + lookAt * vec4(position.xy * p.radius, 0.0, 0.0));
#endif

#if PARTICLE_ORIENTATION == PARTICLE_ORIENTATION_WORLD_Z_ALIGNED
	let yawMatrix: mat4x4f = rotationMatrix(vec3(0.0, 1.0, 0.0), p.yaw);

	#ifdef IS_SPRITE_CARD_MATERIAL
		let rollMatrix: mat4x4f = rotationMatrix(vec3(0.0, 0.0, 1.0), HALF_PI - p.roll);
	#else
		let rollMatrix: mat4x4f = rotationMatrix(vec3(0.0, 0.0, 1.0), p.roll);
	#endif
	var lookAt: mat4x4f;

	let cpMat: mat4x4f = mat4FromQuat(uOrientationControlPoint);

	#if USE_PARTICLE_YAW == 1
		lookAt = cpMat * yawMatrix * rollMatrix;
	#else
		lookAt = cpMat * rollMatrix;
	#endif

	#ifndef IS_SPRITE_CARD_MATERIAL
		output.position = matrixUniforms.projectionMatrix * (matrixUniforms.modelViewMatrix * (vec4(p.center, 1.0) + lookAt * vec4(vec2(1.0, -1.0) * position.xy * p.radius, 0.0, 0.0)));
	#else
		output.position = matrixUniforms.projectionMatrix * (matrixUniforms.modelViewMatrix * (vec4(p.center, 1.0) + lookAt * vec4(position.xy * p.radius, 0.0, 0.0)));
	#endif
#endif

#ifdef SOURCE1_PARTICLES
	#if PARTICLE_ORIENTATION == PARTICLE_ORIENTATION_ALIGN_TO_PARTICLE_NORMAL
		mat4 lookAt = rotationMatrix(vec3(0.0, 1.0, 0.0), -p.yaw);
		mat4 lookAt2 = rotationMatrix(vec3(0.0, 0.0, 1.0), -p.roll);
		lookAt = lookAt * lookAt2;
		output.position = matrixUniforms.projectionMatrix * (matrixUniforms.modelViewMatrix * vec4(p.center, 1.0) + lookAt * vec4(position.xy * p.radius, 0.0, 0.0));
	#endif
#else //SOURCE2
	#if PARTICLE_ORIENTATION == PARTICLE_ORIENTATION_ALIGN_TO_PARTICLE_NORMAL
		vec3 particleNormal = normalize(p.normal);//not sure we have to normalize
		mat4 lookAt = rotationMatrix(particleNormal, p.roll);
		vec4 pos;

		vec3 vTrialVector = vec3( 0.0, 0.0, 1.0 );
		if ( abs( particleNormal.z ) > 0.9 )
		{
			vTrialVector = float3( 1, 0, 0 );
		}
		vec3 up = normalize( cross( particleNormal, vTrialVector ) );
		vec3 right = cross( particleNormal, up );

	    pos.xyz = position.x * p.radius * right;
	    pos.xyz += position.y * p.radius * up;
		pos = lookAt * pos;
		pos += vec4(p.center, 1.0);
		output.position = matrixUniforms.projectionMatrix * (matrixUniforms.modelViewMatrix * pos);
	#endif
#endif
