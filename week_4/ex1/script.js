var gl;
var program;
var points = [];

window.onload = function init() {
  var canvas = document.getElementById("gl-canvas");
  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) {
    alert("WebGL isn't available");
  }

  // Define vertices for the unit cube
  var vertices = [
    vec4(-0.5, -0.5, 0.5, 1),  // A
    vec4(0.5, -0.5, 0.5, 1),  // B
    vec4(0.5, 0.5, 0.5, 1),  // C
    vec4(-0.5, 0.5, 0.5, 1),  // D
    vec4(-0.5, -0.5, -0.5, 1),  // E
    vec4(0.5, -0.5, -0.5, 1),  // F
    vec4(0.5, 0.5, -0.5, 1),  // G
    vec4(-0.5, 0.5, -0.5, 1)   // H
  ];

  // Define edges by connecting vertices
  var edges = [
    vertices[0], vertices[1],
    vertices[1], vertices[2],
    vertices[2], vertices[3],
    vertices[3], vertices[0],
    vertices[4], vertices[5],
    vertices[5], vertices[6],
    vertices[6], vertices[7],
    vertices[7], vertices[4],
    vertices[0], vertices[4],
    vertices[1], vertices[5],
    vertices[2], vertices[6],
    vertices[3], vertices[7]
  ];

  // Load shaders and initialize attribute buffers
  program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  // Create a buffer for the cube's edges
  var bufferId = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(edges), gl.STATIC_DRAW);

  // Associate our shader variables with our data buffer
  var vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  // Set the projection matrix (orthographic in this case)
  var projectionMatrix = ortho(-1, 1, -1, 1, -1, 10);
  var projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
  gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
  console.log(projectionMatrix);

  // Set the model-view matrix for isometric view
  var modelViewMatrix = lookAt(vec3(0.5, 0.5, 1.), vec3(0., 0., 0.), vec3(0., 1., 0.));
  console.log(modelViewMatrix);
  var modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

  // Clear the canvas and draw the wireframe cube
  gl.clearColor(0., 0., 0., 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT); 
  gl.drawArrays(gl.LINES, 0, edges.length);

};
