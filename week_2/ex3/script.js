var black = vec4(0.0, 0.0, 0.0, 1.0)
var red = vec4(1.0, 0.0, 0.0, 1.0)
var yellow = vec4(1.0, 1.0, 0.0, 1.0)
var green = vec4(0.0, 1.0, 0.0, 1.0)
var cyan = vec4(0.0, 1.0, 1.0, 1.0)
var blue = vec4(0.0, 0.0, 1.0, 1.0)
var magenta = vec4(1.0, 0.0, 1.0, 1.0)
var white = vec4(1.0, 1.0, 1.0, 1.0)

colors = [black, red, yellow, green, cyan, blue, magenta, white]


window.onload = function init() {
    var canvas = document.getElementById("gl-canvas");
    var clearButton = document.getElementById("clear-button");
    var clearColorSelector = document.getElementById("clear-color");
    var drawColorSelector = document.getElementById("draw-color");

    var gl = WebGLUtils.setupWebGL(canvas);
    gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.viewport(0, 0, canvas.width, canvas.height);

    var maxVerts = 1000;
    var index = 0;
    var numPoints = 0;

    canvas.addEventListener("click", function (event) {
        var x = (event.clientX - canvas.width / 2) / (canvas.width / 2);
        var y = 1 - (event.clientY) / (canvas.width / 2)
        var p = vec2(x, y);
        gl.bufferSubData(gl.ARRAY_BUFFER, index * sizeof["vec2"], flatten(p));
        var currentColor = colors[drawColorSelector.selectedIndex];
        gl.bufferSubData(gl.ARRAY_BUFFER, maxVerts * sizeof["vec2"] + index * sizeof["vec4"], flatten(currentColor));
        index++;
        numPoints++;
    })

    clearButton.addEventListener("click", function (event) {
        gl.bufferData(gl.ARRAY_BUFFER,  maxVerts * (sizeof["vec2"] + sizeof["vec4"]), gl.STATIC_DRAW);
        index = 0;
        numPoints = 0;
        var selectedColor = colors[clearColorSelector.selectedIndex];
        gl.clearColor(selectedColor[0], selectedColor[1], selectedColor[2], selectedColor[3]);
        gl.clear(gl.COLOR_BUFFER_BIT);
    })
    
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, maxVerts * (sizeof["vec2"] + sizeof["vec4"]), gl.STATIC_DRAW);
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, maxVerts * sizeof["vec2"]);
    gl.enableVertexAttribArray(vColor);
    
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