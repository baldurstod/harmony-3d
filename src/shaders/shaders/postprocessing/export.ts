import { Shaders } from '../../shaders';

import copy_fs from './copy.fs';
import copy_vs from './copy.vs';
Shaders['copy.fs'] = copy_fs;
Shaders['copy.vs'] = copy_vs;

import crosshatch_fs from './crosshatch.fs';
import crosshatch_vs from './crosshatch.vs';
Shaders['crosshatch.fs'] = crosshatch_fs;
Shaders['crosshatch.vs'] = crosshatch_vs;

import grain_fs from './grain.fs';
import grain_vs from './grain.vs';
Shaders['grain.fs'] = grain_fs;
Shaders['grain.vs'] = grain_vs;

import oldmovie_fs from './oldmovie.fs';
import oldmovie_vs from './oldmovie.vs';
Shaders['oldmovie.fs'] = oldmovie_fs;
Shaders['oldmovie.vs'] = oldmovie_vs;
