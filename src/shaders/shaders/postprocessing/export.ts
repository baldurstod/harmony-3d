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

import palette_fs from './palette.fs';
import palette_vs from './palette.vs';
Shaders['palette.fs'] = palette_fs;
Shaders['palette.vs'] = palette_vs;

import pixelate_fs from './pixelate.fs';
import pixelate_vs from './pixelate.vs';
Shaders['pixelate.fs'] = pixelate_fs;
Shaders['pixelate.vs'] = pixelate_vs;

import saturate_fs from './saturate.fs';
import saturate_vs from './saturate.vs';
Shaders['saturate.fs'] = saturate_fs;
Shaders['saturate.vs'] = saturate_vs;

import sketch_fs from './sketch.fs';
import sketch_vs from './sketch.vs';
Shaders['sketch.fs'] = sketch_fs;
Shaders['sketch.vs'] = sketch_vs;
