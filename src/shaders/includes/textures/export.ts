import { Includes } from '../../../shaders/includes';

import sample_color_texture from './sample_color_texture.glsl';
Includes['sample_color_texture'] = sample_color_texture;

import sample_cube_uv_mapping from './sample_cube_uv_mapping.glsl';
Includes['sample_cube_uv_mapping'] = sample_cube_uv_mapping;
