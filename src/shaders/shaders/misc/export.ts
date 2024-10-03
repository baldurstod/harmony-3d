import { Shaders } from '../../shaders';

import grid_fs from './grid.fs';
import grid_vs from './grid.vs';
Shaders['grid.fs'] = grid_fs;
Shaders['grid.vs'] = grid_vs;

import line_fs from './line.fs';
import line_vs from './line.vs';
Shaders['line.fs'] = line_fs;
Shaders['line.vs'] = line_vs;

import skybox_fs from './skybox.fs';
import skybox_vs from './skybox.vs';
Shaders['skybox.fs'] = skybox_fs;
Shaders['skybox.vs'] = skybox_vs;
