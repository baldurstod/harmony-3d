//See https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Constants
export const GL_NONE = 0;
export const GL_ZERO = 0;
export const GL_ONE = 1;


export const GL_FALSE = 0;
export const GL_TRUE = 1;

/* ErrorCode */
export const GL_NO_ERROR = 0;
export const GL_INVALID_ENUM = 0x0500;
export const GL_INVALID_VALUE = 0x0501;
export const GL_INVALID_OPERATION = 0x0502;
export const GL_STACK_OVERFLOW = 0x0503;
export const GL_STACK_UNDERFLOW = 0x0504;
export const GL_OUT_OF_MEMORY = 0x0505;

//Shaders
export const GL_FRAGMENT_SHADER = 0x8B30;
export const GL_VERTEX_SHADER = 0x8B31;

//clear
export const GL_DEPTH_BUFFER_BIT = 0x00000100;
export const GL_STENCIL_BUFFER_BIT = 0x00000400;
export const GL_COLOR_BUFFER_BIT = 0x00004000;

export const GL_RED = 0x1903;
export const GL_GREEN = 0x1904;
export const GL_BLUE = 0x1905;
export const GL_ALPHA = 0x1906;
export const GL_RGB = 0x1907;
export const GL_RGBA = 0x1908;
export const GL_LUMINANCE = 0x1909;
export const GL_LUMINANCE_ALPHA = 0x190A;
export const GL_R8 = 0x8229;
export const GL_R8_SNORM = 0x8F94;
export const GL_RGBA32F = 0x8814;
export const GL_RGB32F = 0x8815;
export const GL_RGBA16F = 0x881A;

// drawArrays mode
export const GL_POINTS = 0x0000;
export const GL_LINES = 0x0001;
export const GL_LINE_LOOP = 0x0002;
export const GL_LINE_STRIP = 0x0003;
export const GL_TRIANGLES = 0x0004;
export const GL_TRIANGLE_STRIP = 0x0005;
export const GL_TRIANGLE_FAN = 0x0006;

//bufferData usage
export const GL_STREAM_DRAW = 0x88E0;
export const GL_STREAM_READ = 0x88E1;
export const GL_STREAM_COPY = 0x88E2;
export const GL_STATIC_DRAW = 0x88E4;
export const GL_STATIC_READ = 0x88E5;
export const GL_STATIC_COPY = 0x88E6;
export const GL_DYNAMIC_DRAW = 0x88E8;
export const GL_DYNAMIC_READ = 0x88E9;
export const GL_DYNAMIC_COPY = 0x88EA;

//bindBuffer target
export const GL_ARRAY_BUFFER = 0x8892;
export const GL_ELEMENT_ARRAY_BUFFER = 0x8893;
export const GL_COPY_READ_BUFFER = 0x8F36;
export const GL_COPY_WRITE_BUFFER = 0x8F37;
export const GL_TRANSFORM_FEEDBACK_BUFFER = 0x8C8E;
export const GL_UNIFORM_BUFFER = 0x8A11;
export const GL_PIXEL_PACK_BUFFER = 0x88EB;
export const GL_PIXEL_UNPACK_BUFFER = 0x88EC;

//buffer type / uniform type
export const GL_BYTE = 0x1400;
export const GL_UNSIGNED_BYTE = 0x1401;
export const GL_SHORT = 0x1402;
export const GL_UNSIGNED_SHORT = 0x1403;
export const GL_INT = 0x1404;
export const GL_UNSIGNED_INT = 0x1405;
export const GL_FLOAT = 0x1406;
export const GL_HALF_FLOAT = 0x140B;
export const GL_FLOAT_VEC2 = 0x8B50;
export const GL_FLOAT_VEC3 = 0x8B51;
export const GL_FLOAT_VEC4 = 0x8B52;
export const GL_INT_VEC2 = 0x8B53;
export const GL_INT_VEC3 = 0x8B54;
export const GL_INT_VEC4 = 0x8B55;
export const GL_BOOL = 0x8B56;
export const GL_BOOL_VEC2 = 0x8B57;
export const GL_BOOL_VEC3 = 0x8B58;
export const GL_BOOL_VEC4 = 0x8B59;
export const GL_FLOAT_MAT2 = 0x8B5A;
export const GL_FLOAT_MAT3 = 0x8B5B;
export const GL_FLOAT_MAT4 = 0x8B5C;
export const GL_SAMPLER_2D = 0x8B5E;
export const GL_SAMPLER_CUBE = 0x8B60;
export const GL_UNSIGNED_INT_VEC2 = 0x8DC6;
export const GL_UNSIGNED_INT_VEC3 = 0x8DC7;
export const GL_UNSIGNED_INT_VEC4 = 0x8DC8;
export const GL_UNSIGNED_INT_24_8 = 0x84FA;
export const GL_FLOAT_MAT2x3 = 0x8B65;
export const GL_FLOAT_MAT2x4 = 0x8B66;
export const GL_FLOAT_MAT3x2 = 0x8B67;
export const GL_FLOAT_MAT3x4 = 0x8B68;
export const GL_FLOAT_MAT4x2 = 0x8B69;
export const GL_FLOAT_MAT4x3 = 0x8B6A;
export const GL_SAMPLER_3D = 0x8B5F;
export const GL_SAMPLER_2D_SHADOW = 0x8B62;
export const GL_SAMPLER_2D_ARRAY = 0x8DC1;
export const GL_SAMPLER_2D_ARRAY_SHADOW = 0x8DC4;
export const GL_SAMPLER_CUBE_SHADOW = 0x8DC5;
export const GL_INT_SAMPLER_2D = 0x8DCA;
export const GL_INT_SAMPLER_3D = 0x8DCB;
export const GL_INT_SAMPLER_CUBE = 0x8DCC;
export const GL_INT_SAMPLER_2D_ARRAY = 0x8DCF;
export const GL_UNSIGNED_INT_SAMPLER_2D = 0x8DD2;
export const GL_UNSIGNED_INT_SAMPLER_3D = 0x8DD3;
export const GL_UNSIGNED_INT_SAMPLER_CUBE = 0x8DD4;
export const GL_UNSIGNED_INT_SAMPLER_2D_ARRAY = 0x8DD7;

export const GL_UNSIGNED_SHORT_4_4_4_4 = 0x8033;
export const GL_UNSIGNED_SHORT_5_5_5_1 = 0x8034;
export const GL_UNSIGNED_SHORT_5_6_5 = 0x8363;
export const GL_UNSIGNED_INT_2_10_10_10_REV = 0x8368;
export const GL_UNSIGNED_INT_10F_11F_11F_REV = 0x8C3B;
export const GL_UNSIGNED_INT_5_9_9_9_REV = 0x8C3E;
export const GL_FLOAT_32_UNSIGNED_INT_24_8_REV = 0x8DAD;

// Extensions
export const GL_HALF_FLOAT_OES = 0x8D61;

//get parameters
export const GL_MAX_VERTEX_ATTRIBS = 0x8869;

//depthFunc
export const GL_NEVER = 0x0200;
export const GL_LESS = 0x0201;
export const GL_EQUAL = 0x0202;
export const GL_LEQUAL = 0x0203;
export const GL_GREATER = 0x0204;
export const GL_NOTEQUAL = 0x0205;
export const GL_GEQUAL = 0x0206;
export const GL_ALWAYS = 0x0207;

//enable
export const GL_BLEND = 0x0BE2;
export const GL_CULL_FACE = 0x0B44;
export const GL_DEPTH_TEST = 0x0B71;
export const GL_DITHER = 0x0BD0;
export const GL_POLYGON_OFFSET_FILL = 0x8037;
export const GL_SAMPLE_ALPHA_TO_COVERAGE = 0x809E;
export const GL_SAMPLE_COVERAGE = 0x80A0;
export const GL_SCISSOR_TEST = 0x0C11;
export const GL_STENCIL_TEST = 0x0B90;
export const GL_RASTERIZER_DISCARD = 0x8C89;

//textures
export const GL_TEXTURE0 = 0x84C0;//GL_RENDERING_CONTEXT.TEXTURE0;

//Framebuffers and renderbuffers
export const GL_MAX_RENDERBUFFER_SIZE = 0x84E8;

//texture targets
export const GL_TEXTURE_2D = 0x0DE1;
export const GL_TEXTURE_CUBE_MAP = 0x8513;
export const GL_TEXTURE_3D = 0x806F;
export const GL_TEXTURE_2D_ARRAY = 0x8C1A;

export const GL_TEXTURE_CUBE_MAP_POSITIVE_X = 0x8515;
export const GL_TEXTURE_CUBE_MAP_NEGATIVE_X = 0x8516;
export const GL_TEXTURE_CUBE_MAP_POSITIVE_Y = 0x8517;
export const GL_TEXTURE_CUBE_MAP_NEGATIVE_Y = 0x8518;
export const GL_TEXTURE_CUBE_MAP_POSITIVE_Z = 0x8519;
export const GL_TEXTURE_CUBE_MAP_NEGATIVE_Z = 0x851A;

//texParameter
export const GL_TEXTURE_MAG_FILTER = 0x2800;
export const GL_TEXTURE_MIN_FILTER = 0x2801;
export const GL_TEXTURE_WRAP_S = 0x2802;
export const GL_TEXTURE_WRAP_T = 0x2803;
//export const GL_TEXTURE_MAX_ANISOTROPY_EXT = GL_RENDERING_CONTEXT.TEXTURE_MAX_ANISOTROPY_EXT;//TODO
export const GL_TEXTURE_BASE_LEVEL = 0x813C;
export const GL_TEXTURE_COMPARE_FUNC = 0x884D;
export const GL_TEXTURE_COMPARE_MODE = 0x884C;
export const GL_TEXTURE_MAX_LEVEL = 0x813D;
export const GL_TEXTURE_MAX_LOD = 0x813B;
export const GL_TEXTURE_MIN_LOD = 0x813A;
export const GL_TEXTURE_WRAP_R = 0x8072;


//texture filter
export const GL_NEAREST = 0x2600;
export const GL_LINEAR = 0x2601;
export const GL_NEAREST_MIPMAP_NEAREST = 0x2700;
export const GL_LINEAR_MIPMAP_NEAREST = 0x2701;
export const GL_NEAREST_MIPMAP_LINEAR = 0x2702;
export const GL_LINEAR_MIPMAP_LINEAR = 0x2703;

// texture wrap
export const GL_REPEAT = 0x2901;
export const GL_CLAMP_TO_EDGE = 0x812F;
export const GL_MIRRORED_REPEAT = 0x8370;

//TEXTURE_MAX_ANISOTROPY_EXT //TODO EXT_texture_filter_anisotropic

//pixelStorei
export const GL_UNPACK_FLIP_Y_WEBGL = 0x9240;
export const GL_UNPACK_PREMULTIPLY_ALPHA_WEBGL = 0x9241;
export const GL_UNPACK_COLORSPACE_CONVERSION_WEBGL = 0x9243;

//blendFunc
export const GL_SRC_COLOR = 0x0300;
export const GL_ONE_MINUS_SRC_COLOR = 0x0301;
export const GL_DST_COLOR = 0x0306;
export const GL_ONE_MINUS_DST_COLOR = 0x0307;
export const GL_SRC_ALPHA = 0x0302;
export const GL_ONE_MINUS_SRC_ALPHA = 0x0303;
export const GL_DST_ALPHA = 0x0304;
export const GL_ONE_MINUS_DST_ALPHA = 0x0305;
export const GL_CONSTANT_COLOR = 0x8001;
export const GL_ONE_MINUS_CONSTANT_COLOR = 0x8002;
export const GL_CONSTANT_ALPHA = 0x8003;
export const GL_ONE_MINUS_CONSTANT_ALPHA = 0x8004;
export const GL_SRC_ALPHA_SATURATE = 0x0308;

//blendEquation
export const GL_FUNC_ADD = 0x8006;//GL_RENDERING_CONTEXT.GL_FUNC_ADD;
export const GL_FUNC_SUBTRACT = 0x800A;//GL_RENDERING_CONTEXT.FUNC_SUBTRACT;
export const GL_FUNC_REVERSE_SUBTRACT = 0x800B;//GL_RENDERING_CONTEXT.FUNC_REVERSE_SUBTRACT;
export const GL_MIN_EXT = 0x8007;//GL_RENDERING_CONTEXT.MIN_EXT;//TODOv3 EXT_blend_minmax
export const GL_MAX_EXT = 0x8008;//GL_RENDERING_CONTEXT.MAX_EXT;//TODOv3 EXT_blend_minmax
export const GL_MIN = 0x8007;//GL_RENDERING_CONTEXT.MIN;
export const GL_MAX = 0x8008;//GL_RENDERING_CONTEXT.MAX;

//cullFace
export const GL_FRONT = 0x0404;
export const GL_BACK = 0x0405;
export const GL_FRONT_AND_BACK = 0x0408;

//frontFace
export const GL_CW = 0x0900;
export const GL_CCW = 0x0901;

export const GL_RGB4 = 0x804F;
export const GL_RGB5 = 0x8050;
export const GL_RGB8 = 0x8051;
export const GL_RGB10 = 0x8052;
export const GL_RGB12 = 0x8053;
export const GL_RGB16 = 0x8054;
export const GL_RGBA2 = 0x8055;
export const GL_RGBA4 = 0x8056;
export const GL_RGB5_A1 = 0x8057;
export const GL_RGBA8 = 0x8058;
export const GL_RGB10_A2 = 0x8059;
export const GL_RGBA12 = 0x805A;
export const GL_RGBA16 = 0x805B;
export const GL_RGBA32UI = 0x8D70;
export const GL_VERTEX_ARRAY = 0x8074;

export const GL_DEPTH_COMPONENT = 0x1902;
export const GL_DEPTH_COMPONENT16 = 0x81A5;
export const GL_DEPTH_COMPONENT24 = 0x81A6;
export const GL_DEPTH_COMPONENT32 = 0x81A7;
export const DEPTH_STENCIL = 0x84F9;

export const FRAMEBUFFER_ATTACHMENT_COLOR_ENCODING = 0x8210;

export const GL_SRGB = 0x8C40;
export const GL_SRGB8 = 0x8C41;
export const GL_SRGB_ALPHA = 0x8C42;
export const GL_SRGB8_ALPHA8 = 0x8C43;

// drawBuffers
export const GL_MAX_COLOR_ATTACHMENTS = 0x8CDF;
export const GL_COLOR_ATTACHMENT0 = 0x8CE0;
export const GL_COLOR_ATTACHMENT1 = 0x8CE1;
export const GL_COLOR_ATTACHMENT2 = 0x8CE2;
export const GL_COLOR_ATTACHMENT3 = 0x8CE3;
export const GL_COLOR_ATTACHMENT4 = 0x8CE4;
export const GL_COLOR_ATTACHMENT5 = 0x8CE5;
export const GL_COLOR_ATTACHMENT6 = 0x8CE6;
export const GL_COLOR_ATTACHMENT7 = 0x8CE7;
export const GL_COLOR_ATTACHMENT8 = 0x8CE8;
export const GL_COLOR_ATTACHMENT9 = 0x8CE9;
export const GL_COLOR_ATTACHMENT10 = 0x8CEA;
export const GL_COLOR_ATTACHMENT11 = 0x8CEB;
export const GL_COLOR_ATTACHMENT12 = 0x8CEC;
export const GL_COLOR_ATTACHMENT13 = 0x8CED;
export const GL_COLOR_ATTACHMENT14 = 0x8CEE;
export const GL_COLOR_ATTACHMENT15 = 0x8CEF;
export const GL_COLOR_ATTACHMENT16 = 0x8CF0;
export const GL_COLOR_ATTACHMENT17 = 0x8CF1;
export const GL_COLOR_ATTACHMENT18 = 0x8CF2;
export const GL_COLOR_ATTACHMENT19 = 0x8CF3;
export const GL_COLOR_ATTACHMENT20 = 0x8CF4;
export const GL_COLOR_ATTACHMENT21 = 0x8CF5;
export const GL_COLOR_ATTACHMENT22 = 0x8CF6;
export const GL_COLOR_ATTACHMENT23 = 0x8CF7;
export const GL_COLOR_ATTACHMENT24 = 0x8CF8;
export const GL_COLOR_ATTACHMENT25 = 0x8CF9;
export const GL_COLOR_ATTACHMENT26 = 0x8CFA;
export const GL_COLOR_ATTACHMENT27 = 0x8CFB;
export const GL_COLOR_ATTACHMENT28 = 0x8CFC;
export const GL_COLOR_ATTACHMENT29 = 0x8CFD;
export const GL_COLOR_ATTACHMENT30 = 0x8CFE;
export const GL_COLOR_ATTACHMENT31 = 0x8CFF;
export const GL_DEPTH_ATTACHMENT = 0x8D00;
export const GL_STENCIL_ATTACHMENT = 0x8D20;

// bindFramebuffer
export const GL_FRAMEBUFFER = 0x8D40;
export const GL_RENDERBUFFER = 0x8D41;
export const GL_READ_FRAMEBUFFER = 0x8CA8;
export const GL_DRAW_FRAMEBUFFER = 0x8CA9;

//export const GL_ = GL_RENDERING_CONTEXT.;
