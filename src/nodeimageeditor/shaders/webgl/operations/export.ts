import { Shaders } from '../../../../shaders/shaders';

import applysticker_fs from './applysticker.fs';
import applysticker_vs from './applysticker.vs';
Shaders['applysticker.fs'] = applysticker_fs;
Shaders['applysticker.vs'] = applysticker_vs;

import combine_add_fs from './combine_add.fs';
import combine_add_vs from './combine_add.vs';
Shaders['combine_add.fs'] = combine_add_fs;
Shaders['combine_add.vs'] = combine_add_vs;

import combine_lerp_fs from './combine_lerp.fs';
import combine_lerp_vs from './combine_lerp.vs';
Shaders['combine_lerp.fs'] = combine_lerp_fs;
Shaders['combine_lerp.vs'] = combine_lerp_vs;

import drawcircle_fs from './drawcircle.fs';
import drawcircle_vs from './drawcircle.vs';
Shaders['drawcircle.fs'] = drawcircle_fs;
Shaders['drawcircle.vs'] = drawcircle_vs;

import multiply_fs from './multiply.fs';
import multiply_vs from './multiply.vs';
Shaders['multiply.fs'] = multiply_fs;
Shaders['multiply.vs'] = multiply_vs;

import select_fs from './select.fs';
import select_vs from './select.vs';
Shaders['select.fs'] = select_fs;
Shaders['select.vs'] = select_vs;

import texturelookup_fs from './texturelookup.fs';
import texturelookup_vs from './texturelookup.vs';
Shaders['texturelookup.fs'] = texturelookup_fs;
Shaders['texturelookup.vs'] = texturelookup_vs;
