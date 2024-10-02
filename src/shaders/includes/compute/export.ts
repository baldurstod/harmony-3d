import { Includes } from '../../../shaders/includes';

import compute_fragment_diffuse from './compute_fragment_diffuse.glsl';
Includes['compute_fragment_diffuse'] = compute_fragment_diffuse;

import compute_silhouette_color from './compute_silhouette_color.glsl';
Includes['compute_silhouette_color'] = compute_silhouette_color;

import compute_vertex_color from './compute_vertex_color.glsl';
Includes['compute_vertex_color'] = compute_vertex_color;
