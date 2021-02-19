import { createShader, createProgram, resize } from "./utils.js";
import vertexShaderSource from "./shaders/vertex.default.js";
import fragmentShaderSource from "./shaders/fragment.default.js";

import { Matrix } from "../../../node_modules/@pixi/math/dist/esm/math.js";

const Context = {
  make(gl) {
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(
      gl,
      gl.FRAGMENT_SHADER,
      fragmentShaderSource
    );

    const program = createProgram(gl, vertexShader, fragmentShader);

    const positionAttributeLocation = gl.getAttribLocation(
      program,
      "a_position"
    );

    const resolutionUniformLocation = gl.getUniformLocation(
      program,
      "u_resolution"
    );
    const colorLocation = gl.getUniformLocation(program, "u_color");

    const matrixLocation = gl.getUniformLocation(program, "u_matrix");

    const positionBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    const positions = [10, 20, 380, 20, 10, 30, 10, 30, 380, 20, 380, 30];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const vao = gl.createVertexArray();

    gl.bindVertexArray(vao);

    gl.enableVertexAttribArray(positionAttributeLocation);

    const size = 2; // 2 components per iteration
    const type = gl.FLOAT; // the data is 32bit floats
    const normalize = false; // don't normalize the data
    const stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
    const offset = 0; // start at the beginning of the buffer
    gl.vertexAttribPointer(
      positionAttributeLocation,
      size,
      type,
      normalize,
      stride,
      offset
    ); // WARNING : it binds the current ARRAY_BUFFER to the attribute.

    return {
      drawScene(transform = Matrix.IDENTITY) {
        resize(gl);

        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.useProgram(program);

        gl.uniform2f(
          resolutionUniformLocation,
          gl.canvas.width / devicePixelRatio,
          gl.canvas.height / devicePixelRatio
        );
        gl.uniform4f(
          colorLocation,
          Math.random(),
          Math.random(),
          Math.random(),
          1
        );

        // Ex of PIXI.Matrix [1, 0, 184, 0, 1, 224, 0, 0, 1]
        // | a | c | tx|
        // | b | d | ty|
        // | 0 | 0 | 1 |
        const transformArray = new Float32Array([
          transform.a,
          transform.b,
          0,
          transform.c,
          transform.d,
          0,
          transform.tx,
          transform.ty,
          1,
        ]);

        gl.uniformMatrix3fv(matrixLocation, false, transformArray);

        gl.bindVertexArray(vao);

        const primitiveType = gl.TRIANGLES;
        const offset = 0;
        const count = 6;
        gl.drawArrays(primitiveType, offset, count);
      },
    };
  },
};

export default Context;
