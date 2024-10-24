import { Shaders } from '../../shaders';

import fullscreenquad_fs from './fullscreenquad.fs';
import fullscreenquad_vs from './fullscreenquad.vs';
Shaders['fullscreenquad.fs'] = fullscreenquad_fs;
Shaders['fullscreenquad.vs'] = fullscreenquad_vs;

import grid_fs from './grid.fs';
import grid_vs from './grid.vs';
Shaders['grid.fs'] = grid_fs;
Shaders['grid.vs'] = grid_vs;

import line_fs from './line.fs';
import line_vs from './line.vs';
Shaders['line.fs'] = line_fs;
Shaders['line.vs'] = line_vs;

import shadertoy_fs from './shadertoy.fs';
import shadertoy_vs from './shadertoy.vs';
Shaders['shadertoy.fs'] = shadertoy_fs;
Shaders['shadertoy.vs'] = shadertoy_vs;

import skybox_fs from './skybox.fs';
import skybox_vs from './skybox.vs';
Shaders['skybox.fs'] = skybox_fs;
Shaders['skybox.vs'] = skybox_vs;
