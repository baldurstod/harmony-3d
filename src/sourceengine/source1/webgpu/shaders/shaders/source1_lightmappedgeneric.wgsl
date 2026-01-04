#include matrix_uniforms
#include declare_texture_transform
//#include declare_shadow_mapping

#include declare_fragment_standard
#include declare_fragment_color_map
#include declare_lights
const defaultNormalTexel: vec4f = vec4(0.5, 0.5, 1.0, 1.0);

#include varying_standard

@vertex
fn vertex_main(
#include declare_vertex_standard_params
) -> VertexOut
{
	var output : VertexOut;

	#include calculate_vertex_uv
	#include calculate_vertex
	#include calculate_vertex_skinning
	#include calculate_vertex_projection
	#include calculate_vertex_shadow_mapping
	#include calculate_vertex_standard

	return output;
}


@fragment
fn fragment_main(fragInput: VertexOut) -> FragmentOutput
{
	var fragDepth: f32;
	var fragColor: vec4f;

	let diffuseColor: vec4f = vec4(1.0);

	let lightmapColor1: vec3f = vec3(1.0, 1.0, 1.0);
	let lightmapColor2: vec3f = vec3(1.0, 1.0, 1.0);
	let lightmapColor3: vec3f = vec3(1.0, 1.0, 1.0);
	let diffuseLighting: vec3f = vec3(1.0);

	#include calculate_fragment_color_map
	#include calculate_fragment_normal_map
	#include calculate_fragment_alpha_test

	#include calculate_fragment_normal

	let albedo: vec3f = texelColor.rgb;

	#ifdef USE_SSBUMP
		let tangentSpaceNormal: vec3f = texelNormal.xyz;

		diffuseLighting = texelNormal.x * lightmapColor1 +
						  texelNormal.y * lightmapColor2 +
						  texelNormal.z * lightmapColor3;
	#else
		#ifdef USE_NORMAL_MAP
			let tangentSpaceNormal: vec3f = 2.0 * texelNormal.xyz - 1.0;
		#else
			let tangentSpaceNormal: vec3f = 2.0 * defaultNormalTexel.xyz - 1.0;
		#endif
	#endif

	fragmentNormalCameraSpace = normalize(TBNMatrixCameraSpace * tangentSpaceNormal);
	#include calculate_lights_setup_vars
	var material: BlinnPhongMaterial;
	material.diffuseColor = texelColor.rgb * diffuseLighting;
	material.specularColor = vec3(1.0);//specular;
	material.specularShininess = 5.0;//shininess;
	material.specularStrength = 1.0;//specularStrength;

	#include calculate_fragment_lights

	/*gl_FragColor = textureColor;*/
	fragColor.a = 1.0;
#ifdef USE_PHONG_SHADING
	fragColor = vec4((reflectedLight.directSpecular + reflectedLight.directDiffuse + reflectedLight.indirectDiffuse), fragColor.a);
#else
	fragColor = vec4((reflectedLight.directDiffuse + reflectedLight.indirectDiffuse * 0.0/*TODO*/), fragColor.a);
#endif


#ifdef SKIP_LIGHTING
	fragColor = vec4(albedo, fragColor.a);
#endif


	#include output_fragment
}
