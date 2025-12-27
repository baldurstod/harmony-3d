#ifdef HARDWARE_SKINNING
	#ifdef SKELETAL_MESH

		@group(0) @binding(3) var<uniform> boneMatrix: array<mat4x4f, MAX_HARDWARE_BONES>;

		fn accumulateSkinMat(boneWeights: vec3f, boneIndices: vec3<u32>) -> mat4x4f {
			var result: mat4x4f;
			result =		boneWeights.x * boneMatrix[boneIndices.x];
			result = result + boneWeights.y * boneMatrix[boneIndices.y];
			result = result + boneWeights.z * boneMatrix[boneIndices.z];
			return result;
		}
	#endif
#endif
