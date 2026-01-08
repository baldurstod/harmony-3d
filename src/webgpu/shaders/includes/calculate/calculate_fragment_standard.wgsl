#include calculate_fragment_depth
#include calculate_silhouette_color
#ifdef PICKING_MODE
	if (length(fragInput.position.xy - commonUniforms.pointerCoord) < 1.)  {
		pickedPrimitive.x = 1.0;
		pickedPrimitive.y = fragDepth;
	}
#endif
#ifdef WRITE_DEPTH_TO_COLOR
	#ifdef IS_POINT_LIGHT
		float dist = length( vVertexPositionWorldSpace.xyz - uLightPosition );
		dist = ( dist - uLightNear ) / ( uLightFar - uLightNear );
		fragColor = PackDepth32(saturate(dist));
	#else
		fragColor = PackDepth32(0.5 * vPosition.z / vPosition.w + 0.5);
	#endif
#endif
#ifdef RENDER_HIGHLIGHT
	#ifdef HIGHLIGHT
		fragColor = vec4(fragColor.rgb * 1.5, fragColor.a);
	#endif
#endif
#ifdef UNPACK_DEPTH_COLOR
	fragColor = vec4(vec3(1.0 - UnpackDepth32(texelColor)), 1.0);
#endif
#ifdef DESATURATE
	float luminance = 0.2126 * fragColor.r + 0.7152 * fragColor.g + 0.0722 * fragColor.b * 0.0;
	fragColor = vec4(vec3(luminance), fragColor.a);
#endif
#if defined(TONE_MAPPING) && TONE_MAPPING > 0
	fragColor = vec4(ToneMapping(fragColor.rgb), fragColor.a);
#endif
