const __DEBUG__ = false;
const __WARN__ = false;
const __INFO__ = false;
const __LOG__ = false;
const __ERROR__ = false;
const __VERBOSE__ = false;
const __USE_STATS__ = false;
const __MEASURE_PERFORMANCE__ = false;
const __TESTING__ = false;
const __DISABLE_WEBGL2__ = false;
const __ENABLE_S3TC__ = true;
const __ENABLE_GET_ERROR__ = false;

export const DEBUG = __DEBUG__;
export const WARN = __WARN__;
export const INFO = __INFO__;
export const LOG = __LOG__;
export const ERROR = __ERROR__;
export const VERBOSE = __VERBOSE__;
export const USE_STATS = __USE_STATS__;

export const MEASURE_PERFORMANCE = __MEASURE_PERFORMANCE__;

export const TESTING = __TESTING__;// Don't use in production

export const DISABLE_WEBGL2 = __DISABLE_WEBGL2__;// Set to true to force webgl1
export const ENABLE_S3TC = __ENABLE_S3TC__;// Set to false to force decompression DXT1/3/5 using webassembly

export const ENABLE_GET_ERROR = __ENABLE_GET_ERROR__;// Set to true to call getError() after each GL call
