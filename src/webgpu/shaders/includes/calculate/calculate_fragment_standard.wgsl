#include calculate_fragment_depth
#include calculate_silhouette_color
#ifdef PICKING_MODE
	gl_FragColor = vec4(uPickingColor, 1.0);
#endif
#ifdef WRITE_DEPTH_TO_COLOR
	#ifdef IS_POINT_LIGHT
		float dist = length( vVertexPositionWorldSpace.xyz - uLightPosition );
		dist = ( dist - uLightNear ) / ( uLightFar - uLightNear );
		gl_FragColor = PackDepth32(saturate(dist));
	#else
		gl_FragColor = PackDepth32(0.5 * vPosition.z / vPosition.w + 0.5);
	#endif
#endif
#ifdef RENDER_HIGHLIGHT
	#ifdef HIGHLIGHT
		gl_FragColor.rgb *= 1.5;
	#endif
#endif
#ifdef UNPACK_DEPTH_COLOR
	gl_FragColor = vec4(vec3(1.0 - UnpackDepth32(texelColor)), 1.0);
#endif
#ifdef DESATURATE
	float luminance = 0.2126 * gl_FragColor.r + 0.7152 * gl_FragColor.g + 0.0722 * gl_FragColor.b * 0.0;
	gl_FragColor = vec4(vec3(luminance), gl_FragColor.a);
#endif
#if defined(TONE_MAPPING) && TONE_MAPPING > 0
	gl_FragColor.rgb = ToneMapping(gl_FragColor.rgb);
#endif
