import { Includes } from '../../../shaders/includes';

import declare_fragment_color_map from './declare_fragment_color_map.glsl';
Includes['declare_fragment_color_map'] = declare_fragment_color_map;

import declare_fragment_diffuse from './declare_fragment_diffuse.glsl';
Includes['declare_fragment_diffuse'] = declare_fragment_diffuse;

import declare_fragment_standard from './declare_fragment_standard.glsl';
Includes['declare_fragment_standard'] = declare_fragment_standard;

import declare_fragment_tone_mapping from './declare_fragment_tone_mapping.glsl';
Includes['declare_fragment_tone_mapping'] = declare_fragment_tone_mapping;

import declare_fragment_uniforms from './declare_fragment_uniforms.glsl';
Includes['declare_fragment_uniforms'] = declare_fragment_uniforms;
