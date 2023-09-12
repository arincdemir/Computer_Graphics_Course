
window.onload = function init() {
    var canvas = document.getElementById("gl-canvas");
    var gl = WebGLUtils.setupWebGL(canvas);
    gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.viewport(0, 0, canvas.width, canvas.height);

    canvas.addEventListener("click", function (event) {
        var x = (event.clientX - canvas.width / 2) / (canvas.width / 2);
        var y = 1 - (event.clientY) / (canvas.width / 2)
        var p = vec2(x, y);
        gl.bufferSubData(gl.ARRAY_BUFFER, index * sizeof["vec2"], flatten(p));
        index++;
    })

    var vertices2 = [
        vec2(0, 0),
        vec2(1, 0),
        vec2(1, 1)
    ];
    var maxVerts = 1000;
    var index = 0;
    var numPoints = 0;

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, maxVerts * sizeof["vec2"], gl.STATIC_DRAW);
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    function render() {
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.POINTS, 0, maxVerts);
    }

    
    function update(){
        render();
        requestAnimationFrame(update);
    }

    update();
}