import { CubeTexture } from './textures/cubetexture';
import { Texture } from './textures/texture';

export type WebGLAnyRenderingContext = WebGLRenderingContext | WebGL2RenderingContext;

export type AnyTexture = Texture | CubeTexture;

export type JSONValue =
	| string
	| number
	| boolean
	| null
	| JSONValue[]
	| { [key: string]: JSONValue }

export interface JSONObject {
	[k: string]: JSONValue
}

export interface JSONArray extends Array<JSONValue> { }
