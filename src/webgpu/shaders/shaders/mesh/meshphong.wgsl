#include matrix_uniforms
#include declare_texture_transform
#include declare_vertex_skinning

#include declare_fragment_diffuse
#include declare_fragment_color_map
#include declare_fragment_alpha_test

//#include declare_lights
//#include declare_shadow_mapping
#include declare_log_depth

/*struct VertexOut {
	@builtin(position) position : vec4f,
}
*/
#include varying_standard

@vertex
fn vertex_main(@location(0) position: vec3f) -> VertexOut
{
	var output : VertexOut;
	output.position = uniforms.projectionMatrix * uniforms.viewMatrix * uniforms.modelMatrix * vec4<f32>(position, 1.0);
	//output.position = vec4<f32>(position.x, position.y, position.z, 1.0);
	return output;
}

@fragment
fn fragment_main(fragInput: VertexOut) -> @location(0) vec4f
{
	#include compute_fragment_diffuse
	#include compute_fragment_color_map
#ifdef USE_COLOR_MAP
	diffuseColor *= texelColor;
#endif
	#include compute_fragment_alpha_test
	#include compute_fragment_normal

	/* TEST SHADING BEGIN*/
	#include compute_lights_setup_vars



	const material = BlinnPhongMaterial();
	material.diffuseColor = diffuseColor.rgb;//vec3(1.0);//diffuseColor.rgb;
	material.specularColor = vec3(1.0);//specular;
	material.specularShininess = 5.0;//shininess;
	material.specularStrength = 1.0;//specularStrength;

#include compute_fragment_lights

/* TEST SHADING END*/

#include compute_fragment_render_mode
/* TEST SHADING BEGIN*/
gl_FragColor.rgb = (reflectedLight.directSpecular + reflectedLight.directDiffuse + reflectedLight.indirectDiffuse);
gl_FragColor.a = diffuseColor.a;
/* TEST SHADING END*/


	#ifdef SKIP_LIGHTING
		gl_FragColor.rgb = diffuseColor.rgb;
	#else
		gl_FragColor.rgb = (reflectedLight.directSpecular + reflectedLight.directDiffuse + reflectedLight.indirectDiffuse);
	#endif
	gl_FragColor.a = diffuseColor.a;


	#include compute_fragment_standard
	#include compute_fragment_log_depth



	//return fragData.color;
	return vec4<f32>(1.0, 1.0, 1.0, 1.0);
}
