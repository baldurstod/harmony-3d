import { vec2, vec3, vec4 } from 'gl-matrix';
import { clamp } from '../../../math/functions';
import { TWO_PI } from '../../../math/constants';

/**
 * Source2 common file block
 */
export class Source2FileBlock {
	file;
	type;
	offset;
	length;
	indices;
	vertices;
	keyValue;
	constructor(file, type, offset, length) {
		this.file = file;
		this.type = type;
		this.offset = offset;
		this.length = length;
	}

	getKeyValue(path) {
		let keyValue = this.keyValue;
		if (keyValue) {
			return keyValue.getValue(path);
		}
		return null;
	}

	getIndices(bufferId) {
		let indexBuffer = this.indices[bufferId];
		return indexBuffer ? indexBuffer.indices : [];
	}

	getVertices(bufferId) {
		let vertexBuffer = this.vertices[bufferId];
		return vertexBuffer ? vertexBuffer.vertices : [];
	}

	getNormalsTangents(bufferId) {
			function DecompressNormal(inputNormal, outputNormal)	{				// {nX, nY, nZ}//_DecompressUByte4Normal
				const fOne			= 1.0;
				//let outputNormal = vec3.create();

				//float2 ztSigns		= ( inputNormal.xy - 128.0 ) < 0;				// sign bits for zs and binormal (1 or 0)  set-less-than (slt) asm instruction
				const ztSigns		= vec2.fromValues(Number(( inputNormal[0] - 128.0 ) < 0),Number(( inputNormal[1] - 128.0 ) < 0));				// sign bits for zs and binormal (1 or 0)  set-less-than (slt) asm instruction
				//float2 xyAbs		= abs( inputNormal.xy - 128.0 ) - ztSigns;		// 0..127
				const xyAbs		= vec2.fromValues(Math.abs( inputNormal[0] - 128.0 ) - ztSigns[0], Math.abs( inputNormal[1] - 128.0 ) - ztSigns[1]);		// 0..127
				//float2 xySigns		= ( xyAbs -  64.0 ) < 0;						// sign bits for xs and ys (1 or 0)
				const xySigns		= vec2.fromValues(Number(( xyAbs[0] -  64.0 ) < 0), Number(( xyAbs[1] -  64.0 ) < 0));						// sign bits for xs and ys (1 or 0)
				//outputNormal.xy		= ( abs( xyAbs - 64.0 ) - xySigns ) / 63.0;	// abs({nX, nY})
				outputNormal[0]		= ( Math.abs( xyAbs[0] - 64.0 ) - xySigns[0] ) / 63.0;	// abs({nX, nY})
				outputNormal[1]		= ( Math.abs( xyAbs[1] - 64.0 ) - xySigns[1] ) / 63.0;	// abs({nX, nY})

				//outputNormal.z		= 1.0 - outputNormal.x - outputNormal.y;		// Project onto x+y+z=1
				outputNormal[2]		= 1.0 - outputNormal[0] - outputNormal[1];		// Project onto x+y+z=1
				//outputNormal.xyz	= normalize( outputNormal.xyz );				// Normalize onto unit sphere
				vec3.normalize(outputNormal, outputNormal);

				//outputNormal.xy	   *= lerp( fOne.xx, -fOne.xx, xySigns   );			// Restore x and y signs
				//outputNormal.z	   *= lerp( fOne.x,  -fOne.x,  ztSigns.x );			// Restore z sign
				outputNormal[0] *= (1 - xySigns[0]) - xySigns[0];
				outputNormal[1] *= (1 - xySigns[1]) - xySigns[1];
				return vec3.normalize(outputNormal, outputNormal);
			}
		function DecompressTangent(compressedTangent, outputTangent) {
			DecompressNormal(compressedTangent, outputTangent);
			var tSign = compressedTangent[1] - 128.0 < 0 ? -1.0 : 1.0;
			outputTangent[3] = tSign;
		}

			function DecompressNormal2(inputNormal) {
				let normals;
				let tangents;

				const SignBit = inputNormal & 1;            // LSB bit
				const Tbits = (inputNormal >> 1) & 0x7ff;  // 11 bits
				const Xbits = (inputNormal >> 12) & 0x3ff; // 10 bits
				const Ybits = (inputNormal >> 22) & 0x3ff; // 10 bits

				// Unpack from 0..1 to -1..1
				const nPackedFrameX = (Xbits / 1023.0) * 2.0 - 1.0;
				const nPackedFrameY = (Ybits / 1023.0) * 2.0 - 1.0;

				// Z is never given a sign, meaning negative values are caused by abs(packedframexy) adding up to over 1.0
				const derivedNormalZ = 1.0 - Math.abs(nPackedFrameX) - Math.abs(nPackedFrameY); // Project onto x+y+z=1
				const unpackedNormal = vec3.fromValues(nPackedFrameX, nPackedFrameY, derivedNormalZ);

				// If Z is negative, X and Y has had extra amounts (TODO: find the logic behind this value) added into them so they would add up to over 1.0
				// Thus, we take the negative components of Z and add them back into XY to get the correct original values.
				const negativeZCompensation = clamp(-derivedNormalZ, 0.0, 1.0); // Isolate the negative 0..1 range of derived Z

				const unpackedNormalXPositive = unpackedNormal[0] >= 0.0 ? 1.0 : 0.0;
				const unpackedNormalYPositive = unpackedNormal[1] >= 0.0 ? 1.0 : 0.0;

				unpackedNormal[0] += negativeZCompensation * (1 - unpackedNormalXPositive) + -negativeZCompensation * unpackedNormalXPositive; // mix() - x×(1−a)+y×a
				unpackedNormal[1] += negativeZCompensation * (1 - unpackedNormalYPositive) + -negativeZCompensation * unpackedNormalYPositive;

				let normal = vec3.normalize(unpackedNormal, unpackedNormal); // Get final normal by normalizing it onto the unit sphere
				normals = normal;

				// Invert tangent when normal Z is negative
				let tangentSign = (normal[2] >= 0.0) ? 1.0 : -1.0;
				// equal to tangentSign * (1.0 + abs(normal.z))
				let rcpTangentZ = 1.0 / (tangentSign + normal[2]);

				// Be careful of rearranging ops here, could lead to differences in float precision, especially when dealing with compressed data.
				const unalignedTangent = vec3.create();

				// Unoptimized (but clean) form:
				// tangent.X = -(normal.x * normal.x) / (tangentSign + normal.z) + 1.0
				// tangent.Y = -(normal.x * normal.y) / (tangentSign + normal.z)
				// tangent.Z = -(normal.x)
				unalignedTangent[0] = -tangentSign * (normal[0] * normal[0]) * rcpTangentZ + 1.0;
				unalignedTangent[1] = -tangentSign * ((normal[0] * normal[1]) * rcpTangentZ);
				unalignedTangent[2] = -tangentSign * normal[0];

				// This establishes a single direction on the tangent plane that derived from only the normal (has no texcoord info).
				// But it doesn't line up with the texcoords. For that, it uses nPackedFrameT, which is the rotation.

				// Angle to use to rotate tangent
				var nPackedFrameT = Tbits / 2047.0 * TWO_PI;

				// Rotate tangent to the correct angle that aligns with texcoords.
				//let tangent = unalignedTangent * Math.cos(nPackedFrameT) + Vector3.Cross(normal, unalignedTangent) * Math.sin(nPackedFrameT);
				let tangent = vec3.scale(vec3.create(), unalignedTangent, Math.cos(nPackedFrameT));
				const c = vec3.cross(vec3.create(), normal, unalignedTangent);
				vec3.scale(c, c, Math.sin(nPackedFrameT));
				vec3.add(tangent, tangent, c);

				tangents = vec4.fromValues(tangent[0], tangent[1], tangent[2], (SignBit == 0) ? -1.0 : 1.0); // Bitangent sign bit... inverted (0 = negative
				return [normals, tangents];
			}

		let vertexBuffer = this.vertices[bufferId];
		let normals = new Float32Array(vertexBuffer.normals);
		var normalArray = [];
		var tangentArray = [];
		const compressedNormal = vec2.create();
		const compressedTangent = vec2.create();
		let normalVec3;
		let normalTemp = vec3.create();
		let tangentTemp = vec3.create();

		for (var i = 0, l = normals.length; i < l; i+=4) {

			if (!vertexBuffer.decompressTangentV2) {
				compressedNormal[0] = normals[i + 0] * 255.0;
				compressedNormal[1] = normals[i + 1] * 255.0;
				compressedTangent[0] = normals[i + 2] * 255.0;
				compressedTangent[1] = normals[i + 3] * 255.0;
				DecompressNormal(compressedNormal, normalTemp);
				DecompressTangent(compressedTangent, tangentTemp);
			} else {
				[normalTemp, tangentTemp] = DecompressNormal2(normals[i]);
			}
			normalArray.push(normalTemp[0]);
			normalArray.push(normalTemp[1]);
			normalArray.push(normalTemp[2]);

			tangentArray.push(tangentTemp[0]);
			tangentArray.push(tangentTemp[1]);
			tangentArray.push(tangentTemp[2]);
			tangentArray.push(1.0);
		}
		return [normalArray, tangentArray];
	}

	getCoords(bufferId) {
		let vertexBuffer = this.vertices[bufferId];
		return vertexBuffer ? vertexBuffer.coords : [];
	}
	getNormal(bufferId) {
		let vertexBuffer = this.vertices[bufferId];
		return vertexBuffer ? vertexBuffer.normals : [];
	}
	getTangent(bufferId) {
		let vertexBuffer = this.vertices[bufferId];
		return vertexBuffer ? vertexBuffer.tangents : [];
	}
	getBoneIndices(bufferId) {
		let vertexBuffer = this.vertices[bufferId];
		return vertexBuffer ? vertexBuffer.boneIndices : [];
	}
	getBoneWeight(bufferId) {
		let vertexBuffer = this.vertices[bufferId];
		return vertexBuffer ? vertexBuffer.boneWeight : [];
	}
}
