import { Shaders } from '../../../../shaders/shaders';

import source1_refract_fs from './source1_refract.fs';
import source1_refract_vs from './source1_refract.vs';
Shaders['source1_refract.fs'] = source1_refract_fs;
Shaders['source1_refract.vs'] = source1_refract_vs;

import source1_vertexlitgeneric_fs from './source1_vertexlitgeneric.fs';
import source1_vertexlitgeneric_vs from './source1_vertexlitgeneric.vs';
Shaders['source1_vertexlitgeneric.fs'] = source1_vertexlitgeneric_fs;
Shaders['source1_vertexlitgeneric.vs'] = source1_vertexlitgeneric_vs;
