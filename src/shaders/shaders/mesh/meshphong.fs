export default `
#include declare_fragment_diffuse
#include declare_fragment_color_map
#include declare_fragment_alpha_test

#include declare_lights
#include declare_shadow_mapping
#include declare_log_depth

#include varying_standard

void main(void) {
	#include compute_fragment_diffuse
	#include compute_fragment_color_map
#ifdef USE_COLOR_MAP
	diffuseColor *= texelColor;
#endif
	#include compute_fragment_alpha_test
	#include compute_fragment_normal

/* TEST SHADING BEGIN*/
	#include compute_lights_setup_vars



	BlinnPhongMaterial material;
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
}
`;
