export default `
#ifdef HARDWARE_SKINNING
	#ifdef SKELETAL_MESH
		uniform sampler2D uBoneMatrix;

		mat4 getBoneMat(int boneId) {
			mat4 result = mat4(0.0);
			float texelPos = float(boneId) / float(MAX_HARDWARE_BONES);
			result[0] = texture2D(uBoneMatrix, vec2(0.00, texelPos));
			result[1] = texture2D(uBoneMatrix, vec2(0.25, texelPos));
			result[2] = texture2D(uBoneMatrix, vec2(0.50, texelPos));
			result[3] = texture2D(uBoneMatrix, vec2(0.75, texelPos));
			return result;
		}

		mat4 accumulateSkinMat() {
			mat4 result;
			result =		aBoneWeight.x * getBoneMat(int(aBoneIndices.x));
			result = result + aBoneWeight.y * getBoneMat(int(aBoneIndices.y));
			result = result + aBoneWeight.z * getBoneMat(int(aBoneIndices.z));
			return result;
		}
	#endif
#endif
`;
