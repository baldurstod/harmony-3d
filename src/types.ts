import { CubeTexture } from './textures/cubetexture';
import { Texture } from './textures/texture';

export type WebGLAnyRenderingContext = WebGLRenderingContext | WebGL2RenderingContext;

export type AnyTexture = Texture | CubeTexture;
