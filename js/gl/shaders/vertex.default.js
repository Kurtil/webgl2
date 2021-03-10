const vertexShaderSource = `#version 300 es

in vec3 a_position;
in vec4 a_color;

uniform vec2 u_resolution;

uniform mat3 u_matrix;

out vec4 v_color;

void main() {
  // Multiply the position by the matrix.
  vec2 position = (u_matrix * vec3(a_position.xy, 1)).xy;

  // convert the position from pixels to 0.0 to 1.0
  vec2 zeroToOne = position / u_resolution;

  // convert from 0->1 to 0->2
  vec2 zeroToTwo = zeroToOne * 2.0;

  // convert from 0->2 to -1->+1 (clip space)
  vec2 clipSpace = zeroToTwo - 1.0;

  gl_Position = vec4(clipSpace * vec2(1, -1), (1000.0 - a_position.z) / 2000.0, 1); // z range of [-1000, 1000[ (higher is closer)

  v_color = a_color;
}
`;

export default vertexShaderSource;
