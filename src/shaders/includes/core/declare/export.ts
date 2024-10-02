import { Includes } from '../../../../shaders/includes';

import declare_matrix_uniforms from './declare_matrix_uniforms.glsl';
Includes['declare_matrix_uniforms'] = declare_matrix_uniforms;

import declare_vertex_skinning from './declare_vertex_skinning.glsl';
Includes['declare_vertex_skinning'] = declare_vertex_skinning;

import declare_vertex_uv from './declare_vertex_uv.glsl';
Includes['declare_vertex_uv'] = declare_vertex_uv;
