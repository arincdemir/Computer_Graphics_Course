var gl;
var program;
var points = [];
var normalsArray = [];

var numTimesToSubdivide = 3;

var materialAmbient = vec4(1.0, 1.0, 1.0, 1.0);
var materialDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var materialSpecular = vec4(1.0, 1.0, 1.0, 1.0);
var materialShininess = 100.0;

var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
var lightDiffuse = vec4(0.2, 0.2, 0.2, 1.0);
var lightSpecular = vec4(0.2, 0.2, 0.2, 1.0);
var lightPosition = vec4(0.0, 0.0, -1.0, 1.0);

window.onload = function init() {
  var canvas = document.getElementById("gl-canvas");
  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) {
    alert("WebGL isn't available");
  }

  gl.enable(gl.CULL_FACE);
  gl.enable(gl.DEPTH_TEST);

  // Add event listener for buttons
  document.getElementById("increase").addEventListener("click", function () {
    numTimesToSubdivide++;
    render();
  });

  document.getElementById("decrease").addEventListener("click", function () {
    if (numTimesToSubdivide > 0) {
      numTimesToSubdivide--;
      render();
    }
  });

  setInterval(render, 100);

};

function render() {
  ambientProduct = mult(lightAmbient, materialAmbient);
  diffuseProduct = mult(lightDiffuse, materialDiffuse);
  specularProduct = mult(lightSpecular, materialSpecular);

  // Draw a sphere dividing a tetrahedron into 4 equal parts
  initSphere();

  // Load shaders and initialize attribute buffers
  program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);
  
  // Set the lighting variables
  var ambientProductLoc = gl.getUniformLocation(program, "ambientProduct");
  gl.uniform4fv(ambientProductLoc, flatten(ambientProduct));
  var diffuseProductLoc = gl.getUniformLocation(program, "diffuseProduct");
  gl.uniform4fv(diffuseProductLoc, flatten(diffuseProduct));
  var specularProductLoc = gl.getUniformLocation(program, "specularProduct");
  gl.uniform4fv(specularProductLoc, flatten(specularProduct));
  var lightPositionLoc = gl.getUniformLocation(program, "lightPosition");
  gl.uniform4fv(lightPositionLoc, flatten(lightPosition));
  var shininessLoc = gl.getUniformLocation(program, "shininess");
  gl.uniform1f(shininessLoc, materialShininess);

  // Set the light position
  var lightPositionLoc = gl.getUniformLocation(program, "lightPosition");
  gl.uniform4fv(lightPositionLoc, flatten(lightPosition));

  // Create a buffer for the sphere's vertices and surface normals
  var vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  alldData = points.concat(normalsArray);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(alldData), gl.STATIC_DRAW);


  // Associate our shader variables with our data buffer
  var vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  // Surface normals
  var vNormal = gl.getAttribLocation(program, "vNormal");
  gl.vertexAttribPointer(vNormal, 4, gl.FLOAT, false, 0, points.length * sizeof['vec4']);
  gl.enableVertexAttribArray(vNormal);

  // Set the projection matrix (perspective in this case)
  var projectionMatrix = perspective(45, 1, 0.1, 10);
  var projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
  gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

  // Set the model-view matrix for 1 point view
  var modelViewMatrix = translate(0, 0, -6);
  var modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

  // Draw the sphere
  gl.clearColor(0., 0., 0., 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, points.length);

}

function initSphere() {
  points = [];
  var va = vec4(0.0, 0.0, -1.0, 1);
  var vb = vec4(0.0, 0.942809, 0.333333, 1);
  var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
  var vd = vec4(0.816497, -0.471405, 0.333333, 1);

  tetrahedron(va, vb, vc, vd, numTimesToSubdivide);
}

function triangle(a, b, c) {
  points.push(a, b, c);
  normalsArray.push(a, b, c);
}


function divideTriangle(a, b, c, count) {
  if (count === 0) {
    triangle(a, b, c);
  } else {
    var ab = normalize(mix(a, b, 0.5), true);
    var ac = normalize(mix(a, c, 0.5), true);
    var bc = normalize(mix(b, c, 0.5), true);

    --count;

    divideTriangle(a, ab, ac, count);
    divideTriangle(c, ac, bc, count);
    divideTriangle(b, bc, ab, count);
    divideTriangle(ab, bc, ac, count);
  }
}

function tetrahedron(a, b, c, d, n) {
  divideTriangle(a, b, c, n);
  divideTriangle(d, c, b, n);
  divideTriangle(a, d, b, n);
  divideTriangle(a, c, d, n);
}

