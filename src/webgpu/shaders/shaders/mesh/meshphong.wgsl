#include matrix_uniforms
#include declare_texture_transform
#include declare_vertex_skinning

#include declare_fragment_diffuse
#include declare_fragment_color_map
#include declare_fragment_alpha_test

#include declare_lights
//#include declare_shadow_mapping
#include declare_log_depth

/*struct VertexOut {
	@builtin(position) position : vec4f,
}
*/
#include varying_standard

@vertex
fn vertex_main(
	@location(0) position: vec3f,
	@location(1) normal: vec3f,
	@location(2) texcoord: vec2f,
) -> VertexOut
{
	var output : VertexOut;
	//output.position = uniforms.projectionMatrix * uniforms.viewMatrix * uniforms.modelMatrix * vec4<f32>(position, 1.0);
	//output.position = vec4<f32>(position.x, position.y, position.z, 1.0);

	#include calculate_vertex_uv
	#include calculate_vertex
	#include calculate_vertex_skinning
	#include calculate_vertex_projection
	#include calculate_vertex_color
	#include calculate_vertex_shadow_mapping
	#include calculate_vertex_standard
	#include calculate_vertex_log_depth
	output.position = uniforms.projectionMatrix * uniforms.viewMatrix * uniforms.modelMatrix * vec4<f32>(position, 1.0);

	return output;
}

@fragment
fn fragment_main(fragInput: VertexOut) -> @location(0) vec4f
{
	#include calculate_fragment_diffuse
	#include calculate_fragment_color_map
#ifdef USE_COLOR_MAP
	diffuseColor *= texelColor;
#endif
	#include calculate_fragment_alpha_test
	#include calculate_fragment_normal

	/* TEST SHADING BEGIN*/
	#include calculate_lights_setup_vars


	var fragColor: vec4f;

	var material = BlinnPhongMaterial();
	material.diffuseColor = diffuseColor.rgb;//vec3(1.0);//diffuseColor.rgb;
	material.specularColor = vec3(1.0);//specular;
	material.specularShininess = 5.0;//shininess;
	material.specularStrength = 1.0;//specularStrength;

#include calculate_fragment_lights

/* TEST SHADING END*/

#include calculate_fragment_render_mode
/* TEST SHADING BEGIN*/
fragColor = vec4f((reflectedLight.directSpecular + reflectedLight.directDiffuse + reflectedLight.indirectDiffuse), diffuseColor.a);
//fragColor.a = diffuseColor.a;
/* TEST SHADING END*/


	#ifdef SKIP_LIGHTING
		fragColor = diffuseColor;
	#else
		fragColor = vec4f((reflectedLight.directSpecular + reflectedLight.directDiffuse + reflectedLight.indirectDiffuse), diffuseColor.a);
	#endif
	//fragColor.a = diffuseColor.a;


	#include calculate_fragment_standard
	#include calculate_fragment_log_depth



	return vec4f( normalize(fragInput.position.xyz), fragColor.a);
	return vec4f(ambientLight, fragColor.a);
	//return fragData.color;
	//return vec4<f32>(1.0, 1.0, 1.0, 1.0);
	return fragColor;
}
