import { Includes } from '../../../shaders/includes';

import declare_fragment_color_map from './declare_fragment_color_map.glsl';
Includes['declare_fragment_color_map'] = declare_fragment_color_map;

import declare_fragment_diffuse from './declare_fragment_diffuse.glsl';
Includes['declare_fragment_diffuse'] = declare_fragment_diffuse;
