import { Includes } from '../../../shaders/includes';

import compute_fragment_cube_map from './compute_fragment_cube_map.glsl';
Includes['compute_fragment_cube_map'] = compute_fragment_cube_map;

import compute_fragment_detail_map from './compute_fragment_detail_map.glsl';
Includes['compute_fragment_detail_map'] = compute_fragment_detail_map;

import compute_fragment_diffuse from './compute_fragment_diffuse.glsl';
Includes['compute_fragment_diffuse'] = compute_fragment_diffuse;

import compute_fragment_normal_map from './compute_fragment_normal_map.glsl';
Includes['compute_fragment_normal_map'] = compute_fragment_normal_map;

import compute_fragment_normal_world_space from './compute_fragment_normal_world_space.glsl';
Includes['compute_fragment_normal_world_space'] = compute_fragment_normal_world_space;

import compute_pbr from './compute_pbr.glsl';
Includes['compute_pbr'] = compute_pbr;

import compute_silhouette_color from './compute_silhouette_color.glsl';
Includes['compute_silhouette_color'] = compute_silhouette_color;

import compute_vertex_color from './compute_vertex_color.glsl';
Includes['compute_vertex_color'] = compute_vertex_color;

import compute_vertex_detail_uv from './compute_vertex_detail_uv.glsl';
Includes['compute_vertex_detail_uv'] = compute_vertex_detail_uv;
