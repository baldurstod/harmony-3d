#pragma once

/**
 * Calculate the true modulo. Always output a positive value
 * Similar to glsl mod(x, y)
 */
fn modulo_f32(x: f32, y: f32) -> f32 {
	return x - y * floor(x / y);
}

fn modulo_vec2f(x: vec2f, y: vec2f) -> vec2f {
	return x - y * floor(x / y);
}
