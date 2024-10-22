import { Shaders } from '../../shaders';

import copy_fs from './copy.fs';
import copy_vs from './copy.vs';
Shaders['copy.fs'] = copy_fs;
Shaders['copy.vs'] = copy_vs;

import crosshatch_fs from './crosshatch.fs';
import crosshatch_vs from './crosshatch.vs';
Shaders['crosshatch.fs'] = crosshatch_fs;
Shaders['crosshatch.vs'] = crosshatch_vs;
