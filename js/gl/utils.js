function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  } else {
    gl.deleteShader(shader);
    throw new Error(gl.getShaderInfoLog(shader));
  }
}

function createProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  const success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  } else {
    gl.deleteProgram(program);
    throw new Error(gl.getProgramInfoLog(program));
  }
}

// All cases may not be handled : https://webgl2fundamentals.org/webgl/lessons/webgl-resizing-the-canvas.html
function resize(gl) {
  const canvas = gl.canvas;

  const dpr = window.devicePixelRatio;
  const displayWidth = Math.round(canvas.clientWidth * dpr);
  const displayHeight = Math.round(canvas.clientHeight * dpr);

  const needResize =
    canvas.width !== displayWidth || canvas.height !== displayHeight;

  if (needResize) {
    canvas.width = displayWidth;
    canvas.height = displayHeight;

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  }

  return needResize;
}

export { createShader, createProgram, resize };
