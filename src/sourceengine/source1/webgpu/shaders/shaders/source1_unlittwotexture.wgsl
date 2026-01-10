#define USE_COLOR_2_MAP

#include matrix_uniforms
#include common_uniforms
#include declare_texture_transform
#include declare_vertex_skinning
#include source_declare_particle
#include source1_declare_gamma_functions

#include declare_fragment_standard
#include declare_fragment_diffuse
#include declare_fragment_color_map
#include declare_fragment_alpha_test

#include declare_lights
//#include declare_shadow_mapping
#include declare_log_depth

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
	@location(y) vTexture2Coord: vec4f,

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
	@location(y) vColor: vec4f,
}

@vertex
fn vertex_main(
	#include declare_vertex_standard_params
#ifdef HARDWARE_PARTICLES
	@location(x) particleId: f32,// TODO: use instance id instead ? //TODO: turn into u32
#endif
) -> VertexOut
{
#ifndef HAS_NORMALS
	// TODO: should we even have normals in this shader ?
	let normal: vec3f = vec3(1., 0., 0.);
#endif

	var output : VertexOut;
#ifdef HARDWARE_PARTICLES
	#define SOURCE1_PARTICLES
	#include source1_calculate_particle_position
	output.vColor = GammaToLinearVec4(p.color);
#else
	#ifdef USE_VERTEX_COLOR
		output.vColor = aVertexColor;
	#else
		output.vColor = vec4(1.0);
	#endif

	#include calculate_vertex_uv
	#include calculate_vertex_uv2
	#include calculate_vertex
	#include calculate_vertex_skinning
	#include calculate_vertex_projection
	#include calculate_vertex_color
	#include calculate_vertex_shadow_mapping
	#include calculate_vertex_standard
	#include calculate_vertex_log_depth
#endif

	return output;
}

@fragment
fn fragment_main(fragInput: VertexOut) -> FragmentOutput
{
	var fragColor: vec4f;
	var fragDepth: f32;

	#include calculate_fragment_color_map

	/*
	#include calculate_fragment_alpha_test
	fragColor = texelColor;
	fragColor = vec4(fragColor.rgb * uOverbrightFactor, fragColor.a);
	#ifdef ADD_SELF
		fragColor.a *= vColor.a;
		fragColor = vec4(fragColor.rgb * fragColor.a, fragColor.a);
		fragColor = vec4(fragColor.rgb + uOverbrightFactor * uAddSelf * vColor.a * fragColor.rgb, fragColor.a);
		fragColor = vec4(fragColor.rgb * vColor.rgb * vColor.a, fragColor.a);
	#else
		fragColor *= fragInput.vColor;
	#endif
	*/
	fragColor = texelColor * texelColor.a * texel2Color * texel2Color.a;

	#include calculate_fragment_standard
	#include output_fragment
}
