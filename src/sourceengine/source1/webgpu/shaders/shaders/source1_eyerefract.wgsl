#include matrix_uniforms
#include declare_texture_transform
#include declare_vertex_skinning

#include declare_camera_position
#include declare_fragment_standard
#include declare_fragment_color_map
#include declare_fragment_detail_map
#include declare_fragment_normal_map
#include declare_fragment_phong_exponent_map
#include declare_fragment_alpha_test
#include source1_declare_phong
#include source1_declare_selfillum

#include declare_lights
#include declare_log_depth

#define uBaseMapAlphaPhongMask 0//TODO: set proper uniform
const defaultNormalTexel: vec4f = vec4(0.5, 0.5, 1.0, 1.0);

@group(0) @binding(x) var<uniform> uEyeOrigin: vec3f;
@group(0) @binding(x) var<uniform> uIrisProjectionU: vec4f;
@group(0) @binding(x) var<uniform> uIrisProjectionV: vec4f;

@group(0) @binding(x) var corneaTexture: texture_2d<f32>;
@group(0) @binding(x) var corneaSampler: sampler;

/*#include varying_standard**/
/*
struct EyeRefractOut {
	stdOut: VertexOut,

	//vWorldPosition_ProjPosZ: vec4f,
	vTangentViewVector: vec3f,
	vWorldNormal: vec3f,
	vWorldTangent: vec3f,
	vWorldBinormal: vec3f,
}
*/

struct VertexOut {
	@builtin(position) position : vec4f,

	@location(y) vVertexPositionModelSpace: vec4f,
	@location(y) vVertexPositionWorldSpace: vec4f,
	@location(y) vVertexPositionCameraSpace: vec4f,

	@location(y) vVertexNormalModelSpace: vec4f,
	@location(y) vVertexNormalWorldSpace: vec3f,
	@location(y) vVertexNormalCameraSpace: vec3f,

	//@location(y) vVertexTangentModelSpace: vec4f,
	@location(y) vVertexTangentWorldSpace: vec3f,
	@location(y) vVertexTangentCameraSpace: vec3f,

	@location(y) vVertexBitangentWorldSpace: vec3f,
	@location(y) vVertexBitangentCameraSpace: vec3f,

	@location(y) vTextureCoord: vec4f,

	#ifdef USE_VERTEX_COLOR
		@location(y) vVertexColor: vec4f,
	#endif

	#ifdef WRITE_DEPTH_TO_COLOR
		@location(y) vPosition: vec4f,
	#endif
	#ifdef USE_LOG_DEPTH
		@location(y) vFragDepth: f32,
	#endif
	#ifdef USE_DETAIL_MAP
		@location(y) vDetailTextureCoord: vec4f,
	#endif

	@location(y) vWorldPosition_ProjPosZ: vec3f,
	@location(y) vTangentViewVector: vec3f,
	@location(y) vWorldNormal: vec3f,
	@location(y) vWorldTangent: vec3f,
	@location(y) vWorldBinormal: vec3f,
}


#define g_flEyeballRadius	5.51
#define g_flParallaxStrength 0.25

fn Vec3WorldToTangent( iWorldVector: vec3f, iWorldNormal: vec3f, iWorldTangent: vec3f, iWorldBinormal: vec3f ) -> vec3f
{
	var vTangentVector: vec3f;
	vTangentVector.x = dot( iWorldVector.xyz, iWorldTangent.xyz );
	vTangentVector.y = dot( iWorldVector.xyz, iWorldBinormal.xyz );
	vTangentVector.z = dot( iWorldVector.xyz, iWorldNormal.xyz );
	return vTangentVector; // Return without normalizing
}
fn Vec3WorldToTangentNormalized( iWorldVector: vec3f, iWorldNormal: vec3f, iWorldTangent: vec3f, iWorldBinormal: vec3f ) -> vec3f
{
	return normalize( Vec3WorldToTangent( iWorldVector, iWorldNormal, iWorldTangent, iWorldBinormal ) );
}

@vertex
fn vertex_main(
#include declare_vertex_standard_params
) -> VertexOut
{
	var output: VertexOut =  VertexOut();

	#include calculate_vertex_uv
	#include calculate_vertex
	#include calculate_vertex_skinning
	#include calculate_vertex_projection

/********************************************/
	output.vWorldPosition_ProjPosZ = vertexPositionWorldSpace.xyz;

	let cViewProj: mat4x4f = matrixUniforms.projectionMatrix * matrixUniforms.viewMatrix;
	let vProjPos: vec4f = cViewProj * vertexPositionWorldSpace;//mul( vec4( vertexPositionWorldSpace, 1.0 ), cViewProj );
	//o.projPos = vProjPos;
	//vProjPos.z = dot(vertexPositionWorldSpace, cViewProjZ );
	//o.vWorldPosition_ProjPosZ.w = vProjPos.z;

	let vEyeSocketUpVector: vec3f = normalize( -uIrisProjectionV.xyz );
	let vEyeSocketLeftVector: vec3f = normalize( -uIrisProjectionU.xyz );

	//vEyeSocketUpVector = -vec3(0.0, 1.0, 0.0);
	//vEyeSocketLeftVector = -vec3(0.0, 0.0, 1.0);

	output.vWorldNormal = normalize( vertexPositionWorldSpace.xyz - uEyeOrigin.xyz );
	output.vWorldTangent = normalize( cross( vEyeSocketUpVector.xyz, output.vWorldNormal.xyz ) );
	output.vWorldBinormal = normalize( cross( output.vWorldNormal.xyz, output.vWorldTangent.xyz ) );

	let vWorldViewVector:vec3f = normalize (vertexPositionWorldSpace.xyz - matrixUniforms.cameraPosition);
	output.vTangentViewVector = Vec3WorldToTangentNormalized(vWorldViewVector, output.vWorldNormal, output.vWorldTangent, output.vWorldBinormal);
	//vTangentViewVector.xyz = vWorldViewVector;
	//vTangentViewVector.xyz = vertexPositionWorldSpace.xyz;
	//vTangentViewVector.xyz = vWorldBinormal;

/********************************************/



	return output;
}

@fragment
fn fragment_main(fragInput: VertexOut) -> FragmentOutput
{
	var fragDepth: f32;
	var fragColor: vec4f;

	fragColor = vec4f(1.0);
	fragColor = vec4f(abs(fragInput.vTangentViewVector), 1.0);


	var diffuseColor: vec4f = vec4(1.0);
	//#include compute_fragment_color_map_mod1

	#ifdef USE_COLOR_MAP
		var texelColor: vec4f = textureSample(colorTexture, colorSampler, fragInput.vTextureCoord.xy);
		diffuseColor *= texelColor;
	#endif
	#include compute_fragment_alpha_test
		//texelColor.a = 1.0;
		//fragColor = texelColor;
#ifndef IS_TRANSLUCENT
	fragColor.a = 1.0;
#endif
	//fragColor = vec4(vTextureCoord/2.0, 0.0, 1.0);



/********************************************/
	//let vWorldPosition: vec3f = fragInput.vWorldPosition_ProjPosZ.xyz;
	var vCorneaUv: vec2f; // Note: Cornea texture is a cropped version of the iris texture
	vCorneaUv.x = dot( uIrisProjectionU, vec4( fragInput.vWorldPosition_ProjPosZ, 1.0 ) );
	vCorneaUv.y = dot( uIrisProjectionV, vec4( fragInput.vWorldPosition_ProjPosZ, 1.0 ) );
	let vSphereUv: vec2f = ( vCorneaUv.xy * 0.5 ) + 0.25;

	let corneaColor: vec4f = textureSample(corneaTexture, corneaSampler, vCorneaUv);
	let fIrisOffset: f32 = corneaColor.b;

	var vParallaxVector: vec2f = ( fragInput.vTangentViewVector.xy * fIrisOffset * g_flParallaxStrength ) / ( 1.0 - fragInput.vTangentViewVector.z ); // Note: 0.25 is a magic number
	vParallaxVector = ( fragInput.vTangentViewVector.xy* g_flParallaxStrength) / ( 1.0 - fragInput.vTangentViewVector.z );
	vParallaxVector.x = -vParallaxVector.x; //Need to flip x...not sure why.
	vParallaxVector = vec2(0.0);

	let vIrisUv: vec2f = vSphereUv.xy - vParallaxVector.xy;
#ifdef USE_COLOR_MAP
	var cIrisColor: vec4f = textureSample(colorTexture, colorSampler, vIrisUv);//tex2D( g_tIrisSampler, vIrisUv.xy );
#else
	var cIrisColor: vec4f = vec4(1.0);
#endif
	//cIrisColor = pow(cIrisColor, vec4(1./2.2));
	cIrisColor.a = 1.0;
	fragColor = cIrisColor;
/********************************************/
	#include compute_fragment_standard

#ifdef SKIP_PROJECTION
#ifdef USE_COLOR_MAP
	fragColor = texture2D(colorTexture, mod(vTextureCoord.xy, 1.0));
#else
	vec4 fragColor = vec4(1.0);
#endif
	fragColor.a = 1.;
#endif
	#include compute_fragment_render_mode




	#include output_fragment
}
