import { createShader, createProgram, resize } from "./utils.js";
import vertexShaderSource from "./shaders/vertex.default.js";
import fragmentShaderSource from "./shaders/fragment.default.js";

import { Matrix } from "../../../node_modules/@pixi/math/dist/esm/math.js";

// TODO use Uniform Buffer Objects
// TODO use (and understand :P) VAO - see https://webgl2fundamentals.org/webgl/lessons/webgl1-to-webgl2.html#Vertex-Array-Objects

const Context = {
  /**
   * @param { Viewer } viewer
   */
  make(viewer) {
    /** @type { WebGL2RenderingContext } */
    const gl = viewer.canvas.getContext("webgl2");
    if (!gl) {
      throw new Error(
        "Need WebGL 2 context to run properly. Please consider using a compatible browser."
      );
    }

    viewer.gl = gl;

    gl.enable(gl.DEPTH_TEST);

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

    const colorAttributeLocation = gl.getAttribLocation(program, "a_color");

    const resolutionUniformLocation = gl.getUniformLocation(
      program,
      "u_resolution"
    );
    // const colorLocation = gl.getUniformLocation(program, "u_color");

    const matrixLocation = gl.getUniformLocation(program, "u_matrix");

    const vao = gl.createVertexArray();

    let vertexBuffer = null;

    function updateVertexData({ dataView, count }) {
      this.count = count;

      if (vertexBuffer) {
        gl.deleteBuffer(vertexBuffer);
      }
      vertexBuffer = gl.createBuffer();

      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

      gl.bufferData(gl.ARRAY_BUFFER, dataView, gl.STATIC_DRAW);

      gl.bindVertexArray(vao);

      gl.enableVertexAttribArray(positionAttributeLocation);

      const size = 3; // 2 components per iteration
      const type = gl.FLOAT; // the data is 32bit floats
      const normalize = false; // don't normalize the data
      const stride =
        size * Float32Array.BYTES_PER_ELEMENT + // 0 = move forward size * sizeof(type) each iteration to get the next position
        4 * Uint8ClampedArray.BYTES_PER_ELEMENT; // the color information
      const offset = 0; // start at the beginning of the buffer

      gl.vertexAttribPointer(
        positionAttributeLocation,
        size,
        type,
        normalize,
        stride,
        offset
      ); // WARNING : it binds the current ARRAY_BUFFER to the attribute.

      gl.enableVertexAttribArray(colorAttributeLocation);
      gl.vertexAttribPointer(
        colorAttributeLocation,
        4,
        gl.UNSIGNED_BYTE,
        true,
        stride,
        3 * Float32Array.BYTES_PER_ELEMENT
      );
    }

    return {
      count: 0,
      updateVertexData,
      drawScene(transform = Matrix.IDENTITY) {
        resize(gl);

        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.clear(gl.DEPTH_BUFFER_BIT);

        if (this.count === 0) return;

        gl.useProgram(program);

        gl.uniform2f(
          resolutionUniformLocation,
          gl.canvas.width / devicePixelRatio,
          gl.canvas.height / devicePixelRatio
        );
        // gl.uniform4f(
        //   colorLocation,
        //   Math.random(),
        //   Math.random(),
        //   Math.random(),
        //   1
        // );

        // Ex of PIXI.Matrix [1, 0, 184, 0, 1, 224, 0, 0, 1]
        // | a | c | tx|
        // | b | d | ty|
        // | 0 | 0 | 1 |
        // const transformArray = new Float32Array([
        //   transform.a,
        //   transform.b,
        //   0,
        //   transform.c,
        //   transform.d,
        //   0,
        //   transform.tx,
        //   transform.ty,
        //   1,
        // ]);

        gl.uniformMatrix3fv(matrixLocation, false, transform.toArray(true));

        gl.bindVertexArray(vao);

        const primitiveType = gl.TRIANGLES;
        const offset = 0;
        gl.drawArrays(primitiveType, offset, this.count);
      },
    };
  },
};

export default Context;
