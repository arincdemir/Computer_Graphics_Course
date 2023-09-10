var gl;
var theta = 0.0;
var thetaPosition;

window.onload = function init() {
    var canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.viewport(0, 0, canvas.width, canvas.height);

    var vertices2 = [
        vec2(0, 0.5),
        vec2(0.5, 0),
        vec2(-0.5, 0),
        vec2(0, -0.5)
    ];

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices2), gl.STATIC_DRAW);
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    thetaPosition = gl.getUniformLocation(program, "theta");
    setInterval(render, 16);
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    theta += 0.05;
    gl.uniform1f(thetaPosition, theta);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}