import { Includes } from '../../../../shaders/includes';

import compute_vertex_uv from './compute_vertex_uv.glsl';
Includes['compute_vertex_uv'] = compute_vertex_uv;

import compute_vertex from './compute_vertex.glsl';
Includes['compute_vertex'] = compute_vertex;
