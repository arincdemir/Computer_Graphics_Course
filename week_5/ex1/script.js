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
  gl.vBuffer = null;
  //gl.bindBuffer(gl.ARRAY_BUFFER, gl.vBuffer);
  //gl.bufferData(gl.ARRAY_BUFFER, flatten(edges), gl.STATIC_DRAW);
  initSphere();

  // Associate our shader variables with our data buffer
  var vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  // Set the projection matrix (perspective in this case)
  var projectionMatrix = perspective(45, 1, 0.1, 10);
  var projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
  gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

  // Set the model-view matrix for 1 point view
  //var modelViewMatrix = lookAt(vec3(0, 0, 0), vec3(0., 0., 0.), vec3(0., 1., 0.));
  var modelViewMatrix = translate(0, 0, -4);
  var modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

  // Clear the canvas and draw the wireframe cube
  gl.clearColor(0., 0., 0., 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT); 
  gl.drawArrays(gl.LINES, 0, edges.length);


  initSphere();

};


function initSphere() {
  var va = vec4(0.0, 0.0, -1.0, 1);
  var vb = vec4(0.0, 0.942809, 0.333333, 1);
  var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
  var vd = vec4(0.816497, -0.471405, 0.333333, 1);
  var points = tetrahedron(va, vb, vc, vd, 1);

  gl.deleteBuffer(gl.vBuffer);
  gl.vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
  //console.log(flatten(points));
}

function tetrahedron(a, b, c, d, n) {
  var points = [];
  divideTriangle(points, a, b, c, n);
  divideTriangle(points, d, c, b, n);
  divideTriangle(points, a, d, b, n);
  divideTriangle(points, a, c, d, n);
  return points;
}

function divideTriangle(points, a, b, c, n) {
  if(n == 0) {
    points.push(a, b, b, c, c, a);
  }
  else {
    var ab = normalize(mix(a, b, 0.5), true);
    var ac = normalize(mix(a, c, 0.5), true);
    var bc = normalize(mix(b, c, 0.5), true);
    --n;
    divideTriangle(points, a, ab, ac, n);
    divideTriangle(points, ab, b, bc, n);
    divideTriangle(points, bc, c, ac, n);
    divideTriangle(points, ab, bc, ac, n);
  }

}