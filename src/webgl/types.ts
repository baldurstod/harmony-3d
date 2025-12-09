import { GL_FRAGMENT_SHADER, GL_VERTEX_SHADER } from './constants';

export enum ShaderType {
	Vertex = GL_VERTEX_SHADER,
	Fragment = GL_FRAGMENT_SHADER,
	Wgsl = 'wgsl',
}
