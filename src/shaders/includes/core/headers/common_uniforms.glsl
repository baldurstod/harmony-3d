export default `
uniform vec4 uTime;
#define TIME uTime.x
#define FRAME uTime.y
uniform vec4 uResolution;
uniform int uWireframeLines;
#ifdef PICKING_MODE
	uniform vec3 uPickingColor;
#endif
`;
