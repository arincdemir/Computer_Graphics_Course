var gl;
var theta = 0.0;
var disPosition;
var displacement = vec2(0, 0);
var speed = vec2(0.004, 0.003);

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
    disPosition = gl.getUniformLocation(program, "displacement");
    setInterval(render, 16);
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    displacement = add(displacement, speed);
    if (displacement[0] > 0.5 || displacement[0] < -0.5) {
        speed[0] = -speed[0];
    }
    if (displacement[1] > 0.5 || displacement[1] < -0.5) {
        speed[1] = -speed[1];
    }
    gl.uniform2fv(disPosition, displacement);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}