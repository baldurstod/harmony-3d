import { Includes } from '../../../../shaders/includes';

import compute_vertex_projection from './compute_vertex_projection.glsl';
Includes['compute_vertex_projection'] = compute_vertex_projection;

import compute_vertex_shadow_mapping from './compute_vertex_shadow_mapping.glsl';
Includes['compute_vertex_shadow_mapping'] = compute_vertex_shadow_mapping;

import compute_vertex_skinning from './compute_vertex_skinning.glsl';
Includes['compute_vertex_skinning'] = compute_vertex_skinning;

import compute_vertex_uv from './compute_vertex_uv.glsl';
Includes['compute_vertex_uv'] = compute_vertex_uv;

import compute_vertex from './compute_vertex.glsl';
Includes['compute_vertex'] = compute_vertex;
