import { Shaders } from '../../shaders';

import meshbasic_fs from './meshbasic.fs';
import meshbasic_vs from './meshbasic.vs';
Shaders['meshbasic.fs'] = meshbasic_fs;
Shaders['meshbasic.vs'] = meshbasic_vs;

import meshphong_fs from './meshphong.fs';
import meshphong_vs from './meshphong.vs';
Shaders['meshphong.fs'] = meshphong_fs;
Shaders['meshphong.vs'] = meshphong_vs;
