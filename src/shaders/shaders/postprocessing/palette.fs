export default `

#define USE_COLOR_MAP
#include declare_fragment_color_map

#include varying_standard

// short version of "random pixel sprites" by stb. https://shadertoy.com/view/3ttfzl ( 2371ch )
// Inspired by https://www.youtube.com/watch?v=8wOUe32Pt-E

// What power of 2 the pixel cell sizes are increased to
const int pixel_scale = 1;

// https://lospec.com/palette-list/oil-6
// Should be sorted in increasing order by perceived luminance for best results
// Can work with up to 256 distinct colors
/*const vec4[] palette = vec4[] (
vec4(32./255., 62./255., 62./255.,1.),
vec4(244./255., 114./255., 104./255., 1.),
vec4(245./255., 229./255., 193./255., 1.)
);*/

const vec4[] palette = vec4[] (
vec4(39./255., 39./255., 68./255., 1.),
vec4(73./255., 77./255., 126./255., 1.),
vec4(139./255., 109./255., 156./255.,1.),
vec4(198./255., 159./255., 165./255., 1.),
vec4(242./255., 211./255., 171./255., 1.),
vec4(251./255., 245./255., 239./255., 1.));

// Amount of colors in the palette
// Changing this is not recommended
const int colors = int(palette.length());

// How much the dither effect spreads. By default it is set to decrease as the amount of colors increases.
// Set to 0 to disable the dithering effect for flat color areas.
const float dither_spread = 1./float(colors);

// Precomputed threshold map for dithering
const mat4x4 threshold = mat4x4(0., 8., 2., 10.,
                                12., 4., 14., 6.,
                                3.,11.,1.,9.,
                                15.,7.,13., 5.);

// Chooses a color from the palette based on the current luminance
vec4 applyPalette(float lum)
{
    lum = floor(lum * float(colors));
    return palette[int(lum)];
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    // https://luka712.github.io/2018/07/01/Pixelate-it-Shadertoy-Unity/
    float pixelSizeX = 1.0 / uResolution.x;
    float pixelSizeY = 1.0 / uResolution.y;
    float cellSizeX = pow(2., float(pixel_scale)) * pixelSizeX;
    float cellSizeY = pow(2., float(pixel_scale)) * pixelSizeY;

    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = fragCoord/uResolution.xy;

    // Convert pixel coordinates to cell coordinates
    float u = cellSizeX * floor(uv.x / cellSizeX);
    float v = cellSizeY * floor(uv.y / cellSizeY);

    // get pixel information from the cell coordinates
    vec4 col = texture(colorMap, vec2(u,v));

    // https://en.wikipedia.org/wiki/Ordered_dithering
    int x = int(u / cellSizeX) % 4;
    int y = int(v / cellSizeY) % 4;
    col.r = col.r + (dither_spread * ((threshold[x][y]/16.) -.5));
    col.g = col.g + (dither_spread * ((threshold[x][y]/16.) -.5));
    col.b = col.b + (dither_spread * ((threshold[x][y]/16.) -.5));
    col.r = floor(col.r * float(colors-1) + .5)/float(colors-1);
    col.g = floor(col.g * float(colors-1) + .5)/float(colors-1);
    col.b = floor(col.b * float(colors-1) + .5)/float(colors-1);

    // Calculate luminance
    float lum = (0.299*col.r + 0.587*col.g + 0.114*col.b);

    // Apply the new color palette
    col = applyPalette(lum);

    // Output to screen
    fragColor = vec4(col);
    if (col.r <= 0.2) {
        //fragColor.a = 0.0;
    }
}

void main(void) {
	mainImage(gl_FragColor, gl_FragCoord.xy);
}
`;
