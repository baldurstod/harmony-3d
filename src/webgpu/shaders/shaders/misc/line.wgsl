#include matrix_uniforms
#include common_uniforms

//@group(0) @binding(x) var<uniform> resolution : vec4f;
@group(0) @binding(x) var<uniform> linewidth : f32;

#ifdef USE_DASH
	@group(0) @binding(x) var<uniform> dashScale : f32;
	attribute float instanceDistanceStart;
	attribute float instanceDistanceEnd;
#endif

fn trimSegment( start: vec4f, end: vec4f ) -> vec4f {

	// trim end segment so it terminates between the camera plane and the near plane

	// conservative estimate of the near plane
	let a: f32 = matrixUniforms.projectionMatrix[ 2 ][ 2 ]; // 3nd entry in 3th column
	let b: f32 = matrixUniforms.projectionMatrix[ 3 ][ 2 ]; // 3nd entry in 4th column
	let nearEstimate: f32 = - 0.5 * b / a;

	let alpha: f32 = ( nearEstimate - start.z ) / ( end.z - start.z );

	return vec4f(mix( start.xyz, end.xyz, alpha ), end.a);
}



#include declare_texture_transform
#include declare_vertex_skinning

#include declare_fragment_standard
#include declare_fragment_diffuse
#include declare_fragment_color_map
#include declare_fragment_alpha_test

#include declare_lights
//#include declare_shadow_mapping
#include declare_log_depth

struct VertexOut {
	@builtin(position) position : vec4f,
	@location(0) vUv: vec2f,
#ifdef USE_DASH
	@location(1) vLineDistance: f32,
#endif
}

@vertex
fn vertex_main(
	@location(0) position: vec3f,
	@location(1) texCoord: vec2f,
	@location(2) segmentStart: vec3f,
	@location(3) segmentEnd: vec3f,
#ifdef USE_COLOR
	@location(4) instanceColorStart: vec3f,
	@location(5) instanceColorEnd: vec3f,
#endif
#ifdef USE_DASH
	@location(6) instanceDistanceStart: vec3f,
	@location(7) instanceDistanceEnd: vec3f,
#endif
) -> VertexOut
{
	var output : VertexOut;

#ifdef USE_COLOR
	vColor.xyz = ( position.y < 0.5 ) ? instanceColorStart : instanceColorEnd;
#endif

#ifdef USE_DASH
	output.vLineDistance = ( position.y < 0.5 ) ? dashScale * instanceDistanceStart : dashScale * instanceDistanceEnd;
#endif

	let aspect: f32 = commonUniforms.resolution.x / commonUniforms.resolution.y;
	output.vUv = texCoord;

	// camera space
	var start: vec4f = matrixUniforms.modelViewMatrix * vec4( segmentStart, 1.0 );
	var end: vec4f = matrixUniforms.modelViewMatrix * vec4( segmentEnd, 1.0 );

	// special case for perspective projection, and segments that terminate either in, or behind, the camera plane
	// clearly the gpu firmware has a way of addressing this issue when projecting into ndc space
	// but we need to perform ndc-space calculations in the shader, so we must address this issue directly
	// perhaps there is a more elegant solution -- WestLangley

	let perspective: bool = ( matrixUniforms.projectionMatrix[ 2 ][ 3 ] == - 1.0 ); // 4th entry in the 3rd column

	if ( perspective ) {
		if ( start.z < 0.0 && end.z >= 0.0 ) {
			end = trimSegment( start, end );
		} else if ( end.z < 0.0 && start.z >= 0.0 ) {
			start = trimSegment( end, start );
		}
	}

	// clip space
	let clipStart: vec4f = matrixUniforms.projectionMatrix * start;
	let clipEnd: vec4f = matrixUniforms.projectionMatrix * end;

	// ndc space
	let ndcStart: vec2f = clipStart.xy / clipStart.w;
	let ndcEnd: vec2f = clipEnd.xy / clipEnd.w;

	// direction
	var dir: vec2f = ndcEnd - ndcStart;

	// account for clip-space aspect ratio
	dir.x *= aspect;
	dir = normalize( dir );

	// perpendicular to dir
	var offset: vec2f = vec2( dir.y, - dir.x );

	// undo aspect ratio adjustment
	dir.x /= aspect;
	offset.x /= aspect;

	// sign flip
	if ( position.x < 0.0 ) {
		offset *= - 1.0;
	}

	// endcaps
	if ( position.y < 0.0 ) {
		offset += - dir;
	} else if ( position.y > 1.0 ) {
		offset += dir;
	}

	// adjust for linewidth
	offset *= linewidth;

	// adjust for clip-space to screen-space conversion // maybe resolution should be based on viewport ...
	offset /= commonUniforms.resolution.y;

	// select end
	var clip: vec4f = select(clipEnd, clipStart, position.y < 0.5);//( position.y < 0.5 ) ? clipStart : clipEnd;

	// back to clip space
	offset *= clip.w;

	clip.x += offset.x;
	clip.y += offset.y;

	output.position = clip;

	return output;
}

@fragment
fn fragment_main(fragInput: VertexOut) -> FragmentOutput
{
	var fragDepth: f32;
	var fragColor: vec4f;

	#include calculate_fragment_diffuse
#ifdef USE_DASH
	if ( fragInput.vUv.y < - 1.0 || fragInput.vUv.y > 1.0 ) {
		discard; // discard endcaps
	}
	if ( mod( vLineDistance, dashSize + gapSize ) > dashSize ) {
		discard; // todo - FIX
	}
#endif

	if ( abs( fragInput.vUv.y ) > 1.0 ) {
		let a: f32 = fragInput.vUv.x;
		let b: f32 = select(fragInput.vUv.y + 1.0, fragInput.vUv.y - 1.0, fragInput.vUv.y > 0.0);//( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
		let len2: f32 = a * a + b * b;
		if ( len2 > 1.0 ) {
			discard;
		}
	}
	fragColor = vec4( diffuseColor.rgb, diffuseColor.a );

	#include calculate_fragment_standard
	#include output_fragment
}
